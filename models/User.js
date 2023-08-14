const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

// Définition du schéma de données pour l'utilisateur
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true }, 
  password: { type: String, required: true }
})

// Utilisation du plugin mongoose-unique-validator pour la validation des champs uniques
userSchema.plugin(uniqueValidator)

// Exportation du modèle "User" basé sur le schéma défini
module.exports = mongoose.model('User', userSchema)
