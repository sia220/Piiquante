// Création routeur
const express = require('express');
const router = express.Router();
// On importe le middleware d'authentification
const auth = require('../middleware/auth');
// On importe le middleware multer
const multer = require('../middleware/multer-config');
// On importe le contrôleur
const saucesCtrl = require('../controllers/sauces');

router.get('/', auth, saucesCtrl.getAllSauces);
router.post('/', auth, multer, saucesCtrl.createSauce);
router.get('/:id',auth, saucesCtrl.getOneSauce);
router.put('/:id',auth, multer, saucesCtrl.modifySauce);
router.delete('/:id',auth, saucesCtrl.deleteSauce);
router.post('/:id/like',auth, saucesCtrl.likeSauce);

// On exporte le routeur
module.exports = router;