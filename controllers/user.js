// Importation du modèle User
const User = require('../models/user')
// Package de cryptage 
const bcrypt = require('bcrypt') 
// Package pour génerer et vérifier les token 
const jwt = require('jsonwebtoken')
// Package pour gérer variables d'environnement
require('dotenv').config()
// Package pour renforcer les mdp
var passwordValidator = require('password-validator');
// Create a schema
var schemaMDP = new passwordValidator();
// Add properties to it
schemaMDP
.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(2)                                // Must have at least 2 digits
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

// Inscription
exports.signup = (req, res, next) => {
    // Si le mot de passe entré respecte les propriétes du schéma schemaMDP
    if(schemaMDP.validate(req.body.password) === true) {
        // On crypte ce mot de passe
        bcrypt.hash(req.body.password, 10)
        .then(hash => {
            // On crée une variable user ayant un modèle User
            const user = new User({
                email: req.body.email,
                password: hash
            });
            // On enregistre le nouvel objet créé dans la BDD
            user.save()
            .then(() => res.status(201).json({ message: 'Utilisateur créé !' })) 
            .catch(error => res.status(400).json({ error })); 
        })
        .catch(error => res.status(500).json({ error })); 
    }else {
        try {
            // Détail des erreurs présentes dans ce mot de passe
            console.log(schemaMDP.validate(req.body.password, { details: true }));
            console.log("Veuillez choisir un mot de passe sécurisé.")
            res.status(400).json({ message: 'Mot de passe incorret !' })
        }catch {
            res.status(500)
        }

    }
};

// Connexion
exports.login = (req, res, next) => {
    // On recherche un objet ayant l'email de la requête dans la BDD
    User.findOne({ email: req.body.email })
       .then(user => {
           // Si cet e-mail n'est pas enregistré dans la BDD
           if (!user) {
               // Alors on renvoie un message d'erreur
               return res.status(401).json({ error: 'Paire login/mot de passe incorrecte' }); 
           }
           // Si cet e-mail est enregistré dans la BDD
           // Alors on compare le mdp enregistré dans la BDD avec le mdp tapé
           bcrypt.compare(req.body.password, user.password)
               .then(valid => {
                   // Si le mdp tapé est incorrect, alors on renvoie un mssg d'erreur
                   if (!valid) {
                       return res.status(401).json({ error: 'Paire login/mot de passe incorrecte'}); 
                   }
                   // Si le mdp tapé est correct, alors on renvoie un objet avec l'id et un token
                   res.status(200).json({ 
                       userId: user._id,
                       // On génere un token avec jwt
                       token: jwt.sign(
                           { userId: user._id },
                           // Clé secrète pour signer le token (à recupérer dans .env)
                           process.env.MDP_TOKEN, 
                           // Durée de validité du token
                           { expiresIn: '24h' }
                       )
                   });
               })
               // S'il y a un problème lors du bcrypt compare alors le catch est lancé
               .catch(error => res.status(500).json({ error })); 
       })
       // S'il y a un problème lors du User.findOne alors leqzd catch est lancé
       .catch(error => res.status(500).json({ error })); 
};