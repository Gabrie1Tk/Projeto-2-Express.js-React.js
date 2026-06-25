const express      = require('express')
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
app.listen(PORT, () => {
  console.log(`[auth-service] Rodando na porta ${PORT}`)
})