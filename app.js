const express = require('express')
const app = express()
const mongoose = require('mongoose')
const path = require('path');

// On importe les routeurs
const saucesRoutes = require('./routes/sauces') 
const userRoutes = require('./routes/user');

// Connexion à mongoDB (la base de données)
mongoose.connect('mongodb+srv://user:user@cluster0.kdwhose.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
{   useNewUrlParser : true,
    useUnifiedTopology : true})
    .then(() => console.log('Connexion à MongoDB réussie'))
    .catch(() => console.log('Connexion à MongoDB échouée'))
  
// J'autorise les requêtes entre le back et le front    
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Ce middleware intercepte les requêtes ayant comme Content-Type application/json et met à disposition leur body directement sur l'objet req
app.use(express.json())

// Nos routes
app.use('/api/sauces', saucesRoutes)
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app





