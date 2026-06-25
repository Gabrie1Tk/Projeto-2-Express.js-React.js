const express                         = require('express')
const jwt                             = require('jsonwebtoken')
const { body, param, validationResult } = require('express-validator')
const Show                            = require('../models/Show')
const redis                           = require('../config/redis')
require('dotenv').config()

const router = express.Router()

// Middleware de autenticação
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Token não fornecido.' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado.' })
  }
}

// Publica evento no Redis
const publishEvent = async (event, data) => {
  await redis.publish('shows-events', JSON.stringify({ event, data }))
}

// Regras de validação e sanitização para inserção e atualização
const showRules = [
  body('name')
    .trim()
    .escape()
    .notEmpty().withMessage('Nome é obrigatório.')
    .isLength({ max: 200 }).withMessage('Nome muito longo.'),
  body('genres')
    .optional()
    .isArray().withMessage('Gêneros deve ser um array.'),
  body('genres.*')
    .trim()
    .escape(),
  body('status')
    .optional()
    .trim()
    .escape()
    .isIn(['Running', 'Ended', 'In Development'])
    .withMessage('Status inválido.'),
  body('premiered')
    .optional({ checkFalsy: true })
    .trim()
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Data deve estar no formato AAAA-MM-DD.'),
  body('rating')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 10 }).withMessage('Nota deve ser entre 0 e 10.'),
  body('summary')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 2000 }).withMessage('Descrição muito longa.'),
  body('image')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('URL da imagem inválida.')
]

// Valida ObjectId do MongoDB no parâmetro :id
const idRule = [
  param('id')
    .isMongoId().withMessage('ID inválido.')
]

// GET /shows — busca com cache
router.get('/', authenticate, async (req, res) => {
  try {
    const { name } = req.query
    const cacheKey = `shows:${name || 'all'}`

    const cached = await redis.get(cacheKey)
    if (cached) {
      console.log('[resource-service] Resultado do cache')
      return res.json(JSON.parse(cached))
    }

    const filter = name ? { name: { $regex: name, $options: 'i' } } : {}
    const shows = await Show.find(filter).sort({ createdAt: -1 })

    await redis.setEx(cacheKey, 30, JSON.stringify(shows))
    console.log(`[resource-service] Busca: "${name || 'todos'}"`)
    res.json(shows)
  } catch (err) {
    console.error('[resource-service] Erro na busca:', err.message)
    res.status(500).json({ error: 'Erro interno.' })
  }
})

// POST /shows — inserção
router.post('/', authenticate, showRules, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg })
  }

  try {
    const { name, genres, status, premiered, rating, summary, image } = req.body

    const show = await Show.create({
      name, genres, status, premiered, rating, summary, image,
      owner: String(req.user.id)
    })

    await redis.del('shows:all')
    await publishEvent('show.criado', show)
    console.log(`[resource-service] Inserção: ${show.name}`)
    res.status(201).json(show)
  } catch (err) {
    console.error('[resource-service] Erro na inserção:', err.message)
    res.status(500).json({ error: 'Erro interno.' })
  }
})

// PUT /shows/:id — atualização
router.put('/:id', authenticate, idRule, showRules, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg })
  }

  try {
    const show = await Show.findById(req.params.id)
    if (!show) return res.status(404).json({ error: 'Show não encontrado.' })

    if (show.owner !== String(req.user.id)) {
      return res.status(403).json({ error: 'Acesso negado.' })
    }

    const { name, genres, status, premiered, rating, summary, image } = req.body

    const updated = await Show.findByIdAndUpdate(
      req.params.id,
      { name, genres, status, premiered, rating, summary, image },
      { new: true }
    )

    await redis.del('shows:all')
    await publishEvent('show.atualizado', updated)
    console.log(`[resource-service] Atualização: ${updated.name}`)
    res.json(updated)
  } catch (err) {
    console.error('[resource-service] Erro na atualização:', err.message)
    res.status(500).json({ error: 'Erro interno.' })
  }
})

// DELETE /shows/:id — exclusão
router.delete('/:id', authenticate, idRule, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg })
  }

  try {
    const show = await Show.findById(req.params.id)
    if (!show) return res.status(404).json({ error: 'Show não encontrado.' })

    if (show.owner !== String(req.user.id)) {
      return res.status(403).json({ error: 'Acesso negado.' })
    }

    await Show.findByIdAndDelete(req.params.id)
    await redis.del('shows:all')
    await publishEvent('show.excluido', { id: req.params.id })
    console.log(`[resource-service] Exclusão: ${show.name}`)
    res.json({ message: 'Show excluído com sucesso.' })
  } catch (err) {
    console.error('[resource-service] Erro na exclusão:', err.message)
    res.status(500).json({ error: 'Erro interno.' })
  }
})

module.exports = router