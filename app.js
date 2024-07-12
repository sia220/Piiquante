const express = require('express')
const bodyParser = require('body-parser') 
const mongoose = require('mongoose')
const helmet = require('helmet')
// Package permettant de limiter le nombre de requêtes sur un temps donné
const rateLimit = require('express-rate-limit')
require('dotenv').config()

// On importe les routeurs
const saucesRoutes = require('./routes/sauces') 
const userRoutes = require('./routes/user');

const path = require('path');

// Connexion à mongoDB (la base de données)
mongoose.connect(process.env.CLE_MONGO,
  {
    useNewUrlParser : true,
    useUnifiedTopology : true
  })
  .then(() => console.log('Connexion à MongoDB réussie'))
  .catch(() => console.log('Connexion à MongoDB échouée'));
  
const app = express()

app.use(helmet.crossOriginResourcePolicy({ policy : "cross-origin" })) ;

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.
})
// Apply the rate limiting middleware to all requests.
app.use(limiter)

// J'autorise les requêtes entre le back et le front    
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Ce middleware intercepte les requêtes ayant un Content-Type json et met à disposition leur contenu dans req.body
app.use(bodyParser.json()) 

// Nos routes
app.use('/api/sauces', saucesRoutes)
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app