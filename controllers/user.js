const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.signup = async (req, res, next) => {
  try {
    // Hashage du mot de passe en utilisant bcrypt
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    // Création d'un nouvel utilisateur avec le mot de passe hashé
    const user = new User({
      email: req.body.email,
      password: hashedPassword
    });

    // Sauvegarde du nouvel utilisateur dans la base de données
    await user.save()

    // Réponse réussie, renvoi d'un message de confirmation
    res.status(201).json({ message: 'Utilisateur créé !' })
  } catch (error) {
    // Erreur, renvoi d'un message d'erreur
    res.status(500).json({ error })
  }
}

// Connexion d'un utilisateur existant
exports.login = async (req, res, next) => {
  try {
    // Recherche de l'utilisateur dans la BD
    const user = await User.findOne({ email: req.body.email })

    // Si l'utilisateur n'existe pas, renvoi du message 'Non autorisé'
    if (user === null) {
      return res.status(401).json({ message: 'Couple identifiant/mot de passe incorrect' })
    }

    // Comparaison du mot de passe saisi avec le mot de passe hashé dans la BD
    const validPassword = await bcrypt.compare(req.body.password, user.password)

    // Si la mot de passe est invalide, renvoi du message 'Non autorisé'
    if (!validPassword) {
      return res.status(401).json({ message: 'Couple identifiant/mot de passe incorrect' })
    }

    // Génération d'un token d'authentification avec une durée de validité de 24h
    const token = jwt.sign(
      { userId: user._id },
      'RANDOM_TOKEN_SECRET',
      { expiresIn: '24h' }
    )

    // Réponse réussie, renvoi de l'ID de l'utilisateur et du token
    res.status(200).json({
      userId: user._id,
      token: token
    })
  } catch (error) {
    // Erreur, renvoi d'un message d'erreur du serveur
    res.status(500).json({ error })
  }
}
