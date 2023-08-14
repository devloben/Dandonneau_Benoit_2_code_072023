const mongoose = require('mongoose')

// Définition du schéma de données pour un livre
const bookSchema = mongoose.Schema({ 
  userId : { type: String, required: true },        // Identifiant de l'utilisateur qui crée le livre (obligatoire)
  title : { type: String, required: true },         // Titre du livre (obligatoire)
  author: { type: String, required: true },         // Auteur du livre (obligatoire)
  imageUrl : { type: String, required: true },      // URL de l'image du livre (obligatoire)
  year : { type: Number, required: true },          // Année de publication du livre (obligatoire)
  genre : { type: String, required: true },         // Genre du livre (obligatoire)
  ratings : [{
    userId : { type: String, required: true },      // Identifiant de l'utilisateur qui note le livre (obligatoire)
    grade: { type: Number, required: true }         // Note attribuée au livre (obligatoire)
    }],
  averageRating: { type: Number, required: false }  // Moyennes des notes atribuées au livre (non obligatoire)
})

// Exportation du modèle "Book" basé sur le schéma défini
module.exports = mongoose.model('Book', bookSchema)
