const jwt = require('jsonwebtoken')
const cfg = require('../config/config')
const User = require('../models/User')

async function protect(req, res, next) {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' })
  }

  try {
    const decoded = jwt.verify(token, cfg.jwtSecret)
    req.user = await User.findById(decoded.id)
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' })
    }
    next()
  } catch {
    return res.status(401).json({ message: 'Not authorized, invalid token' })
  }
}

module.exports = { protect }
