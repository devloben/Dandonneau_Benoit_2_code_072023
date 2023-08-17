const Book = require('../models/Book.js')
const fs = require('fs')

exports.getBooks = async (req, res, next) => {
  try {
    // Recherche de tous les livres dans la BD
    const books = await Book.find()

    // Réponse réussie avec la liste des livres
    res.status(200).json(books);

    // Erreur lors de la récupération des livres
  } catch (error) {
    res.status(400).json({ error })
  }
}

exports.getBestBooks = async (req, res, next) => {
  try {
    // Recherche des trois livres ayant la meilleurs moyenne dans la BD
    // Les résultats sont triés par ordre décroissant 
    const books = await Book.find().sort({ averageRating: -1 }).limit(3)

    // Réponse réussie avec la liste des livres ayant la meilleures moyenne
    res.status(200).json(books)

    // Erreur lors de la récupération des livres ayant la meilleures moyenne
  } catch (error) {
    res.status(400).json({ error })
  }
}

exports.getBook = async (req, res, next) => {
  try {
    // Recherche d'un livre dans la BD en fonction de l'ID fourni dans les paramètres de la requête
    const book = await Book.findOne({ _id: req.params.id })

    // Si un livre est trouvé : réponse réussie avec les détails du livre
    if (book) {
      res.status(200).json(book)
    }
    // Si aucun livre n'est trouvé : réponse indiquant que le livre n'existe pas
  } catch (error) {
    res.status(404).json({ error: 'Livre non trouvé' })
  }
}

exports.createBook = async (req, res, next) => {
  try{
    // Construction de l'objet JSON du livre à partir de la requête
    // Suppression des propriétés inutiles
    const bookObject = JSON.parse(req.body.book)
    delete bookObject._id
    delete bookObject._userId

    // Création d'une nouvelle instace du modèle Book avec les données du livre et les informations de l'utilisateur
    const book = new Book({
      ...bookObject, 
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })

    // Sauvegarde du livre dans la BD
    await book.save()

    // Réponse réussie avec un message confirmant la création du livre
    return res.status(201).json({ message: 'Livre enregistré !' })

    // Erreur lors de la création du livre avec renvoi d'un message d'erreur
  } catch (error) {
    res.status(400).json({ error })
  }
}

exports.rateBook = async (req, res, next) => {
  try {
    // Récupération de l'identifiant du livre, de l'identifiant de l'utilisateur si il est connecté et de la note fournie dans la requête
    const bookId = req.params.id
    const userId = req.auth ? req.auth.userId : null
    const rating = req.body.rating 

    // Recherche du livre dans la BD
    const book = await Book.findOne({ _id: bookId })
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé !'})
    }
    
    if (userId) {
      // Vérification si l'utilisateur a déjà noté le livre
      const userRating = book.ratings.find(rate => rate.userId === userId)
      if (userRating) {
        return res.status(401).json({ message: 'Le livre a déjà été noté par l\'utilisateur'})
      }
      
      // Ajout d'une nouvelle note
      const newRating = {
      userId: userId,
      grade: rating
    }
    book.ratings.push(newRating)

    // Calcul de la moyenne en JavaScript
    const totalRatings = book.ratings.reduce((total, rate) => total + rate.grade, 0)
    const newAverageRating = totalRatings / book.ratings.length
    book.averageRating = newAverageRating.toFixed(1)

    // Sauvegarde de la nouvelle moyenne dans la BD
    await book.save()

    // Réponse réussie avec les détails du livre
    res.status(201).json(book)
    } else {
      // Erreur si l'utilisateur n'est pas connecté
      res.status(401).json({ message: 'Vous devez être connecté pour noter le livre'})
    }
  } catch (error) {
    // En cas d'une erreur d'une autre type renvoi d'un message d'erreur
    res.status(500).json({ error: 'Une erreur est survenue lors de la notation du livre' })
  }
}

exports.updateBook = async (req, res, next) => {
  try {
    // Récupération de la requête contenant la mise à jour du livre en tenant compte de la présence d'une nouvelle image.
    const bookObject = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        }
      : { ...req.body }
    delete bookObject._userId

    // Recherche d'un livre dans la BD en fonction de l'ID fourni dans les paramètres de la requête
    const book = await Book.findOne({ _id: req.params.id })

    // Si le livre n'existe pas, renvoi d'un message d'erreur
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' })
    }

    // Si l'utilisateur n'est pas le créateur du livre, renvoi d'un message d'erreur
    if (book.userId != req.auth.userId) {
      return res.status(401).json({ message: 'Non autorisé !' })
    }

    // Si une nouvelle image est présente et qu'il y a déjà une image dans la BD, supprime l'ancienne
    if (req.file && book.imageUrl) {
      const filename = book.imageUrl.split('/images/')[1]
      fs.unlink(`images/${filename}`, (err) => {
        if (err) {
          console.error('Erreur lors de la suppression du fichier :', err)
        } else {
          console.log('Fichier supprimé avec succès')
        }
      })
    }

    // Définition de l'objet qui permettra de mettre à jour la BD. Prend en compte la nouvelle image si présente.
    const updatedData = { ...bookObject, _id: req.params.id }
    if (req.file) {
      updatedData.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    }

    // Enregistrement de la mise à jour du livre dans la BD
    await Book.updateOne({ _id: req.params.id }, updatedData)

    // Réponse réusssie avec message de confirmation
    res.status(200).json({ message: 'Livre modifié !' })

  } catch (error) {
    // Erreur, renvoi d'un message d'erreur
    res.status(400).json({ error })
  }
}


exports.deleteBook = async (req, res, next) => {
  try {
    // Recherche d'un livre dans la BD en fonction de l'ID fourni dans les paramètres de la requête
    const book = await Book.findOne({ _id: req.params.id })

    // Vérification de l'éxistance du livre
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' })
    }

    // Vérification si l'utilisateur à la droit de supprier le livre
    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ message: 'Non autorisé !' })
    }

    // Extrction du nom du fichier image
    const filename = book.imageUrl.split('/images/')[1]

    // Suppression du fichier image correspondant
    fs.unlink(`images/${filename}`, (err) => {
      if (err) {
        console.error('Erreur lors de la suppression du fichier :', err)
      } else {
        console.log('Fichier supprimé avec succès')
      }
    })

    // Suppression du livre de la BD
    await Book.deleteOne({ _id: req.params.id })

    // Réponse réussie, renvoi d'un message de confirmation
    res.status(200).json({ message: 'Livre supprimé' })

  } catch (error) {
    // Erreur, renvoi d'un message d'erreur
    res.status(500).json({ error })
  }
}