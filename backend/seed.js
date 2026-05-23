import 'dotenv/config'
import mongoose from 'mongoose'
import cfg from './config/config.js'
import Package from './models/Package.js'
import Car from './models/Car.js'
import ServicePackage from './models/ServicePackage.js'
import Payment from './models/Payment.js'
import User from './models/User.js'

async function seed() {
  try {
    await mongoose.connect(cfg.mongoUri)
    console.log('Connected to MongoDB')

    await Promise.all([
      User.deleteMany({}),
      Package.deleteMany({}),
      Car.deleteMany({}),
      ServicePackage.deleteMany({}),
      Payment.deleteMany({}),
    ])
    console.log('Cleared existing data')

    // ── Admin user ──────────────────────────────────
    await User.create({
      username: 'admin',
      password: 'admin123',
      securityQuestion: 'What is your favorite color?',
      securityAnswer: 'blue',
    })
    console.log('Admin user: admin / admin123')

    // ── Wash packages ───────────────────────────────
    const packageData = [
      { packageName: 'Basic Wash',     packageDescription: 'Exterior hand wash, wheel cleaning, window wipe',            packagePrice: 5000 },
      { packageName: 'Full Wash',      packageDescription: 'Exterior wash + interior vacuum + dashboard polish',        packagePrice: 10000 },
      { packageName: 'Premium Wash',   packageDescription: 'Full Wash + wax coating + tire shine + air freshener',      packagePrice: 15000 },
      { packageName: 'Deluxe Detail',  packageDescription: 'Premium Wash + engine bay clean + upholstery shampoo',      packagePrice: 25000 },
      { packageName: 'Express Wash',   packageDescription: 'Quick exterior rinse and dry',                               packagePrice: 3000 },
    ]
    const packages = []
    for (const d of packageData) {
      packages.push(await Package.create(d))
    }
    console.log(`${packages.length} packages created`)

    // ── Cars ────────────────────────────────────────
    const carData = [
      { plateNumber: 'RAB-101-A', carType: 'Sedan',    carSize: 'Medium', driverName: 'Jean Pierre',    phoneNumber: '0788000101' },
      { plateNumber: 'RAB-202-B', carType: 'SUV',      carSize: 'Large',  driverName: 'Marie Uwimana',  phoneNumber: '0788000202' },
      { plateNumber: 'RAB-303-C', carType: 'Hatchback', carSize: 'Small',  driverName: 'Patrick Mugabo', phoneNumber: '0788000303' },
      { plateNumber: 'RAB-404-D', carType: 'Pickup',   carSize: 'Large',  driverName: 'Alice Habimana', phoneNumber: '0788000404' },
      { plateNumber: 'RAB-505-E', carType: 'Sedan',    carSize: 'Medium', driverName: 'David Niyo',     phoneNumber: '0788000505' },
      { plateNumber: 'RAB-606-F', carType: 'SUV',      carSize: 'Large',  driverName: 'Grace Uwase',    phoneNumber: '0788000606' },
      { plateNumber: 'RAB-707-G', carType: 'Minibus',  carSize: 'Large',  driverName: 'James Nshimi',   phoneNumber: '0788000707' },
      { plateNumber: 'RAB-808-H', carType: 'Hatchback', carSize: 'Small',  driverName: 'Sarah Ingabire', phoneNumber: '0788000808' },
    ]
    const cars = []
    for (const d of carData) {
      cars.push(await Car.create(d))
    }
    console.log(`${cars.length} cars created`)

    // ── Service packages (wash records) ─────────────
    const today = new Date()
    const recordsData = [
      { serviceDate: new Date(today.getTime() - 86400000 * 5), carId: cars[0]._id, packageId: packages[0]._id },
      { serviceDate: new Date(today.getTime() - 86400000 * 4), carId: cars[1]._id, packageId: packages[1]._id },
      { serviceDate: new Date(today.getTime() - 86400000 * 3), carId: cars[2]._id, packageId: packages[2]._id },
      { serviceDate: new Date(today.getTime() - 86400000 * 2), carId: cars[3]._id, packageId: packages[3]._id },
      { serviceDate: new Date(today.getTime() - 86400000 * 1), carId: cars[4]._id, packageId: packages[0]._id },
      { serviceDate: today,                                      carId: cars[5]._id, packageId: packages[1]._id },
      { serviceDate: new Date(today.getTime() - 86400000 * 7), carId: cars[6]._id, packageId: packages[2]._id },
      { serviceDate: new Date(today.getTime() - 86400000 * 10), carId: cars[7]._id, packageId: packages[4]._id },
      { serviceDate: new Date(today.getTime() - 86400000 * 6), carId: cars[0]._id, packageId: packages[1]._id },
      { serviceDate: new Date(today.getTime() - 86400000 * 8), carId: cars[2]._id, packageId: packages[3]._id },
    ]
    const records = []
    for (const d of recordsData) {
      records.push(await ServicePackage.create(d))
    }
    console.log(`${records.length} wash records created`)

    // ── Payments ────────────────────────────────────
    const fetched = await ServicePackage.find().populate('packageId')
    const paymentsData = fetched.map((r) => ({
      recordId: r._id,
      amountPaid: r.packageId?.packagePrice || 0,
      paymentDate: r.serviceDate,
    }))
    const payments = []
    for (const d of paymentsData) {
      payments.push(await Payment.create(d))
    }
    console.log(`${payments.length} payments created`)

    console.log('\n✅ Seed completed!')
    console.log('Login: admin / admin123')

    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('Seed failed:', err)
    process.exit(1)
  }
}

seed()
