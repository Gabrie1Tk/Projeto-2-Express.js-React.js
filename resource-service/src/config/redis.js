const redis = require('redis')
require('dotenv').config()

const client = redis.createClient({ url: process.env.REDIS_URL })

client.on('error', (err) => console.error('[resource-service] Redis erro:', err))
client.on('connect', () => console.log('[resource-service] Redis conectado'))

client.connect()

module.exports = client