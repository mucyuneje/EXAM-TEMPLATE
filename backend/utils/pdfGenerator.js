import PDFDocument from 'pdfkit'

export function generateInvoicePDF(record, payments, user) {
  const car = record.carId || {}
  const pkg = record.packageId || {}
  const doc = new PDFDocument({ margin: 40, size: 'A4' })
  const buffers = []

  doc.on('data', (chunk) => buffers.push(chunk))

  doc.fontSize(18).font('Helvetica-Bold').text('RECEIPT', { align: 'right' })
  doc.moveDown(0.3)
  doc.fontSize(10).font('Helvetica').fillColor('#666')
    .text(`Receipt No: ${record.recordNumber}`, { align: 'right' })
    .text(`Date: ${new Date().toLocaleDateString('en-GB')}`, { align: 'right' })

  doc.moveDown(1.5)

  doc.fontSize(14).font('Helvetica-Bold').fillColor('#000').text('SMARTPARK CAR WASH')
  doc.fontSize(10).font('Helvetica').fillColor('#444')
    .text('Rubavu District, Western Province')
    .text('Phone: +250 788 000 000 | Email: info@smartpark.rw')

  doc.moveDown(1)
  doc.moveTo(40, doc.y).lineTo(550, doc.y).strokeColor('#ddd').stroke()
  doc.moveDown(1)

  doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text('CAR & DRIVER')
  doc.fontSize(10).font('Helvetica').fillColor('#444')
    .text(`Plate Number: ${car.plateNumber || ''}`)
    .text(`Car Type: ${car.carType || ''} (${car.carSize || ''})`)
    .text(`Driver: ${car.driverName || ''}`)
    .text(`Phone: ${car.phoneNumber || ''}`)

  doc.moveDown(1)

  doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text('WASH DETAILS')
  doc.fontSize(10).font('Helvetica').fillColor('#444')
    .text(`Record No: ${record.recordNumber}`)
    .text(`Package: ${pkg.packageName || ''}`)
    .text(`Wash Date: ${new Date(record.serviceDate).toLocaleDateString('en-GB')}`)

  doc.moveDown(1.5)

  const tableTop = doc.y
  const col1 = 40, col2 = 300, col3 = 480

  doc.fontSize(10).font('Helvetica-Bold').fillColor('#fff')
  doc.roundedRect(col1 - 4, tableTop - 6, 514, 22, 4).fill('#2563eb')
  doc.fillColor('#fff')
    .text('Description', col1 + 4, tableTop)
    .text('Price', col2, tableTop, { width: 80, align: 'center' })
    .text('Paid', col3, tableTop, { width: 80, align: 'right' })

  doc.fillColor('#000').font('Helvetica')
  let y = tableTop + 28

  payments = payments || []
  const packagePrice = pkg.packagePrice || 0
  const totalPaid = payments.reduce((s, p) => s + p.amountPaid, 0)
  const balance = packagePrice - totalPaid

  doc.text(pkg.packageName || 'Car Wash', col1 + 4, y)
  doc.text(`${packagePrice.toLocaleString()} Rwf`, col2, y, { width: 80, align: 'center' })
  doc.text(`${totalPaid.toLocaleString()} Rwf`, col3, y, { width: 80, align: 'right' })

  y += 22

  if (payments.length > 0) {
    doc.moveTo(col1, y).lineTo(col1 + 510, y).strokeColor('#eee').stroke()
    y += 12
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#444').text('Payment History:', col1 + 4, y)
    y += 16

    payments.forEach((p, i) => {
      doc.fontSize(9).font('Helvetica').fillColor('#444')
      doc.text(`${i + 1}. ${new Date(p.paymentDate).toLocaleDateString('en-GB')}`, col1 + 4, y)
      doc.text(`${p.amountPaid.toLocaleString()} Rwf`, col3, y, { width: 80, align: 'right' })
      y += 14
    })
  }

  y += 10
  doc.moveTo(col1, y).lineTo(col1 + 510, y).strokeColor('#ddd').stroke()
  y += 14

  doc.fontSize(10).font('Helvetica-Bold')
  doc.text('Package Price:', col1 + 4, y)
  doc.text(`${packagePrice.toLocaleString()} Rwf`, col3, y, { width: 80, align: 'right' })
  y += 16
  doc.text('Total Paid:', col1 + 4, y)
  doc.text(`${totalPaid.toLocaleString()} Rwf`, col3, y, { width: 80, align: 'right' })
  y += 16
  doc.fontSize(12).fillColor(balance > 0 ? '#dc2626' : '#16a34a')
  doc.text('Balance:', col1 + 4, y)
  doc.text(`${balance.toLocaleString()} Rwf`, col3, y, { width: 80, align: 'right' })

  doc.moveDown(3)

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

export function generateReportPDF(title, columns, rows, totals, user) {
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
