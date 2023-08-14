const jwt = require('jsonwebtoken')

// Middleware d'authentification basé sur JSON Web Token (JWT)
module.exports = (req, res, next) => {
  try {
    // Récupération du token depuis le header Authorization
    const token = req.headers.authorization.split(' ')[1]

    // Décodage du token en utilisant la clé secrète
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET')

    // Extraction de l'identifiant d'utilisateur du token décodé
    const userId = decodedToken.userId
    req.auth = {
      userId: userId
    }

    // Poursuite du flux de la requête
    next()

  } catch(error) {
    // En cas d'erreur de token ou de décodage, renvoi d'une réponse : non autorisé
    res.status(401).json({ error })
  }
} 
