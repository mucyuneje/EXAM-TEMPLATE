const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const ctrl = require('../controllers/reportController')

router.use(protect)

router.get('/room-occupancy', ctrl.roomOccupancy)
router.get('/guest-list', ctrl.guestList)
router.get('/booking-summary', ctrl.bookingSummary)
router.get('/payment-ledger', ctrl.paymentLedger)
router.get('/guest-statement', ctrl.guestStatement)
router.get('/daily-revenue', ctrl.dailyRevenue)

module.exports = router
