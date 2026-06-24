const redis = require('redis')
require('dotenv').config()

const subscriber = redis.createClient({ url: process.env.REDIS_URL })

subscriber.on('error', (err) => console.error('[notification-service] Redis erro:', err))
subscriber.on('connect', () => console.log('[notification-service] Redis conectado'))

subscriber.connect()

module.exports = subscriber