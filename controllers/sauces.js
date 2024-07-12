const Sauce = require('../models/sauce')
// Package qui nous permettra de supprimer des fichiers 
const fs = require('fs');

exports.getAllSauces = (req, res, next) => {
    // On renvoie un tableau comprenant tous les objets ayant un modèle Sauce stockés dans la BDD
    Sauce.find()
    .then((sauces) => {res.status(200).json(sauces); })
    .catch((error) => {res.status(400).json({ error: error});});
}

exports.createSauce = (req, res, next) => {
    // On convertit la string JSON en objet pour pouvoir accéder à ses propriétés
   const sauceObject = JSON.parse(req.body.sauce);
   delete sauceObject._id; 
   // On le supprime pour éviter qu'un user envoie l'userId d'un autre user
   delete sauceObject._userId;
   // On créé une variable sauce ayant un modèle Sauce
   const sauce = new Sauce({
       ...sauceObject,
       likes : 0,
       dislikes : 0,
       userId: req.auth.userId,
       imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
   });
   // On enregistre le nouvel objet créé dans la BDD
   sauce.save()
  .then(() => { res.status(201).json({message: 'Objet enregistré !'})}) 
  .catch(error => { res.status(400).json( { error })}) 
}

exports.getOneSauce = (req, res, next) => {
    // On renvoie l'objet stocké dans la BDD suivant un modèle Sauce qui a le même ID que le paramètre de la requête grâce à la méthode findOne
    Sauce.findOne({_id: req.params.id})
    .then((sauce) => {res.status(200).json(sauce);}) 
    .catch((error) => {res.status(404).json({ error: error});});  
}

exports.modifySauce = (req, res, next) => {
    // On récupère le contenu de la requête en vérifiant si l'image a été màj ou pas
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    // On n'utilise pas l'userId de la requête par sécurité 
    delete sauceObject._userId;
    // On recherche l'objet stocké dans la BDD suivant un modèle Sauce qui a le même ID que le paramètre de la requête grâce à la méthode findOne
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            // On vérifie que l'userId de la BDD n'est pas différent de celui du token 
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message : 'Unauthorized request'}); 
            } else {
                // On modifie l'objet ayant l'id passé dans le premier argument et on place ses nouvelles données dans le deuxieme argument
                Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Objet modifié!'})) 
                .catch(error => res.status(400).json({ error })); 
            }
        })
        .catch((error) => {
            res.status(404).json({ error }); 
        });
};

exports.deleteSauce = (req, res, next) => {
    // On recherche l'objet stockée dans la BDD suivant un modèle Sauce qui a le même ID que le paramètre de la requête grâce à la méthode findOne
    Sauce.findOne({ _id: req.params.id})
        .then(sauce => {
            // On compare l'userId de la BDD avec celui de la requête
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'}); 
            } else {
                // On récupère le nom du fichier depuis la BDD
                const filename = sauce.imageUrl.split('/images/')[1];
                // Cette méthode permet de supprimer le fichier spécifié du dossier images
                fs.unlink(`images/${filename}`, () => {
                    // L'objet a supprimé de la BDD est celui ayant l'id de la requête
                    Sauce.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Objet supprimé !'})}) 
                        .catch(error => res.status(400).json({ error })); 
                });
            }
        })
        .catch( error => {
            res.status(404).json({ error }); 
        });
};

exports.likeSauce = (req, res, next) => {
    // On cherche la sauce dans la BDD grâce à l'id de l'url
    Sauce.findOne({ _id: req.params.id})
    .then((sauce) => {
        if (req.auth.userId != req.body.userId) {
            res.status(401).json({ message : 'Not authorized'}); 
        } else {
            if (req.body.like === -1) {
                let totalDislikes = Number(sauce.dislikes) + 1
                sauce.usersDisliked.push(req.auth.userId)
                const usersDisliked = sauce.usersDisliked  // ou +req.body.userId
                // On modifie l'objet ayant l'id passé dans le premier argument et on place ses nouvelles données dans le deuxieme argument
                Sauce.updateOne({ _id: req.params.id}, {
                    $set: {
                        dislikes: totalDislikes ,
                        usersDisliked: usersDisliked ,
                        _id: req.params.id
                    }
                })
                .then(() => res.status(200).json({message : 'Objet modifié!'})) 
                .catch(error => res.status(400).json({ error })); 
            } 
            if (req.body.like === 0)  {
                if (sauce.usersLiked.includes(req.auth.userId)) {
                    let totalLikes = Number(sauce.likes) - 1
                    let listeUsersLiked = [];
                    for (let i = 0; i < sauce.usersLiked.length; i++) {
                        if (sauce.usersLiked[i] !== req.auth.userId) {
                            listeUsersLiked.push(sauce.usersLiked[i]);
                        }
                    }
                    // On modifie l'objet ayant l'id passé dans le premier argument et on place ses nouvelles données dans le deuxieme argument
                    Sauce.updateOne({ _id: req.params.id}, {
                        $set: {
                            likes: totalLikes ,
                            usersLiked: listeUsersLiked ,
                            _id: req.params.id
                        }
                    })
                    .then(() => res.status(200).json({message : 'Objet modifié!'})) 
                    .catch(error => res.status(400).json({ error })); 
                }
                if (sauce.usersDisliked.includes(req.auth.userId)){
                    let totalDislikes = Number(sauce.dislikes) - 1
                    let listeUsersDisliked = [];
                    for (let i = 0; i < sauce.usersDisliked.length; i++) {
                        if (sauce.usersDisliked[i] !== req.auth.userId) {
                            listeUsersDisliked.push(sauce.usersDisliked[i]);
                        }
                    }
                    // On modifie l'objet ayant l'id passé dans le premier argument et on place ses nouvelles données dans le deuxieme argument
                    Sauce.updateOne({ _id: req.params.id}, {
                        $set: {
                            dislikes: totalDislikes ,
                            usersDisliked: listeUsersDisliked ,
                            _id: req.params.id
                        }
                    })
                    .then(() => res.status(200).json({message : 'Objet modifié!'})) 
                    .catch(error => res.status(400).json({ error })); 
                }
            }
            if (req.body.like === 1) {
                let total = Number(sauce.likes) + 1
                sauce.usersLiked.push(req.auth.userId) // ou +req.body.userId
                let utilisateurs = sauce.usersLiked
                // On modifie l'objet ayant l'id passé dans le premier argument et on place ses nouvelles données dans le deuxieme argument
                Sauce.updateOne({ _id: req.params.id}, {
                    $set: {
                        likes: total,
                        usersLiked:  utilisateurs,
                        _id: req.params.id
                    }
                })
                .then(() => res.status(200).json({message : 'Objet modifié!'})) 
                .catch(error => res.status(400).json({ error })); 
            }
        }
    })
    .catch(error => res.status(404).json({ error })); 
}




       
           
           
        
