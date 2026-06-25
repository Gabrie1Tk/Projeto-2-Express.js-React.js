const express      = require('express')
const https        = require('https')
const fs           = require('fs')
const path         = require('path')
const cors         = require('cors')
const helmet       = require('helmet')
const compression  = require('compression')
const morgan       = require('morgan')
const connectDB    = require('./config/db')
require('dotenv').config()

const showsRoutes = require('./routes/shows')

const app = express()

app.use(helmet())
app.use(cors())
app.use(compression())
app.use(morgan('[:date[iso]] :method :url :status :response-time ms'))
app.use(express.json())

connectDB()

app.use('/shows', showsRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'resource-service ok' })
})

const PORT = process.env.PORT || 3002

const certPath = path.join(__dirname, '..', 'certs')
const sslOptions = {
  key:  fs.readFileSync(path.join(certPath, 'key.pem')),
  cert: fs.readFileSync(path.join(certPath, 'cert.pem')),
}

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`[resource-service] Rodando em HTTPS na porta ${PORT}`)
})