const multer = require('multer')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs').promises
const slugify = require('slugify')

// Dictionnaires des types MIME pour la conversion en format WebP
const MIME_TYPES = {
  'image/jpg': 'webp',
  'image/jpeg': 'webp',
  'image/png': 'webp',
  'image/webp': 'webp'
}

// Configuration de Multer
// Création d'un objet de stockage en mémoire pour multer (RAM)
const storage = multer.memoryStorage()

// Middleware multer qui indique à multer d'utiliser le stockage en mémoire pour gérer les fichiers. On lui indique aussi qu'il n'y a qu'une image avec une clé nommée 'image'.
const upload = multer({ storage }).single('image')

// Middleware pour redimensionner l'image à l'aide de la bibliothèque sharp
const resizeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error('Aucun fichier à redimensionner.')
    }    

    // Redimensionnement de l'image
    const resizedBuffer = await sharp(req.file.buffer).resize({ width: 400 }).toBuffer()

    // Compression de l'image au format WebP
    const quality = 20
    const compressedBuffer = await sharp(resizedBuffer).webp({ quality: quality }).toBuffer()

    // Normalisation du nom original de l'image et création d'un Slug pour supprimer les caractères indésirables
    const normalizedOriginalName = req.file.originalname.normalize('NFD')
    const slug = slugify(normalizedOriginalName, { lower: true })

    // Création du nom de fichier avec le Slug et l'horodatage
    const filename = `${slug}_${Date.now()}.webp`;
    const imagePath = path.join(__dirname, '../images', filename)

    // Mise à jour de la mémoire tampon avec l'image compressée
    req.file.buffer = compressedBuffer

    // Ecriture du fichier compressé dans le dossier images
    await fs.writeFile(imagePath, req.file.buffer)

    // Mise à jours du nom de fichier dans la requête
    req.file.filename = filename

    // Poursuite du flux de la requête
    next();
  } catch (error) {
    // En cas d'erreur renvoi d'un message d'erreur
    next(error)
  }
}

// Exportation des middlewares pour le téléchargement et la transformation d'images
module.exports = { upload, resizeImage }
