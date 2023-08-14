const express = require('express')
const router = express.Router()

// Importation du controleur utilisateur
const userCtrl = require('../controllers/user')

// Définition des routes de création de compte (signup) et de connexion (login) des utilisateurs
router.post('/signup', userCtrl.signup)
router.post('/login', userCtrl.login)

// Exportation du routeur pour utilisation dans d'autres fichiers
module.exports = router
