import { Router } from 'express'
import { login, register, getSecurityQuestion, recoverPassword, getMe } from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.post('/login', login)
router.post('/register', register)
router.post('/security-question', getSecurityQuestion)
router.post('/recover-password', recoverPassword)
router.get('/me', protect, getMe)

export default router
