const express = require('express')
const mongoose = require('mongoose')
const path = require('path')

const userRoutes = require('./routes/user')
const bookRoutes = require('./routes/book')

// Chargement des variables d'environnement depuis le fichier .env
require('dotenv').config()

// Création d'une instance de l'application Express
const app = express()

// Connexion à la Base de Données MongoDB Atlas
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Configuration des en-têtes CORS pour permettre les requêtes depuis n'importe quelle origine
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Analyse des données JSON dans les requêtes
app.use(express.json())

// Utilisation des routes définies pour les livres et l'authentification
app.use('/api/books', bookRoutes)
app.use('/api/auth', userRoutes)

// Gestion des fichiers statiques pour les images
app.use('/images', express.static(path.join(__dirname, 'images')))

// Gestionnaire d'erreur global pour capturer toutes les erreurs non gérées
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Une erreur est survenue sur le serveur' });
});

// Export de l'application Express pour utilisation dans d'autres fichiers
module.exports = app