const express       = require('express')
const http          = require('http')
const { WebSocketServer } = require('ws')
const cors          = require('cors')
require('dotenv').config()

const healthRoutes  = require('./routes/health')
const startConsumer = require('./models/consumer')

const app    = express()
const server = http.createServer(app)
const wss    = new WebSocketServer({ server })

app.use(cors())
app.use(express.json())
app.use('/health', healthRoutes)

wss.on('connection', (ws) => {
  console.log('[notification-service] Cliente WebSocket conectado')
  ws.on('close', () => console.log('[notification-service] Cliente desconectado'))
})

startConsumer(wss)

const PORT = process.env.PORT || 3003
server.listen(PORT, () => {
  console.log(`[notification-service] Rodando na porta ${PORT}`)
})