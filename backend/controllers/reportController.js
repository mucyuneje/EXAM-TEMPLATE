import ServicePackage from '../models/ServicePackage.js'
import Car from '../models/Car.js'
import Package from '../models/Package.js'
import Payment from '../models/Payment.js'
import { generateInvoicePDF, generateReportPDF } from '../utils/pdfGenerator.js'
import { generateReportXLSX } from '../utils/xlsxGenerator.js'

// ── Car Wash Records Report ────────────────────────────
export const serviceRecords = async (req, res) => {
  try {
    const { format } = req.query
    const records = await ServicePackage.find()
      .populate('carId', 'plateNumber carType driverName')
      .populate('packageId', 'packageName packagePrice')
      .sort({ serviceDate: -1 })

    const rows = records.map((r) => [
      r.recordNumber, r.carId?.plateNumber || '', r.carId?.carType || '',
      r.carId?.driverName || '', r.packageId?.packageName || '', r.packageId?.packagePrice || 0,
      new Date(r.serviceDate).toLocaleDateString('en-GB'),
    ])
    const columns = ['Record No.', 'Plate', 'Car Type', 'Driver', 'Package', 'Price', 'Date']

    if (format === 'xlsx') {
      const buffer = await generateReportXLSX('Car Wash Records', columns, rows)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', 'attachment; filename=car-wash-records.xlsx')
      return res.send(buffer)
    }
    if (format === 'pdf') {
      const buffer = await generateReportPDF('Car Wash Records', columns, rows, null, req.user)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename=car-wash-records.pdf')
      return res.send(buffer)
    }

    res.json({ data: rows.map((r) => ({
      recordNumber: r[0], plateNumber: r[1], carType: r[2],
      driverName: r[3], packageName: r[4], price: r[5], serviceDate: r[6],
    })) })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// ── Car List Report ────────────────────────────────────
export const carList = async (req, res) => {
  try {
    const { format } = req.query
    const cars = await Car.find().sort({ createdAt: -1 })

    const rows = await Promise.all(cars.map(async (c) => {
      const records = await ServicePackage.find({ carId: c._id })
      const recordIds = records.map(r => r._id)
      const payments = await Payment.find({ recordId: { $in: recordIds } })
      const totalSpent = payments.reduce((s, p) => s + p.amountPaid, 0)
      return [
        c.plateNumber, c.carType, c.carSize, c.driverName, c.phoneNumber,
        records.length, totalSpent,
      ]
    }))

    const columns = ['Plate', 'Type', 'Size', 'Driver', 'Phone', 'Washes', 'Total Spent']

    if (format === 'xlsx') {
      const buffer = await generateReportXLSX('Car List', columns, rows)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', 'attachment; filename=car-list.xlsx')
      return res.send(buffer)
    }
    if (format === 'pdf') {
      const buffer = await generateReportPDF('Car List', columns, rows, null, req.user)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename=car-list.pdf')
      return res.send(buffer)
    }

    res.json({ data: rows.map((r) => ({
      plateNumber: r[0], carType: r[1], carSize: r[2],
      driverName: r[3], phoneNumber: r[4], totalWashes: r[5], totalSpent: r[6],
    })) })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// ── Payment Summary Report ─────────────────────────────
export const paymentSummary = async (req, res) => {
  try {
    const { format } = req.query
    const payments = await Payment.find()
      .populate({ path: 'recordId', populate: [
        { path: 'carId', select: 'plateNumber driverName' },
        { path: 'packageId', select: 'packageName packagePrice' },
      ]}).sort({ paymentDate: -1 })

    const rows = payments.map((p) => [
      p.paymentNumber, p.recordId?.recordNumber || '',
      p.recordId?.carId?.plateNumber || '', p.recordId?.packageId?.packageName || '',
      p.amountPaid,
      new Date(p.paymentDate).toLocaleDateString('en-GB'),
    ])
    const columns = ['Payment No.', 'Record', 'Plate', 'Package', 'Amount', 'Date']

    if (format === 'xlsx') {
      const buffer = await generateReportXLSX('Payment Summary', columns, rows)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', 'attachment; filename=payment-summary.xlsx')
      return res.send(buffer)
    }
    if (format === 'pdf') {
      const buffer = await generateReportPDF('Payment Summary', columns, rows, null, req.user)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename=payment-summary.pdf')
      return res.send(buffer)
    }

    res.json({ data: rows.map((r) => ({
      paymentNumber: r[0], recordNumber: r[1],
      plateNumber: r[2], packageName: r[3],
      amount: r[4], paymentDate: r[5],
    })) })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// ── Daily Revenue Report ───────────────────────────────
export const dailyRevenue = async (req, res) => {
  try {
    const { date, format } = req.query
    const targetDate = date ? new Date(date) : new Date()
    const start = new Date(targetDate); start.setHours(0, 0, 0, 0)
    const end = new Date(targetDate); end.setHours(23, 59, 59, 999)

    const payments = await Payment.find({ paymentDate: { $gte: start, $lte: end } })
      .populate({ path: 'recordId', populate: { path: 'carId', select: 'plateNumber' } })
      .sort({ paymentDate: -1 })

    const rows = payments.map((p) => [
      p.paymentNumber, p.recordId?.recordNumber || '',
      p.recordId?.carId?.plateNumber || '',
      p.amountPaid,
    ])
    const columns = ['Payment No.', 'Record', 'Plate', 'Amount']
    const total = payments.reduce((s, p) => s + p.amountPaid, 0)

    if (format === 'xlsx') {
      const allRows = [...rows, [], ['TOTAL', '', '', total]]
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
      paymentNumber: p.paymentNumber, recordNumber: p.recordId?.recordNumber || '',
      plateNumber: p.recordId?.carId?.plateNumber || '',
      amount: p.amountPaid,
    })) })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// ── Receipt PDF ────────────────────────────────────────
export const generateReceipt = async (req, res) => {
  try {
    const { recordId } = req.query
    if (!recordId) return res.status(400).json({ message: 'recordId is required' })

    const record = await ServicePackage.findById(recordId)
      .populate('carId').populate('packageId')
    if (!record) return res.status(404).json({ message: 'Service package not found' })

    const payments = await Payment.find({ recordId: record._id })
    const buffer = await generateInvoicePDF(record, payments, req.user)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${record.recordNumber}.pdf`)
    return res.send(buffer)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// ── Invoice PDF (reuses pdfGenerator) ──────────────────
