const Booking = require('../models/Booking')
const Guest = require('../models/Guest')
const Room = require('../models/Room')
const Payment = require('../models/Payment')
const { generateInvoicePDF, generateReportPDF } = require('../utils/pdfGenerator')
const { generateReportXLSX } = require('../utils/xlsxGenerator')

// ── Room Occupancy Report ─────────────────────────────────
exports.roomOccupancy = async (req, res) => {
  try {
    const { date, format } = req.query
    const targetDate = date ? new Date(date) : new Date()

    const rooms = await Room.find().sort({ roomNumber: 1 })

    const rows = await Promise.all(rooms.map(async (room) => {
      const activeBooking = await Booking.findOne({
        roomId: room._id,
        status: { $in: ['Checked-in', 'Confirmed'] },
        checkInDate: { $lte: targetDate },
        checkOutDate: { $gte: targetDate },
      }).populate('guestId', 'fullName')

      return [
        room.roomNumber,
        room.roomType,
        room.pricePerNight,
        activeBooking ? 'Booked' : room.status,
        activeBooking?.guestId?.fullName || '',
        activeBooking ? new Date(activeBooking.checkInDate).toLocaleDateString('en-GB') : '',
        activeBooking ? new Date(activeBooking.checkOutDate).toLocaleDateString('en-GB') : '',
      ]
    }))

    const columns = ['Room No.', 'Type', 'Price/Night', 'Status', 'Guest', 'Check-in', 'Check-out']

    if (format === 'xlsx') {
      const buffer = await generateReportXLSX('Room Occupancy Report', columns, rows)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', 'attachment; filename=room-occupancy.xlsx')
      return res.send(buffer)
    }

    if (format === 'pdf') {
      const buffer = await generateReportPDF('Room Occupancy Report', columns, rows, null, req.user)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename=room-occupancy.pdf')
      return res.send(buffer)
    }

    res.json({ data: rows.map((r, i) => ({
      roomNumber: r[0], roomType: r[1], pricePerNight: r[2],
      status: r[3], guest: r[4], checkIn: r[5], checkOut: r[6],
    })) })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// ── Guest List Report ─────────────────────────────────────
exports.guestList = async (req, res) => {
  try {
    const { format } = req.query
    const guests = await Guest.find().sort({ createdAt: -1 })

    const rows = await Promise.all(guests.map(async (g) => {
      const bookings = await Booking.find({ guestId: g._id })
      const totalSpent = await Payment.aggregate([
        { $lookup: { from: 'bookings', localField: 'bookingId', foreignField: '_id', as: 'booking' } },
        { $unwind: '$booking' },
        { $match: { 'booking.guestId': g._id } },
        { $group: { _id: null, total: { $sum: '$amountPaid' } } },
      ])
      return [
        g.fullName, g.phone, g.email, g.idNumber,
        bookings.length, totalSpent[0]?.total || 0,
      ]
    }))

    const columns = ['Full Name', 'Phone', 'Email', 'ID No.', 'Bookings', 'Total Spent']

    if (format === 'xlsx') {
      const buffer = await generateReportXLSX('Guest List Report', columns, rows)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', 'attachment; filename=guest-list.xlsx')
      return res.send(buffer)
    }

    if (format === 'pdf') {
      const totals = [{ label: 'Total Guests', value: guests.length }]
      const buffer = await generateReportPDF('Guest List Report', columns, rows, totals, req.user)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename=guest-list.pdf')
      return res.send(buffer)
    }

    res.json({ data: rows.map((r) => ({
      fullName: r[0], phone: r[1], email: r[2], idNumber: r[3],
      bookings: r[4], totalSpent: r[5],
    })) })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// ── Booking Summary Report ────────────────────────────────
exports.bookingSummary = async (req, res) => {
  try {
    const { format } = req.query
    const bookings = await Booking.find()
      .populate('guestId', 'fullName')
      .populate('roomId', 'roomNumber')
      .sort({ checkInDate: -1 })

    const rows = bookings.map((b) => [
      b.bookingNumber,
      b.guestId?.fullName || '',
      b.roomId?.roomNumber || '',
      new Date(b.checkInDate).toLocaleDateString('en-GB'),
      new Date(b.checkOutDate).toLocaleDateString('en-GB'),
      b.totalAmount,
      b.status,
    ])

    const columns = ['Booking No.', 'Guest', 'Room', 'Check-in', 'Check-out', 'Amount', 'Status']

    if (format === 'xlsx') {
      const buffer = await generateReportXLSX('Booking Summary', columns, rows)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', 'attachment; filename=booking-summary.xlsx')
      return res.send(buffer)
    }

    if (format === 'pdf') {
      const total = bookings.reduce((s, b) => s + b.totalAmount, 0)
      const totals = [{ label: 'Total Amount', value: `${total.toLocaleString()} Rwf` }]
      const buffer = await generateReportPDF('Booking Summary', columns, rows, totals, req.user)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename=booking-summary.pdf')
      return res.send(buffer)
    }

    res.json({ data: bookings.map((b) => ({
      bookingNumber: b.bookingNumber,
      guest: b.guestId?.fullName || '',
      room: b.roomId?.roomNumber || '',
      checkInDate: b.checkInDate,
      checkOutDate: b.checkOutDate,
      amount: b.totalAmount,
      status: b.status,
    })) })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// ── Payment Ledger Report ─────────────────────────────────
exports.paymentLedger = async (req, res) => {
  try {
    const { format } = req.query
    const payments = await Payment.find()
      .populate({
        path: 'bookingId',
        select: 'bookingNumber',
        populate: { path: 'guestId', select: 'fullName' },
      })
      .sort({ paymentDate: -1 })

    const rows = payments.map((p) => [
      p.paymentNumber,
      p.bookingId?.bookingNumber || '',
      p.bookingId?.guestId?.fullName || '',
      p.amountPaid,
      p.paymentMethod,
      new Date(p.paymentDate).toLocaleDateString('en-GB'),
    ])

    const columns = ['Payment No.', 'Booking', 'Guest', 'Amount', 'Method', 'Date']

    if (format === 'xlsx') {
      const buffer = await generateReportXLSX('Payment Ledger', columns, rows)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', 'attachment; filename=payment-ledger.xlsx')
      return res.send(buffer)
    }

    if (format === 'pdf') {
      const total = payments.reduce((s, p) => s + p.amountPaid, 0)
      const totals = [{ label: 'Total Payments', value: `${total.toLocaleString()} Rwf` }]
      const buffer = await generateReportPDF('Payment Ledger', columns, rows, totals, req.user)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename=payment-ledger.pdf')
      return res.send(buffer)
    }

    res.json({ data: payments.map((p) => ({
      paymentNumber: p.paymentNumber,
      booking: p.bookingId?.bookingNumber || '',
      guest: p.bookingId?.guestId?.fullName || '',
      amount: p.amountPaid,
      paymentMethod: p.paymentMethod,
      paymentDate: p.paymentDate,
    })) })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// ── Guest Statement (with PDF invoice) ────────────────────
exports.guestStatement = async (req, res) => {
  try {
    const { guestId } = req.query
    if (!guestId) return res.status(400).json({ message: 'guestId is required' })

    const guest = await Guest.findById(guestId)
    if (!guest) return res.status(404).json({ message: 'Guest not found' })

    const bookings = await Booking.find({ guestId })
      .populate('roomId', 'roomNumber roomType pricePerNight')
      .sort({ checkInDate: -1 })

    const rows = await Promise.all(bookings.map(async (b) => {
      const payments = await Payment.find({ bookingId: b._id })
      const totalPaid = payments.reduce((s, p) => s + p.amountPaid, 0)
      return {
        bookingNumber: b.bookingNumber,
        room: b.roomId?.roomNumber || '',
        checkInDate: b.checkInDate,
        checkOutDate: b.checkOutDate,
        amount: b.totalAmount,
        paid: totalPaid,
        balance: b.totalAmount - totalPaid,
        status: b.status,
      }
    }))

    // Check if PDF invoice is requested for a specific booking
    const { bookingId, format } = req.query
    if (format === 'pdf' && bookingId) {
      const booking = await Booking.findById(bookingId)
        .populate('roomId', 'roomNumber roomType pricePerNight')

      if (!booking) return res.status(404).json({ message: 'Booking not found' })

      const payments = await Payment.find({ bookingId: booking._id })
      const buffer = await generateInvoicePDF(booking, guest, booking.roomId, payments, req.user)

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${booking.bookingNumber}.pdf`)
      return res.send(buffer)
    }

    if (format === 'xlsx') {
      const columns = ['Booking No.', 'Room', 'Check-in', 'Check-out', 'Amount', 'Paid', 'Balance']
      const data = rows.map((r) => [
        r.bookingNumber, r.room,
        new Date(r.checkInDate).toLocaleDateString('en-GB'),
        new Date(r.checkOutDate).toLocaleDateString('en-GB'),
        r.amount, r.paid, r.balance,
      ])
      const buffer = await generateReportXLSX(`Statement - ${guest.fullName}`, columns, data)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename=statement-${guest.fullName.replace(/\s+/g, '-')}.xlsx`)
      return res.send(buffer)
    }

    res.json({ data: rows })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// ── Daily Revenue Report ─────────────────────────────────
exports.dailyRevenue = async (req, res) => {
  try {
    const { date, format } = req.query
    const targetDate = date ? new Date(date) : new Date()
    const start = new Date(targetDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(targetDate)
    end.setHours(23, 59, 59, 999)

    const payments = await Payment.find({ paymentDate: { $gte: start, $lte: end } })
      .populate({
        path: 'bookingId',
        select: 'bookingNumber',
        populate: { path: 'guestId', select: 'fullName' },
      })
      .sort({ paymentDate: -1 })

    const rows = payments.map((p) => [
      p.bookingId?.bookingNumber || '',
      p.bookingId?.guestId?.fullName || '',
      p.bookingId?.bookingNumber || '',
      p.amountPaid,
      p.paymentMethod,
    ])

    const columns = ['Booking No.', 'Guest', 'Room', 'Amount', 'Payment Method']
    const total = payments.reduce((s, p) => s + p.amountPaid, 0)

    if (format === 'xlsx') {
      const allRows = [...rows, [], ['TOTAL', '', '', total, '']]
      const buffer = await generateReportXLSX(`Daily Revenue - ${targetDate.toLocaleDateString('en-GB')}`, columns, allRows)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename=daily-revenue-${targetDate.toISOString().split('T')[0]}.xlsx`)
      return res.send(buffer)
    }

    if (format === 'pdf') {
      const totals = [{ label: 'Total Revenue', value: `${total.toLocaleString()} Rwf` }]
      const buffer = await generateReportPDF('Daily Revenue Report', columns, rows, totals, req.user)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename=daily-revenue-${targetDate.toISOString().split('T')[0]}.pdf`)
      return res.send(buffer)
    }

    res.json({ data: payments.map((p) => ({
      bookingNumber: p.bookingId?.bookingNumber || '',
      guest: p.bookingId?.guestId?.fullName || '',
      room: '',
      amount: p.amountPaid,
      paymentMethod: p.paymentMethod,
    })) })
  } catch (err) { res.status(500).json({ message: err.message }) }
}
