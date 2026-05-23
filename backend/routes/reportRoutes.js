import { Router } from 'express'
import { serviceRecords, carList, paymentSummary, dailyRevenue, generateReceipt } from '../controllers/reportController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)
router.get('/service-records', serviceRecords)
router.get('/car-list', carList)
router.get('/payment-summary', paymentSummary)
router.get('/daily-revenue', dailyRevenue)
router.get('/receipt', generateReceipt)

export default router
