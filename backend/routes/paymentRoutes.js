import { Router } from 'express'
import { getAll, create, update, remove } from '../controllers/paymentController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)
router.get('/', getAll)
router.post('/', create)
router.put('/:id', update)
router.delete('/:id', remove)

export default router
