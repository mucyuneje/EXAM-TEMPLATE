import jwt from 'jsonwebtoken'
import cfg from '../config/config.js'
import User from '../models/User.js'

export async function protect(req, res, next) {
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
