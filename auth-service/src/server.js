const express      = require('express')
const https        = require('https')
const fs           = require('fs')
const path         = require('path')
const cors         = require('cors')
const helmet       = require('helmet')
const compression  = require('compression')
const morgan       = require('morgan')
require('dotenv').config()

const authRoutes = require('./routes/auth')

const app = express()

app.use(helmet())
app.use(cors())
app.use(compression())
app.use(morgan('[:date[iso]] :method :url :status :response-time ms'))
app.use(express.json())

app.use('/auth', authRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'auth-service ok' })
})

const PORT = process.env.PORT || 3001

const certPath = path.join(__dirname, '..', 'certs')
const sslOptions = {
  key:  fs.readFileSync(path.join(certPath, 'key.pem')),
  cert: fs.readFileSync(path.join(certPath, 'cert.pem')),
}

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`[auth-service] Rodando em HTTPS na porta ${PORT}`)
})