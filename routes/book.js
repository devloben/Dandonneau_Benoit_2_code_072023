const express = require('express')
const router = express.Router()

// Importation des middleware d'authentification et de gestion des images
const auth = require('../middleware/auth')
const { upload, resizeImage } = require('../middleware/multer-sharp')

// Importation du controlleur pour les livres
const bookCtrl = require('../controllers/book')

// Définition des routes pour les opérations sur les livres
router.get('/', bookCtrl.getBooks)                     // obtenir la liste des livres
router.get('/bestrating', bookCtrl.getBestBooks)       // obtenir les livres ayant la meilleure moyenne
router.get('/:id', bookCtrl.getBook)                   // obtenir les détails d'un livre
router.post('/', auth, upload, resizeImage, bookCtrl.createBook)  // Créer un nouveau livre
router.post('/:id/rating', auth, bookCtrl.rateBook)   // Noter un livre
router.put('/:id', auth, upload, resizeImage, bookCtrl.updateBook) // Mettre à jour un livre
router.delete('/:id', auth, bookCtrl.deleteBook)      // Supprimer un livre

// Exportation du routeur pour utilisation dans d'autres fichiers
module.exports = router
