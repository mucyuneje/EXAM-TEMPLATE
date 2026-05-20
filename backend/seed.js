const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const cfg = require('./config/config')

const User = require('./models/User')
const Room = require('./models/Room')
const Guest = require('./models/Guest')
const Booking = require('./models/Booking')
const Payment = require('./models/Payment')

async function seed() {
  await mongoose.connect(cfg.mongoUri)
  console.log('Connected to MongoDB')

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Room.deleteMany({}),
    Guest.deleteMany({}),
    Booking.deleteMany({}),
    Payment.deleteMany({}),
  ])
  console.log('Cleared existing data')

  // ── Users ──────────────────────────────────────────────
  const admin = await User.create({
    username: 'admin',
    password: 'admin123',
    securityQuestion: 'What was the name of your first pet?',
    securityAnswer: 'Rex',
  })
  console.log('User created: admin / admin123')

  // ── Rooms ──────────────────────────────────────────────
  const roomData = [
    { roomNumber: '101', roomType: 'Single',   pricePerNight: 30000,  status: 'Booked' },
    { roomNumber: '102', roomType: 'Single',   pricePerNight: 30000,  status: 'Available' },
    { roomNumber: '105', roomType: 'Double',   pricePerNight: 50000,  status: 'Booked' },
    { roomNumber: '106', roomType: 'Double',   pricePerNight: 50000,  status: 'Maintenance' },
    { roomNumber: '202', roomType: 'Double',   pricePerNight: 55000,  status: 'Booked' },
    { roomNumber: '205', roomType: 'Suite',    pricePerNight: 80000,  status: 'Booked' },
    { roomNumber: '303', roomType: 'Suite',    pricePerNight: 100000, status: 'Available' },
    { roomNumber: '310', roomType: 'Deluxe',   pricePerNight: 90000,  status: 'Available' },
    { roomNumber: '408', roomType: 'Deluxe',   pricePerNight: 120000, status: 'Available' },
  ]
  const rooms = await Room.insertMany(roomData)
  console.log(`Seeded ${rooms.length} rooms`)

  // ── Guests ─────────────────────────────────────────────
  const guestData = [
    { fullName: 'John Doe',       phone: '+250788100100', email: 'john.doe@email.com',     idNumber: 'ID-1001' },
    { fullName: 'Jane Smith',     phone: '+250788200200', email: 'jane.smith@email.com',   idNumber: 'ID-1002' },
    { fullName: 'Bob Johnson',    phone: '+250788300300', email: 'bob.j@email.com',        idNumber: 'ID-1003' },
    { fullName: 'Alice Williams', phone: '+250788400400', email: 'alice.w@email.com',      idNumber: 'ID-1004' },
    { fullName: 'Charlie Brown',  phone: '+250788500500', email: 'charlie.b@email.com',    idNumber: 'ID-1005' },
    { fullName: 'Diana Prince',   phone: '+250788600600', email: 'diana.p@email.com',      idNumber: 'ID-1006' },
  ]
  const guests = await Guest.insertMany(guestData)
  console.log(`Seeded ${guests.length} guests`)

  // ── Bookings ───────────────────────────────────────────
  const bookingData = [
    { bookingNumber: 'BK-001', guestId: guests[0]._id, roomId: rooms[0]._id,  checkInDate: new Date('2026-05-10'), checkOutDate: new Date('2026-05-12'), totalAmount: 60000,  status: 'Checked-out' },
    { bookingNumber: 'BK-002', guestId: guests[1]._id, roomId: rooms[7]._id,  checkInDate: new Date('2026-05-11'), checkOutDate: new Date('2026-05-13'), totalAmount: 180000, status: 'Checked-out' },
    { bookingNumber: 'BK-003', guestId: guests[2]._id, roomId: rooms[5]._id,  checkInDate: new Date('2026-05-15'), checkOutDate: new Date('2026-05-18'), totalAmount: 240000, status: 'Checked-in' },
    { bookingNumber: 'BK-004', guestId: guests[3]._id, roomId: rooms[2]._id,  checkInDate: new Date('2026-05-14'), checkOutDate: new Date('2026-05-17'), totalAmount: 150000, status: 'Checked-in' },
    { bookingNumber: 'BK-005', guestId: guests[0]._id, roomId: rooms[4]._id,  checkInDate: new Date('2026-05-20'), checkOutDate: new Date('2026-05-22'), totalAmount: 110000, status: 'Confirmed' },
    { bookingNumber: 'BK-006', guestId: guests[4]._id, roomId: rooms[6]._id,  checkInDate: new Date('2026-05-16'), checkOutDate: new Date('2026-05-20'), totalAmount: 400000, status: 'Checked-in' },
    { bookingNumber: 'BK-007', guestId: guests[5]._id, roomId: rooms[3]._id,  checkInDate: new Date('2026-05-25'), checkOutDate: new Date('2026-05-26'), totalAmount: 50000,  status: 'Confirmed' },
    { bookingNumber: 'BK-008', guestId: guests[3]._id, roomId: rooms[8]._id,  checkInDate: new Date('2026-05-28'), checkOutDate: new Date('2026-05-30'), totalAmount: 240000, status: 'Confirmed' },
  ]
  const bookings = await Booking.insertMany(bookingData)
  console.log(`Seeded ${bookings.length} bookings`)

  // ── Payments ───────────────────────────────────────────
  const paymentData = [
    { paymentNumber: 'PAY-001', bookingId: bookings[0]._id, amountPaid: 60000,  paymentMethod: 'Cash',        paymentDate: new Date('2026-05-12') },
    { paymentNumber: 'PAY-002', bookingId: bookings[1]._id, amountPaid: 180000, paymentMethod: 'Card',        paymentDate: new Date('2026-05-13') },
    { paymentNumber: 'PAY-003', bookingId: bookings[2]._id, amountPaid: 100000, paymentMethod: 'Mobile Money', paymentDate: new Date('2026-05-15') },
    { paymentNumber: 'PAY-004', bookingId: bookings[3]._id, amountPaid: 150000, paymentMethod: 'Cash',        paymentDate: new Date('2026-05-14') },
    { paymentNumber: 'PAY-005', bookingId: bookings[2]._id, amountPaid: 140000, paymentMethod: 'Card',        paymentDate: new Date('2026-05-17') },
    { paymentNumber: 'PAY-006', bookingId: bookings[5]._id, amountPaid: 200000, paymentMethod: 'Mobile Money', paymentDate: new Date('2026-05-16') },
    { paymentNumber: 'PAY-007', bookingId: bookings[5]._id, amountPaid: 200000, paymentMethod: 'Cash',        paymentDate: new Date('2026-05-19') },
    { paymentNumber: 'PAY-008', bookingId: bookings[1]._id, amountPaid: 180000, paymentMethod: 'Mobile Money', paymentDate: new Date('2026-05-13') },
  ]
  await Payment.insertMany(paymentData)
  console.log(`Seeded ${paymentData.length} payments`)

  console.log('\nSeed complete! Login with: admin / admin123')
  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('Seed error:', err)
  process.exit(1)
})
