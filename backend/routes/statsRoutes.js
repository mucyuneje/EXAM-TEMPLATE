import { Router } from 'express'
import { totalCars, activePackages, revenueToday, totalRevenue } from '../controllers/statsController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)
router.get('/total-cars', totalCars)
router.get('/active-packages', activePackages)
router.get('/revenue-today', revenueToday)
router.get('/total-revenue', totalRevenue)

export default router
