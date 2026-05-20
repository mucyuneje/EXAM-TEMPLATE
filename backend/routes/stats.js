const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const ctrl = require('../controllers/statsController')

router.use(protect)

router.get('/available-rooms', ctrl.availableRooms)
router.get('/checked-in-guests', ctrl.checkedInGuests)
router.get('/revenue-today', ctrl.revenueToday)
router.get('/total-bookings', ctrl.totalBookings)

module.exports = router
