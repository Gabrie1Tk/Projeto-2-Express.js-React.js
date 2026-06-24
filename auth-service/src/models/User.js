const pool = require('../config/db')

const User = {
  async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?', [email]
    )
    return rows[0]
  },

  async isTokenRevoked(token) {
    const [rows] = await pool.query(
      'SELECT * FROM token_blacklist WHERE token = ?', [token]
    )
    return rows.length > 0
  },

  async revokeToken(token) {
    await pool.query(
      'INSERT INTO token_blacklist (token) VALUES (?)', [token]
    )
  },
}

module.exports = User