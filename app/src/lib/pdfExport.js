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
    drawRoundedRect(pdf, ml, y, cw, 18, 2, bgMuted)
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
  const labelColor = isDark ? '#94a3b8' : '#64748b'
  const nameColor = isDark ? '#e2e8f0' : '#334155'
  const borderColorHex = isDark ? '#334155' : '#d4d4d4'
  const bgMuted = isDark ? '#1e293b' : '#f5f5f5'

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pw = 210
  const ph = 297
  const ml = 13
  const mr = 13
  const cw = pw - ml - mr

  // Page background
  if (isDark) {
    const [br, bg, bb] = hexToRGB(styles.bodyBg)
    pdf.setFillColor(br, bg, bb)
    pdf.rect(0, 0, pw, ph, 'F')
  }

  let y = 14

  // ── Title + Logo ──
  setFont(pdf, 'normal', 28)
  setColor(pdf, styles.bodyText)
  pdf.text('Invoice', ml, y + 8)

  if (logo) {
    try { pdf.addImage(logo, 'JPEG', ml + cw - 30, y - 4, 30, 14) } catch { /* logo failed */ }
  }
  y += 16

  // ── Meta block ──
  const metaLabelW = 26

  const metaRows = [
    ['Invoice no.', invoiceNumber || 'INV-001'],
    ['Issue date', fmtDate(issueDate) || fmtDate(new Date().toISOString().split('T')[0])],
    ['Due date', fmtDate(dueDate) || '\u2014'],
  ]

  for (const [label, value] of metaRows) {
    setFont(pdf, 'bold', 11)
    setColor(pdf, labelColor)
    pdf.text(label, ml, y)
    setFont(pdf, 'normal', 11)
    setColor(pdf, styles.bodyText)
    pdf.text(value, ml + metaLabelW, y)
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
    pdf.text(name || (label === 'From' ? 'Your Name' : 'Client Name'), x, py)
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
  const toEnd = drawParty(toX, 'Bill To', clientName, clientAddress, clientEmail, clientTaxId)
  y = Math.max(fromEnd, toEnd) + 6

  // ── Line Items table ──
  const [blr, blg, blb] = hexToRGB(borderColorHex)
  pdf.setDrawColor(blr, blg, blb)
  pdf.setLineWidth(0.3)
  pdf.line(ml, y, ml + cw, y)
  y += 5

  // Column positions: Item(6) | Qty(2) | Rate(2) | Total(2)
  const colItem = ml
  const colQty = ml + cw * 6 / 12
  const colRate = ml + cw * 8 / 12
  const colTotal = ml + cw

  setFont(pdf, 'bold', 9)
  setColor(pdf, labelColor)
  pdf.text('ITEM', colItem, y)
  pdf.text('QTY', colQty, y, { align: 'right' })
  pdf.text('RATE', colRate, y, { align: 'right' })
  pdf.text('TOTAL', colTotal, y, { align: 'right' })
  y += 5

  pdf.line(ml, y, ml + cw, y)
  y += 4

  // Data rows
  const filteredItems = lineItems.filter(item => item.description)
  if (filteredItems.length > 0) {
    for (const item of filteredItems) {
      const lineTotal = (Number(item.quantity) || 0) * (Number(item.price) || 0) * (1 + (Number(item.vat) || 0) / 100)

      setFont(pdf, 'normal', 11)
      setColor(pdf, nameColor)
      pdf.text(item.description, colItem, y)

      setMonoFont(pdf, 'normal', 10)
      setColor(pdf, labelColor)
      pdf.text(String(Number(item.quantity) || 0), colQty, y, { align: 'right' })
      pdf.text(fmtCurrency(Number(item.price) || 0, currency), colRate, y, { align: 'right' })

      setMonoFont(pdf, 'bold', 11)
      setColor(pdf, styles.bodyText)
      pdf.text(fmtCurrency(lineTotal, currency), colTotal, y, { align: 'right' })
      y += 5

      // Comment sub-line
      if (item.comment) {
        setFont(pdf, 'normal', 9)
        setColor(pdf, labelColor)
        pdf.text(item.comment, colItem, y)
        y += 4
      }
      y += 1
    }
  } else {
    setFont(pdf, 'normal', 11)
    setColor(pdf, labelColor)
    pdf.text('No items', colItem, y)
    y += 6
  }

  y += 2

  // ── Expenses (if any) ──
  const expensesTotal = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  if (expenses.length > 0) {
    pdf.line(ml, y, ml + cw, y)
    y += 5
    setFont(pdf, 'bold', 9)
    setColor(pdf, labelColor)
    pdf.text('EXPENSES', ml, y)
    y += 5

    for (const expense of expenses) {
      setFont(pdf, 'normal', 11)
      setColor(pdf, nameColor)
      pdf.text(expense.description || 'Expense', ml, y)
      setMonoFont(pdf, 'bold', 11)
      setColor(pdf, styles.bodyText)
      pdf.text(fmtCurrency(expense.amount || 0, currency), ml + cw, y, { align: 'right' })
      y += 5
    }
    y += 3
  }

  // ── Totals ──
  const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0)
  const vatAmount = lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0) * (Number(item.vat) || 0) / 100, 0)
  const total = subtotal + vatAmount + expensesTotal

  const totalsX = ml + cw - 70

  setFont(pdf, 'normal', 11)
  setColor(pdf, labelColor)
  pdf.text('Subtotal', totalsX, y)
  setMonoFont(pdf, 'normal', 11)
  pdf.text(fmtCurrency(subtotal, currency), ml + cw, y, { align: 'right' })
  y += 5

  if (vatAmount > 0) {
    setFont(pdf, 'normal', 11)
    setColor(pdf, labelColor)
    pdf.text('VAT', totalsX, y)
    setMonoFont(pdf, 'normal', 11)
    pdf.text(fmtCurrency(vatAmount, currency), ml + cw, y, { align: 'right' })
    y += 5
  }

  if (expensesTotal > 0) {
    setFont(pdf, 'normal', 11)
    setColor(pdf, labelColor)
    pdf.text('Expenses', totalsX, y)
    setMonoFont(pdf, 'normal', 11)
    pdf.text(fmtCurrency(expensesTotal, currency), ml + cw, y, { align: 'right' })
    y += 5
  }

  // Total line
  pdf.line(totalsX, y, ml + cw, y)
  y += 6
  setFont(pdf, 'bold', 16)
  setColor(pdf, styles.accentColor)
  pdf.text('Total', totalsX, y)
  setMonoFont(pdf, 'bold', 16)
  pdf.text(fmtCurrency(total, currency), ml + cw, y, { align: 'right' })
  y += 8

  // ── Notes ──
  if (notes) {
    drawRoundedRect(pdf, ml, y, cw, 18, 2, bgMuted)
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

  // ── Signature ──
  if (signature) {
    setFont(pdf, 'normal', 9)
    setColor(pdf, labelColor)
    pdf.text('Authorized Signature', ml, y)
    y += 3
    try { pdf.addImage(signature, 'PNG', ml, y, 40, 12) } catch { /* sig failed */ }
    y += 14
    pdf.setDrawColor(blr, blg, blb)
    pdf.line(ml, y, ml + 40, y)
    y += 3
  }

  // ── Payment Details (pinned near bottom) ──
  let bottomY = ph - 12
  // Footer
  setFont(pdf, 'normal', 9)
  setColor(pdf, labelColor)
  pdf.text(yourName || 'Your Company', ml, bottomY)
  pdf.text(`${invoiceNumber} · 1/1`, ml + cw, bottomY, { align: 'right' })
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
  const pdf = buildInvoicePDF(data)
  pdf.save(filename)
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
