const express          = require('express')
const https            = require('https')
const fs               = require('fs')
const path             = require('path')
const { WebSocketServer } = require('ws')
const cors             = require('cors')
const compression      = require('compression')
const morgan           = require('morgan')
require('dotenv').config()

const healthRoutes  = require('./routes/health')
const startConsumer = require('./models/consumer')

const app    = express()

app.use(cors())
app.use(compression())
app.use(morgan('[:date[iso]] :method :url :status :response-time ms'))
app.use(express.json())

app.use('/health', healthRoutes)

const PORT = process.env.PORT || 3003

const certPath = path.join(__dirname, '..', 'certs')
const sslOptions = {
  key:  fs.readFileSync(path.join(certPath, 'key.pem')),
  cert: fs.readFileSync(path.join(certPath, 'cert.pem')),
}

const server = https.createServer(sslOptions, app)
const wss    = new WebSocketServer({ server })

wss.on('connection', (ws) => {
  console.log('[notification-service] Cliente WebSocket conectado')
  ws.on('close', () => console.log('[notification-service] Cliente desconectado'))
})

startConsumer(wss)

server.listen(PORT, () => {
  console.log(`[notification-service] Rodando em HTTPS na porta ${PORT}`)
})