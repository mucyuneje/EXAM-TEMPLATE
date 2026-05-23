import ExcelJS from 'exceljs'

export async function generateReportXLSX(title, columns, rows) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(title.slice(0, 31))

  sheet.mergeCells(1, 1, 1, columns.length)
  const titleCell = sheet.getCell(1, 1)
  titleCell.value = title
  titleCell.font = { bold: true, size: 14, color: { argb: 'FF1E40AF' } }
  titleCell.alignment = { horizontal: 'center' }

  sheet.addRow([])

  const headerRow = sheet.addRow(columns.map((c) => c.label || c))
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' },
    }
  })

  rows.forEach((row, ri) => {
    const dataRow = sheet.addRow(row)
    dataRow.eachCell((cell, ci) => {
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' },
      }
      cell.alignment = { vertical: 'middle' }
      if (ri % 2 === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }
      }
    })
  })

  columns.forEach((_, i) => {
    const maxLen = Math.max(
      ...rows.map((r) => String(r[i] || '').length),
      String(columns[i] || '').length,
    )
    sheet.getColumn(i + 1).width = Math.min(Math.max(maxLen + 3, 12), 30)
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return buffer
}
