const mongoose = require('mongoose')
require('dotenv').config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('[resource-service] MongoDB conectado')
  } catch (err) {
    console.error('[resource-service] Erro ao conectar MongoDB:', err.message)
    process.exit(1)
  }
}

module.exports = connectDB