const express    = require('express')
const bcrypt     = require('bcryptjs')
const jwt        = require('jsonwebtoken')
const rateLimit  = require('express-rate-limit')
const User       = require('../models/User')
const jwtConfig  = require('../config/jwt')

const router = express.Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' }
})

// POST /auth/login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' })
    }

    const user = await User.findByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas.' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    )

    console.log(`[auth-service] Login: ${user.email}`)
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } })

  } catch (err) {
    console.error('[auth-service] Erro no login:', err.message)
    res.status(500).json({ error: 'Erro interno do servidor.' })
  }
})

// POST /auth/logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(400).json({ error: 'Token não fornecido.' })
    }

    await User.revokeToken(token)
    console.log('[auth-service] Logout realizado.')
    res.json({ message: 'Logout realizado com sucesso.' })

  } catch (err) {
    console.error('[auth-service] Erro no logout:', err.message)
    res.status(500).json({ error: 'Erro interno do servidor.' })
  }
})

// GET /auth/verify
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido.' })
    }

    const revoked = await User.isTokenRevoked(token)
    if (revoked) {
      return res.status(401).json({ error: 'Token inválido.' })
    }

    const decoded = jwt.verify(token, jwtConfig.secret)
    res.json({ valid: true, user: decoded })

  } catch (err) {
    res.status(401).json({ error: 'Token inválido ou expirado.' })
  }
})

module.exports = router