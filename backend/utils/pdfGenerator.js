const PDFDocument = require('pdfkit')

function generateInvoicePDF(booking, guest, room, payments, user) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' })
  const buffers = []

  doc.on('data', (chunk) => buffers.push(chunk))

  doc.fontSize(18).font('Helvetica-Bold').text('INVOICE', { align: 'right' })
  doc.moveDown(0.3)
  doc.fontSize(10).font('Helvetica').fillColor('#666')
    .text(`Invoice No: INV-${booking.bookingNumber}`, { align: 'right' })
    .text(`Date: ${new Date().toLocaleDateString('en-GB')}`, { align: 'right' })

  doc.moveDown(1.5)

  // Hotel info
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#000').text('HOTEL MANAGEMENT SYSTEM')
  doc.fontSize(10).font('Helvetica').fillColor('#444')
    .text('123 Hotel Street, City')
    .text('Phone: +250 788 000 000 | Email: info@hotel.com')

  doc.moveDown(1)

  // Horizontal rule
  doc.moveTo(40, doc.y).lineTo(550, doc.y).strokeColor('#ddd').stroke()

  doc.moveDown(1)

  // Bill to
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text('BILL TO')
  doc.fontSize(10).font('Helvetica').fillColor('#444')
    .text(`Guest: ${guest.fullName}`)
    .text(`Phone: ${guest.phone}`)
    .text(`Email: ${guest.email}`)
    .text(`ID: ${guest.idNumber}`)

  doc.moveDown(1)

  // Booking details
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text('BOOKING DETAILS')
  doc.fontSize(10).font('Helvetica').fillColor('#444')
    .text(`Booking No: ${booking.bookingNumber}`)
    .text(`Room: ${room.roomNumber} (${room.roomType})`)
    .text(`Check-in: ${new Date(booking.checkInDate).toLocaleDateString('en-GB')}`)
    .text(`Check-out: ${new Date(booking.checkOutDate).toLocaleDateString('en-GB')}`)
    .text(`Nights: ${booking.numberOfNights}`)

  doc.moveDown(1.5)

  // Table
  const tableTop = doc.y
  const col1 = 40, col2 = 250, col3 = 380, col4 = 480

  doc.fontSize(10).font('Helvetica-Bold').fillColor('#fff')
  doc.roundedRect(col1 - 4, tableTop - 6, 514, 22, 4).fill('#2563eb')
  doc.fillColor('#fff')
    .text('Description', col1 + 4, tableTop)
    .text('Qty', col2, tableTop, { width: 80, align: 'center' })
    .text('Unit Price', col3, tableTop, { width: 80, align: 'center' })
    .text('Amount', col4, tableTop, { width: 80, align: 'right' })

  doc.fillColor('#000').font('Helvetica')
  let y = tableTop + 28

  doc.text(`Room ${room.roomNumber} - ${room.roomType}`, col1 + 4, y)
  doc.text(String(booking.numberOfNights), col2, y, { width: 80, align: 'center' })
  doc.text(`${room.pricePerNight.toLocaleString()} Rwf`, col3, y, { width: 80, align: 'center' })
  doc.text(`${booking.totalAmount.toLocaleString()} Rwf`, col4, y, { width: 80, align: 'right' })

  y += 22

  // Payments
  let totalPaid = 0
  if (payments && payments.length > 0) {
    payments.forEach((p) => {
      doc.text(`Payment (${p.paymentMethod})`, col1 + 4, y)
      doc.text('1', col2, y, { width: 80, align: 'center' })
      doc.text(`${p.amountPaid.toLocaleString()} Rwf`, col3, y, { width: 80, align: 'center' })
      doc.text(`${p.amountPaid.toLocaleString()} Rwf`, col4, y, { width: 80, align: 'right' })
      totalPaid += p.amountPaid
      y += 20
    })
  }

  // Totals
  y += 10
  doc.moveTo(col1, y).lineTo(col1 + 510, y).strokeColor('#ddd').stroke()
  y += 14

  const balance = booking.totalAmount - totalPaid

  doc.font('Helvetica-Bold')
  doc.text('Total Amount:', col1 + 4, y)
  doc.text(`${booking.totalAmount.toLocaleString()} Rwf`, col4, y, { width: 80, align: 'right' })
  y += 18
  doc.text('Total Paid:', col1 + 4, y)
  doc.text(`${totalPaid.toLocaleString()} Rwf`, col4, y, { width: 80, align: 'right' })
  y += 18
  doc.fontSize(12).fillColor(balance > 0 ? '#dc2626' : '#16a34a')
  doc.text('Balance:', col1 + 4, y)
  doc.text(`${balance.toLocaleString()} Rwf`, col4, y, { width: 80, align: 'right' })

  doc.moveDown(3)

  // Signature
  doc.fontSize(10).font('Helvetica').fillColor('#444')
  doc.text(`Received by: ___________________________`, 40, doc.y)
  doc.moveDown(0.5)
  doc.text(`Issued by: ${user?.username || 'System'}`, 40, doc.y)
  doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 40, doc.y)

  doc.end()

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)))
  })
}

// ── Generic report PDF ────────────────────────────────────
function generateReportPDF(title, columns, rows, totals, user) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' })
  const buffers = []

  doc.on('data', (chunk) => buffers.push(chunk))

  doc.fontSize(16).font('Helvetica-Bold').text(title, { align: 'center' })
  doc.moveDown(0.3)
  doc.fontSize(9).font('Helvetica').fillColor('#666')
    .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
    .text(`By: ${user?.username || 'System'}`, { align: 'center' })

  doc.moveDown(1.5)

  const tableTop = doc.y
  const colWidth = 470 / columns.length

  doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff')
  doc.roundedRect(40, tableTop - 6, 520, 20, 4).fill('#2563eb')
  doc.fillColor('#fff')
  columns.forEach((col, i) => {
    doc.text(col, 44 + i * colWidth, tableTop, { width: colWidth - 8 })
  })

  doc.fillColor('#000').font('Helvetica').fontSize(9)
  let y = tableTop + 24

  rows.forEach((row, ri) => {
    if (y > 750) {
      doc.addPage()
      y = 40
    }
    if (ri % 2 === 1) {
      doc.rect(40, y - 4, 520, 20).fill('#f8fafc')
      doc.fillColor('#000')
    }
    columns.forEach((col, ci) => {
      let val = row[ci] !== undefined ? String(row[ci]) : '—'
      doc.text(val, 44 + ci * colWidth, y, { width: colWidth - 8 })
    })
    y += 20
  })

  if (totals && totals.length > 0) {
    y += 8
    doc.moveTo(40, y).lineTo(560, y).strokeColor('#ddd').stroke()
    y += 14
    doc.font('Helvetica-Bold').fontSize(10)
    totals.forEach((t) => {
      doc.text(`${t.label}: ${t.value}`, 40, y)
      y += 16
    })
  }

  doc.fontSize(9).font('Helvetica').fillColor('#666')
  doc.text(`Generated by: ${user?.username || 'System'}`, 40, doc.y + 20)

  doc.end()

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)))
  })
}

module.exports = { generateInvoicePDF, generateReportPDF }
