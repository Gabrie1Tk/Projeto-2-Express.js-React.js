const subscriber = require('../config/redis')

const startConsumer = async (wss) => {
  await subscriber.subscribe('shows-events', (message) => {
    console.log('[notification-service] Evento recebido:', message)

    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message)
      }
    })
  })

  console.log('[notification-service] Aguardando eventos do Redis...')
}

module.exports = startConsumer