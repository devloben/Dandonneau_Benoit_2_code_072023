const http = require('http')
const app = require('./app')

// Fonction pour normaliser le numéro de port en entier
const normalizePort = val => {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    return val
  }
  if (port >= 0) {
    return port
  }
  return false
}

// Obtention du numéro de port à partir des variables d'environnement ou utilisation d'un port par défaut
const port = normalizePort(process.env.PORT || `${process.env.PORT}`)
app.set('port', port)

// Fonction de gestion des erreurs liées au serveur
const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.')
      process.exit(1)
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.')
      process.exit(1)
      break;
    default:
      throw error
  }
}

// Création du serveur HTTP en utilisant l'application Express
const server = http.createServer(app)

// Ecoute de l'évènement 'listening' lorsque le serveur est en écoute
server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address()
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port
  console.log('Listening on ' + bind)
})

// Démarrage du serveur en écoutant sur le numéro de port spécifié
server.listen(port)