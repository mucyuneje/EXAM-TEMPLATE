import jwt from 'jsonwebtoken'
import cfg from '../config/config.js'
import User from '../models/User.js'

function signToken(id) {
  return jwt.sign({ id }, cfg.jwtSecret, { expiresIn: cfg.jwtExpiresIn })
}

export const register = async (req, res) => {
  try {
    const { username, password, securityQuestion, securityAnswer } = req.body
    const exists = await User.findOne({ username: username.toLowerCase().trim() })
    if (exists) return res.status(400).json({ message: 'Username already taken' })

    const user = await User.create({
      username: username.toLowerCase().trim(),
      password, securityQuestion, securityAnswer,
    })
    const token = signToken(user._id)
    res.status(201).json({ token, user })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

export const login = async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username: username.toLowerCase().trim() })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const match = await user.comparePassword(password)
    if (!match) return res.status(401).json({ message: 'Invalid credentials' })

    const token = signToken(user._id)
    res.json({ token, user })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

export const getSecurityQuestion = async (req, res) => {
  try {
    const { username } = req.body
    const user = await User.findOne({ username: username.toLowerCase().trim() })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ question: user.securityQuestion })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

export const recoverPassword = async (req, res) => {
  try {
    const { username, securityAnswer, newPassword } = req.body
    const user = await User.findOne({ username: username.toLowerCase().trim() })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const match = await user.compareSecurityAnswer(securityAnswer)
    if (!match) return res.status(400).json({ message: 'Security answer is incorrect' })

    user.password = newPassword
    await user.save()
    res.json({ message: 'Password recovered successfully' })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

export const getMe = async (req, res) => {
  res.json({ user: req.user })
}
