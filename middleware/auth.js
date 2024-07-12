// Importation du package JWT
const jwt = require('jsonwebtoken');
// Package permettant de gérer nos variables d'env
require('dotenv').config()

// Ce middleware extrait l'user id stocké dans le token et l'ajoute à la requête
module.exports = (req, res, next) => {
   try {
       // On récupère le token généré en le récupérant de l'entête de la req
       const token = req.headers.authorization.split(' ')[1];
       // On vérifie le token puis s'il est correct on renvoie son payload dans cette variable 
       const decodedToken = jwt.verify(token, process.env.MDP_TOKEN); 
       const userId = decodedToken.userId;
       // On stocke un objet auth dans req
       req.auth = {
           userId: userId
       };
    // On permet le passage au prochain middleware de la chaîne dans lequelle il sera placé
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};