const express      = require('express')
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
app.listen(PORT, () => {
  console.log(`[resource-service] Rodando na porta ${PORT}`)
})