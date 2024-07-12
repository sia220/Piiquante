// Multer facilite la gestion des fichiers reçus dans les requêtes
const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  // On indique où enregistrer les fichiers entrants
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  // On indique comment nommer les fichiers entrants
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({storage: storage}).single('image');