import jsPDF from 'jspdf'
import { getTemplateStyles, DEFAULT_TEMPLATE } from './invoiceTemplates'

// ── Shared helpers ──────────────────────────────────────────────────

const CURRENCY_SYMBOLS = { EUR: '€', USD: '$', GBP: '£', CHF: 'Fr.', CAD: 'C$', AUD: 'A$', JPY: '¥', CNY: '¥', INR: '₹', BRL: 'R$', MXN: 'MX$', SEK: 'kr ', NOK: 'kr ', DKK: 'kr ', PLN: 'zł', CZK: 'Kč' }

const PT_TO_MM = 0.3528 // 1pt = 0.3528mm

const fmtCurrency = (amount, currency) =>
  `${CURRENCY_SYMBOLS[currency] || currency + ' '}${Number(amount || 0).toFixed(2)}`

const fmtDate = (dateStr) => {
  if (!dateStr) return ''
  const parts = dateStr.split('T')[0].split('-')
  if (parts.length === 3) {
    const d = new Date(parts[0], parts[1] - 1, parts[2])
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }
  return dateStr
}

const fmtPeriod = (start, end) => {
  if (!start && !end) return ''
  if (start && end) return `${fmtDate(start)} - ${fmtDate(end)}`
  return fmtDate(start || end)
}

const hexToRGB = (hex) => {
  const h = hex.replace('#', '')
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)]
}

const drawRoundedRect = (pdf, x, y, w, h, r, fillColor) => {
  const [cr, cg, cb] = hexToRGB(fillColor)
  pdf.setFillColor(cr, cg, cb)
  pdf.roundedRect(x, y, w, h, r, r, 'F')
}

// Wrap text and return final Y position
const drawWrappedText = (pdf, text, x, y, maxWidth, lineHeight) => {
  if (!text) return y
  const lines = pdf.splitTextToSize(text, maxWidth)
  const lh = lineHeight || pdf.getLineHeight() * PT_TO_MM
  for (const line of lines) {
    pdf.text(line, x, y)
    y += lh
  }
  return y
}

// Set font helper — jsPDF only has helvetica/courier/times built-in
const setFont = (pdf, style, size) => {
  // style: 'normal', 'bold', 'italic', 'bolditalic'
  // font: 'helvetica' for body, 'courier' for mono
  pdf.setFont('helvetica', style)
  pdf.setFontSize(size)
}

const setMonoFont = (pdf, style, size) => {
  pdf.setFont('courier', style)
  pdf.setFontSize(size)
}

const setColor = (pdf, hex) => {
  const [r, g, b] = hexToRGB(hex)
  pdf.setTextColor(r, g, b)
}

// ── Expense Report PDF Builder ──────────────────────────────────────

export const buildExpenseReportPDF = (data) => {
  const {
    reportNumber = 'EXP-001',
    date,
    periodStart,
    periodEnd,
    currency = 'EUR',
    notes,
    yourName,
    yourAddress,
    yourEmail,
    yourTaxId,
    beneficiary,
    iban,
    bic,
    intermediaryBic,
    clientName,
    clientAddress,
    clientEmail,
    clientTaxId,
    expenses = [],
    template = DEFAULT_TEMPLATE,
    accentColor,
  } = data

  const styles = getTemplateStyles(template, accentColor)
  const isDark = template === 'dark'
  const labelColor = isDark ? '#94a3b8' : '#64748b'
  const nameColor = isDark ? '#e2e8f0' : '#334155'
  const borderColorHex = isDark ? '#334155' : '#d4d4d4'
  const bgMuted = isDark ? '#1e293b' : '#f5f5f5'

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pw = 210 // page width
  const ph = 297 // page height
  const ml = 13 // margin left
  const mr = 13 // margin right
  const cw = pw - ml - mr // content width

  // Page background
  if (isDark) {
    const [br, bg, bb] = hexToRGB(styles.bodyBg)
    pdf.setFillColor(br, bg, bb)
    pdf.rect(0, 0, pw, ph, 'F')
  }

  let y = 14

  // ── Title ──
  setFont(pdf, 'normal', 28)
  setColor(pdf, styles.bodyText)
  pdf.text('Expense Report', ml, y + 8)
  y += 16

  // ── Meta block ──
  setFont(pdf, 'bold', 11)
  setColor(pdf, labelColor)
  const metaLabelW = 28

  const metaRows = [
    ['Report no.', reportNumber],
    ['Date', fmtDate(date) || fmtDate(new Date().toISOString().split('T')[0])],
  ]
  if (periodStart || periodEnd) {
    metaRows.push(['Period', fmtPeriod(periodStart, periodEnd)])
  }

  for (const [label, value] of metaRows) {
    setFont(pdf, 'bold', 11)
    setColor(pdf, labelColor)
    pdf.text(label, ml, y)
    setFont(pdf, 'normal', 11)
    setColor(pdf, styles.bodyText)
    pdf.text(value || '', ml + metaLabelW, y)
    y += 5
  }
  y += 4

  // ── From / To ──
  const colW = (cw - 10) / 2
  const fromX = ml
  const toX = ml + colW + 10

  const drawParty = (x, label, name, address, email, taxId) => {
    let py = y
    setFont(pdf, 'bold', 9)
    setColor(pdf, styles.accentColor)
    pdf.text(label.toUpperCase(), x, py)
    py += 5

    setFont(pdf, 'bold', 12)
    setColor(pdf, nameColor)
    pdf.text(name || 'Your Name', x, py)
    py += 5

    setFont(pdf, 'normal', 10)
    setColor(pdf, labelColor)
    if (address) {
      const lines = address.split('\n')
      for (const line of lines) {
        pdf.text(line, x, py)
        py += 4
      }
    }
    if (email) { pdf.text(email, x, py); py += 4 }
    if (taxId) { pdf.text(taxId, x, py); py += 4 }
    return py
  }

  const fromEnd = drawParty(fromX, 'From', yourName, yourAddress, yourEmail, yourTaxId)
  let toEnd = y
  if (clientName) {
    toEnd = drawParty(toX, 'Bill To', clientName, clientAddress, clientEmail, clientTaxId)
  }
  y = Math.max(fromEnd, toEnd) + 6

  // ── Expense table ──
  // Header line
  const [blr, blg, blb] = hexToRGB(borderColorHex)
  pdf.setDrawColor(blr, blg, blb)
  pdf.setLineWidth(0.3)
  pdf.line(ml, y, ml + cw, y)
  y += 5

  // Column positions
  const colDate = ml
  const colDesc = ml + 30
  const colCat = ml + cw - 60
  const colAmt = ml + cw

  setFont(pdf, 'bold', 9)
  setColor(pdf, labelColor)
  pdf.text('DATE', colDate, y)
  pdf.text('DESCRIPTION', colDesc, y)
  pdf.text('CATEGORY', colCat, y)
  pdf.text('AMOUNT', colAmt, y, { align: 'right' })
  y += 5

  pdf.line(ml, y, ml + cw, y)
  y += 4

  // Data rows
  const filteredExpenses = expenses.filter(e => e.description || e.amount)
  if (filteredExpenses.length > 0) {
    for (const exp of filteredExpenses) {
      setMonoFont(pdf, 'normal', 9)
      setColor(pdf, labelColor)
      pdf.text(fmtDate(exp.date) || '', colDate, y)

      setFont(pdf, 'normal', 11)
      setColor(pdf, nameColor)
      pdf.text(exp.description || '', colDesc, y)

      setFont(pdf, 'normal', 10)
      setColor(pdf, labelColor)
      pdf.text(exp.category || 'Other', colCat, y)

      setMonoFont(pdf, 'bold', 11)
      setColor(pdf, styles.bodyText)
      pdf.text(fmtCurrency(exp.amount, currency), colAmt, y, { align: 'right' })

      y += 6
    }
  } else {
    setFont(pdf, 'normal', 11)
    setColor(pdf, labelColor)
    pdf.text('No expenses', colDate, y)
    y += 6
  }

  y += 2

  // ── Category summary ──
  const byCategory = expenses.reduce((acc, exp) => {
    const cat = exp.category || 'Other'
    acc[cat] = (acc[cat] || 0) + (Number(exp.amount) || 0)
    return acc
  }, {})

  if (Object.keys(byCategory).length > 0) {
    setFont(pdf, 'bold', 9)
    setColor(pdf, labelColor)
    pdf.text('BY CATEGORY', ml, y)
    y += 5

    for (const [cat, amt] of Object.entries(byCategory)) {
      setFont(pdf, 'normal', 11)
      setColor(pdf, nameColor)
      pdf.text(cat, ml, y)
      setMonoFont(pdf, 'normal', 11)
      setColor(pdf, labelColor)
      pdf.text(fmtCurrency(amt, currency), ml + cw, y, { align: 'right' })
      y += 5
    }
    y += 3
  }

  // ── Total ──
  const total = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0)
  pdf.line(ml + cw - 80, y, ml + cw, y)
  y += 6
  setFont(pdf, 'bold', 16)
  setColor(pdf, styles.accentColor)
  pdf.text('Total', ml + cw - 80, y)
  setMonoFont(pdf, 'bold', 16)
  pdf.text(fmtCurrency(total, currency), ml + cw, y, { align: 'right' })
  y += 8

  // ── Notes ──
  if (notes) {
    setFont(pdf, 'normal', 11)
    const noteLines = pdf.splitTextToSize(notes, cw - 8)
    const noteH = 5 + 4 + noteLines.length * 4 + 4
    drawRoundedRect(pdf, ml, y, cw, noteH, 2, bgMuted)
    y += 5
    setFont(pdf, 'bold', 9)
    setColor(pdf, labelColor)
    pdf.text('Note', ml + 4, y)
    y += 4
    setFont(pdf, 'normal', 11)
    setColor(pdf, styles.bodyText)
    y = drawWrappedText(pdf, notes, ml + 4, y, cw - 8, 4)
    y += 5
  }

  // ── Payment Details (pinned near bottom) ──
  const allAttachments = expenses.flatMap((exp, i) =>
    (exp.attachments || []).filter(a => a.type?.startsWith('image/')).map(a => ({
      ...a,
      expenseDescription: exp.description || `Expense ${i + 1}`,
    }))
  )
  const totalPages = 1 + allAttachments.length

  let bottomY = ph - 12
  // Footer
  setFont(pdf, 'normal', 9)
  setColor(pdf, labelColor)
  pdf.text(yourName || 'Your Company', ml, bottomY)
  pdf.text(`${reportNumber} · 1/${totalPages}`, ml + cw, bottomY, { align: 'right' })
  bottomY -= 4
  pdf.setDrawColor(blr, blg, blb)
  pdf.setLineWidth(0.2)
  pdf.line(ml, bottomY, ml + cw, bottomY)
  bottomY -= 3

  if (beneficiary || iban || bic) {
    const payH = 4 + (beneficiary ? 5 : 0) + (iban ? 5 : 0) + (bic ? 5 : 0) + (intermediaryBic ? 5 : 0) + 8
    const payY = bottomY - payH
    drawRoundedRect(pdf, ml, payY, cw, payH, 2, bgMuted)
    let pcy = payY + 5
    setFont(pdf, 'bold', 9)
    setColor(pdf, styles.accentColor)
    pdf.text('PAYMENT DETAILS', ml + 4, pcy)
    pcy += 6

    const drawPayRow = (label, value, mono) => {
      setFont(pdf, 'bold', 10)
      setColor(pdf, labelColor)
      pdf.text(label + ':', ml + 4, pcy)
      if (mono) {
        setMonoFont(pdf, 'normal', 10)
      } else {
        setFont(pdf, 'normal', 10)
      }
      setColor(pdf, styles.bodyText)
      pdf.text(value, ml + 38, pcy)
      pcy += 5
    }

    if (beneficiary) drawPayRow('Beneficiary', beneficiary, false)
    if (iban) drawPayRow('IBAN', iban, true)
    if (bic) drawPayRow('BIC', bic, true)
    if (intermediaryBic) drawPayRow('Intermediary BIC', intermediaryBic, true)
  }

  return { pdf, allAttachments, totalPages }
}

// ── Invoice PDF Builder ─────────────────────────────────────────────

export const buildInvoicePDF = (data) => {
  const {
    invoiceNumber = 'INV-001',
    issueDate,
    dueDate,
    currency = 'EUR',
    notes,
    yourName,
    yourAddress,
    yourEmail,
    yourTaxId,
    clientName,
    clientAddress,
    clientEmail,
    clientTaxId,
    lineItems = [],
    expenses = [],
    beneficiary,
    iban,
    bic,
    intermediaryBic,
    logo,
    signature,
    template = DEFAULT_TEMPLATE,
    accentColor,
  } = data

  const styles = getTemplateStyles(template, accentColor)
  const isDark = template === 'dark'
  const grayColor = isDark ? '#94a3b8' : '#9ca3af'
  const nameColor = isDark ? '#e2e8f0' : '#1a1a1a'
  const bodyColor = isDark ? '#cbd5e1' : '#444444'
  const accentBlue = isDark ? '#818cf8' : '#4d65ff'
  const borderColorHex = isDark ? '#334155' : '#e0e0e0'
  const bgMuted = isDark ? '#1e293b' : '#f5f5f7'

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pw = 210
  const ph = 297
  const ml = 20
  const mr = 20
  const cw = pw - ml - mr

  if (isDark) {
    const [br, bg, bb] = hexToRGB(styles.bodyBg)
    pdf.setFillColor(br, bg, bb)
    pdf.rect(0, 0, pw, ph, 'F')
  }

  let y = 22

  // ── Title ──
  setFont(pdf, 'normal', 28)
  setColor(pdf, nameColor)
  pdf.text('Invoice', ml, y + 8)
  if (logo) {
    try { pdf.addImage(logo, 'JPEG', ml + cw - 30, y - 2, 30, 14) } catch { /* */ }
  }
  y += 18

  // ── Meta ──
  const metaLabelW = 26
  const metaRows = [
    ['Invoice no.', invoiceNumber || 'INV-001'],
    ['Issue date', fmtDate(issueDate) || fmtDate(new Date().toISOString().split('T')[0])],
    ['Due date', fmtDate(dueDate) || '\u2014'],
  ]
  for (const [label, value] of metaRows) {
    setFont(pdf, 'bold', 10)
    setColor(pdf, accentBlue)
    pdf.text(label, ml, y)
    setFont(pdf, 'normal', 10)
    setColor(pdf, nameColor)
    pdf.text(value, ml + metaLabelW, y)
    y += 5.5
  }
  y += 8

  // ── From / To ──
  const toX = ml + cw / 2 + 8
  const drawParty = (x, label, name, address, email, taxId) => {
    let py = y
    setFont(pdf, 'bold', 8)
    setColor(pdf, accentBlue)
    pdf.text(label.toUpperCase(), x, py)
    py += 6
    setFont(pdf, 'bold', 11.5)
    setColor(pdf, nameColor)
    pdf.text(name || '', x, py)
    py += 6
    setFont(pdf, 'normal', 9.5)
    setColor(pdf, grayColor)
    if (address) {
      for (const line of address.split('\n')) {
        pdf.text(line, x, py); py += 4.5
      }
    }
    if (email) { pdf.text(email, x, py); py += 4.5 }
    if (taxId) { pdf.text(taxId, x, py); py += 4.5 }
    return py
  }
  const fromEnd = drawParty(ml, 'From', yourName, yourAddress, yourEmail, yourTaxId)
  const toEnd = drawParty(toX, 'Bill To', clientName, clientAddress, clientEmail, clientTaxId)
  y = Math.max(fromEnd, toEnd) + 10

  // ── Items table ──
  const [blr, blg, blb] = hexToRGB(borderColorHex)
  pdf.setDrawColor(blr, blg, blb)
  pdf.setLineWidth(0.25)
  pdf.line(ml, y, ml + cw, y)
  y += 7

  const colItem = ml
  const colQty = ml + cw * 0.58
  const colRate = ml + cw * 0.78
  const colTotal = ml + cw

  setFont(pdf, 'bold', 8)
  setColor(pdf, grayColor)
  pdf.text('ITEM', colItem, y)
  pdf.text('QTY', colQty, y, { align: 'right' })
  pdf.text('RATE', colRate, y, { align: 'right' })
  pdf.text('TOTAL', colTotal, y, { align: 'right' })
  y += 5
  pdf.line(ml, y, ml + cw, y)
  y += 7

  const filteredItems = lineItems.filter(item => item.description)
  if (filteredItems.length > 0) {
    for (const item of filteredItems) {
      const lineTotal = (Number(item.quantity) || 0) * (Number(item.price) || 0) * (1 + (Number(item.vat) || 0) / 100)

      setFont(pdf, 'bold', 10)
      setColor(pdf, nameColor)
      pdf.text(item.description, colItem, y)

      setFont(pdf, 'normal', 10)
      setColor(pdf, grayColor)
      pdf.text(String(Number(item.quantity) || 0), colQty, y, { align: 'right' })
      pdf.text(fmtCurrency(Number(item.price) || 0, currency), colRate, y, { align: 'right' })

      setFont(pdf, 'bold', 10)
      setColor(pdf, nameColor)
      pdf.text(fmtCurrency(lineTotal, currency), colTotal, y, { align: 'right' })
      y += 5

      if (item.comment) {
        setFont(pdf, 'normal', 8.5)
        setColor(pdf, grayColor)
        const maxW = colQty - colItem - 10
        const lines = pdf.splitTextToSize(item.comment, maxW)
        for (const line of lines) {
          pdf.text(line, colItem, y)
          y += 3.8
        }
      }
      y += 3
    }
  } else {
    setFont(pdf, 'normal', 10)
    setColor(pdf, grayColor)
    pdf.text('No items', colItem, y)
    y += 7
  }

  pdf.setDrawColor(blr, blg, blb)
  pdf.setLineWidth(0.25)
  pdf.line(ml, y, ml + cw, y)
  y += 10

  // ── Expenses ──
  const expensesTotal = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  if (expenses.length > 0) {
    setFont(pdf, 'bold', 8)
    setColor(pdf, grayColor)
    pdf.text('EXPENSES', ml, y)
    y += 6
    for (const expense of expenses) {
      setFont(pdf, 'normal', 10)
      setColor(pdf, nameColor)
      pdf.text(expense.description || 'Expense', ml, y)
      setFont(pdf, 'bold', 10)
      pdf.text(fmtCurrency(expense.amount || 0, currency), ml + cw, y, { align: 'right' })
      y += 5.5
    }
    y += 6
  }

  // ── Totals ──
  const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0)
  const vatAmount = lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0) * (Number(item.vat) || 0) / 100, 0)
  const total = subtotal + vatAmount + expensesTotal

  const totalsLabelX = ml + cw - 46
  const totalsValueX = ml + cw

  setFont(pdf, 'normal', 10)
  setColor(pdf, grayColor)
  pdf.text('Subtotal', totalsLabelX, y, { align: 'right' })
  setFont(pdf, 'normal', 10)
  setColor(pdf, nameColor)
  pdf.text(fmtCurrency(subtotal, currency), totalsValueX, y, { align: 'right' })
  y += 7

  if (vatAmount > 0) {
    setFont(pdf, 'normal', 10)
    setColor(pdf, grayColor)
    pdf.text('VAT', totalsLabelX, y, { align: 'right' })
    setFont(pdf, 'normal', 10)
    setColor(pdf, nameColor)
    pdf.text(fmtCurrency(vatAmount, currency), totalsValueX, y, { align: 'right' })
    y += 7
  }

  if (expensesTotal > 0) {
    setFont(pdf, 'normal', 10)
    setColor(pdf, grayColor)
    pdf.text('Expenses', totalsLabelX, y, { align: 'right' })
    setFont(pdf, 'normal', 10)
    setColor(pdf, nameColor)
    pdf.text(fmtCurrency(expensesTotal, currency), totalsValueX, y, { align: 'right' })
    y += 7
  }

  y += 2
  setFont(pdf, 'bold', 13)
  setColor(pdf, accentBlue)
  pdf.text('Total', totalsLabelX, y, { align: 'right' })
  setFont(pdf, 'bold', 13)
  pdf.text(fmtCurrency(total, currency), totalsValueX, y, { align: 'right' })
  y += 10

  // ── Notes ──
  if (notes) {
    setFont(pdf, 'normal', 10)
    const noteLines = pdf.splitTextToSize(notes, cw - 12)
    const noteH = 8 + noteLines.length * 4.5 + 5
    drawRoundedRect(pdf, ml, y, cw, noteH, 3, bgMuted)
    y += 6
    setFont(pdf, 'bold', 8)
    setColor(pdf, grayColor)
    pdf.text('Note', ml + 6, y)
    y += 5
    setFont(pdf, 'normal', 10)
    setColor(pdf, bodyColor)
    y = drawWrappedText(pdf, notes, ml + 6, y, cw - 12, 4.5)
    y += 6
  }

  // ── Signature ──
  if (signature) {
    setFont(pdf, 'normal', 9)
    setColor(pdf, grayColor)
    pdf.text('Authorized Signature', ml, y)
    y += 3
    try { pdf.addImage(signature, 'PNG', ml, y, 40, 12) } catch { /* */ }
    y += 14
    pdf.setDrawColor(blr, blg, blb)
    pdf.line(ml, y, ml + 40, y)
    y += 3
  }

  // ── Payment Details (pinned to bottom) ──
  let bottomY = ph - 16

  // Footer
  setFont(pdf, 'normal', 9)
  setColor(pdf, grayColor)
  pdf.text(yourName || 'Your Company', ml, bottomY)
  pdf.text(`${invoiceNumber} · 1/1`, ml + cw, bottomY, { align: 'right' })
  bottomY -= 6
  pdf.setDrawColor(blr, blg, blb)
  pdf.setLineWidth(0.2)
  pdf.line(ml, bottomY, ml + cw, bottomY)
  bottomY -= 6

  if (beneficiary || iban || bic) {
    let payRows = 0
    if (beneficiary) payRows++
    if (iban) payRows++
    if (bic) payRows++
    if (intermediaryBic) payRows++
    const payH = 10 + payRows * 6.5 + 4

    const payY = bottomY - payH
    drawRoundedRect(pdf, ml, payY, cw, payH, 3, bgMuted)

    let pcy = payY + 8
    setFont(pdf, 'bold', 8)
    setColor(pdf, accentBlue)
    pdf.text('PAYMENT DETAILS', ml + 8, pcy)
    pcy += 8

    const drawPayRow = (label, value) => {
      setFont(pdf, 'bold', 9.5)
      setColor(pdf, accentBlue)
      const labelText = label + ':'
      pdf.text(labelText, ml + 8, pcy)
      const labelW = pdf.getTextWidth(labelText)
      setFont(pdf, 'normal', 9.5)
      setColor(pdf, nameColor)
      pdf.text(' ' + value, ml + 8 + labelW, pcy)
      pcy += 6.5
    }

    if (beneficiary) drawPayRow('Beneficiary', beneficiary)
    if (iban) drawPayRow('IBAN', iban)
    if (bic) drawPayRow('BIC', bic)
    if (intermediaryBic) drawPayRow('Intermediary BIC', intermediaryBic)
  }

  return pdf
}

// ── Public export functions ─────────────────────────────────────────

export const exportExpenseReportPDF = async (data, filename = 'expense-report.pdf') => {
  const { pdf, allAttachments, totalPages } = buildExpenseReportPDF(data)

  // Append attachment pages (image-based)
  for (let i = 0; i < allAttachments.length; i++) {
    const att = allAttachments[i]
    await new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const cvs = document.createElement('canvas')
        cvs.width = img.width
        cvs.height = img.height
        const ctx = cvs.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, cvs.width, cvs.height)
        ctx.drawImage(img, 0, 0)
        const jpegData = cvs.toDataURL('image/jpeg', 0.95)

        pdf.addPage()
        // Header
        pdf.setFontSize(10)
        pdf.setTextColor(100, 116, 139)
        pdf.text(`Attachment: ${att.name}`, 12, 14)
        if (att.expenseDescription) {
          pdf.setFontSize(8)
          pdf.text(att.expenseDescription, 12, 20)
        }

        const margin = 12
        const topOffset = att.expenseDescription ? 26 : 20
        const maxW = 210 - margin * 2
        const maxH = 297 - topOffset - margin

        let w = img.width
        let h = img.height
        const ratio = Math.min(maxW / w, maxH / h, 1)
        w *= ratio
        h *= ratio

        const x = margin + (maxW - w) / 2
        pdf.addImage(jpegData, 'JPEG', x, topOffset, w, h)

        // Footer
        pdf.setFontSize(9)
        pdf.setTextColor(100, 116, 139)
        pdf.text(data.yourName || 'Your Company', 13, 285)
        pdf.text(`${data.reportNumber || 'EXP-001'} · ${i + 2}/${totalPages}`, 197, 285, { align: 'right' })

        resolve()
      }
      img.onerror = () => {
        console.warn('Failed to load attachment image:', att.name)
        resolve()
      }
      img.src = att.data
    })
  }

  pdf.save(filename)
}

export const exportInvoicePDF = async (data, filename = 'invoice.pdf') => {
  const { generatePrintHTML } = await import('../components/InvoicePreview')
  const html2canvas = (await import('html2canvas')).default

  // Create offscreen container in the main document
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;height:1123px;overflow:hidden;z-index:-1;'
  document.body.appendChild(container)

  // Extract just the body content and styles from the HTML template
  const html = generatePrintHTML(data)
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<script>/)

  if (styleMatch && bodyMatch) {
    const style = document.createElement('style')
    style.textContent = styleMatch[1]
    container.appendChild(style)

    const content = document.createElement('div')
    content.style.cssText = 'padding:36px 40px;width:794px;height:1123px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",system-ui,sans-serif;font-size:13px;line-height:1.4;color:#1a1a1a;'
    content.innerHTML = bodyMatch[1]
    container.appendChild(content)
  }

  // Wait for fonts to load
  await new Promise(r => setTimeout(r, 400))

  try {
    const target = container.querySelector('.container') || container.lastElementChild || container
    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      width: 794,
      height: 1123,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      windowHeight: 1123,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297)
    pdf.save(filename)
  } finally {
    document.body.removeChild(container)
  }
}

// Legacy export names for backward compatibility
export const exportToPDF = async (_element, filename = 'invoice.pdf', data = null) => {
  if (data) {
    return exportInvoicePDF(data, filename)
  }
  // Fallback: if called with element but no data, warn
  console.warn('exportToPDF called without data — text-based PDF requires data object')
}

export const exportToPDFWithAttachments = async (_element, _attachments = [], filename = 'expense-report.pdf', data = null) => {
  if (data) {
    return exportExpenseReportPDF(data, filename)
  }
  console.warn('exportToPDFWithAttachments called without data — text-based PDF requires data object')
}
