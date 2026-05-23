import Car from '../models/Car.js'
import ServicePackage from '../models/ServicePackage.js'
import Payment from '../models/Payment.js'

export const totalCars = async (req, res) => {
  try {
    const count = await Car.countDocuments()
    res.json({ value: count })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

export const activePackages = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const count = await ServicePackage.countDocuments({ serviceDate: { $gte: today } })
    res.json({ value: count })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

export const revenueToday = async (req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0)
    const end = new Date(); end.setHours(23, 59, 59, 999)
    const result = await Payment.aggregate([
      { $match: { paymentDate: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ])
    res.json({ value: result[0]?.total || 0 })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

export const totalRevenue = async (req, res) => {
  try {
    const result = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ])
    res.json({ value: result[0]?.total || 0 })
  } catch (err) { res.status(500).json({ message: err.message }) }
}
