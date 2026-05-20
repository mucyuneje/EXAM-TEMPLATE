const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const auth = require('../controllers/authController')

router.post('/register', auth.register)
router.post('/login', auth.login)
router.post('/security-question', auth.getSecurityQuestion)
router.post('/recover', auth.recoverPassword)
router.get('/me', protect, auth.getMe)

module.exports = router
