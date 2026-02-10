import { getTemplateStyles, DEFAULT_TEMPLATE } from '../lib/invoiceTemplates'

const formatCurrency = (amount, currency) => {
  const symbols = { EUR: '€', USD: '$', GBP: '£', CHF: 'Fr.', CAD: 'C$', AUD: 'A$', JPY: '¥', CNY: '¥', INR: '₹', BRL: 'R$', MXN: 'MX$', SEK: 'kr ', NOK: 'kr ', DKK: 'kr ', PLN: 'zł', CZK: 'Kč' }
  return `${symbols[currency] || currency + ' '}${Number(amount || 0).toFixed(2)}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const parts = dateStr.split('T')[0].split('-')
  if (parts.length === 3) {
    const date = new Date(parts[0], parts[1] - 1, parts[2])
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }
  return dateStr
}

export const InvoicePreview = ({ data, fullScreen = false }) => {
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
  const isDark = template === 'midnight' || template === 'charcoal'

  const calculateSubtotal = () =>
    lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0)

  const calculateVat = () =>
    lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0) * (Number(item.vat) || 0) / 100, 0)

  const calculateExpenses = () =>
    expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0)

  const calculateTotal = () => calculateSubtotal() + calculateVat() + calculateExpenses()

  return (
    <div
      className={`${fullScreen ? 'max-w-4xl mx-auto my-8 shadow-xl' : ''}`}
      style={{
        padding: '32px 36px',
        height: '842px',
        minHeight: '842px',
        backgroundColor: styles.bodyBg,
        color: styles.bodyText,
        fontFamily: styles.fontFamily,
      }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-light tracking-tight" style={{ color: styles.bodyText }}>
              Invoice
            </h1>
            {logo && (
              <img src={logo} alt="Logo" className="h-14 w-auto object-contain" />
            )}
          </div>

          <div className="text-sm space-y-0.5">
            <div className="flex">
              <span className="w-28 font-semibold" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Invoice no.</span>
              <span>{invoiceNumber || 'INV-001'}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Issue date</span>
              <span>{formatDate(issueDate) || formatDate(new Date().toISOString().split('T')[0])}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Due date</span>
              <span>{formatDate(dueDate) || '—'}</span>
            </div>
          </div>
        </div>

        {/* From / To */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <div
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: styles.accentColor }}
            >
              From
            </div>
            <div className="text-sm font-semibold mb-1">{yourName || 'Your Name'}</div>
            <div className="text-xs leading-relaxed" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
              {yourAddress && <div className="whitespace-pre-line">{yourAddress}</div>}
              {yourEmail && <div>{yourEmail}</div>}
              {yourTaxId && <div>{yourTaxId}</div>}
            </div>
          </div>
          <div>
            <div
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: styles.accentColor }}
            >
              Bill To
            </div>
            <div className="text-sm font-semibold mb-1">{clientName || 'Client Name'}</div>
            <div className="text-xs leading-relaxed" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
              {clientAddress && <div className="whitespace-pre-line">{clientAddress}</div>}
              {clientEmail && <div>{clientEmail}</div>}
              {clientTaxId && <div>{clientTaxId}</div>}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="flex-1">
          <div
            className="border-t border-b py-3 mb-4"
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
          >
            <div
              className="grid grid-cols-12 gap-2 text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: isDark ? '#64748b' : '#94a3b8' }}
            >
              <div className="col-span-6">Item</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Rate</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            {lineItems.filter(item => item.description).length > 0 ? (
              lineItems.filter(item => item.description).map((item, i) => {
                const lineTotal = (Number(item.quantity) || 0) * (Number(item.price) || 0) * (1 + (Number(item.vat) || 0) / 100)
                return (
                  <div key={i} className="grid grid-cols-12 gap-2 py-2 text-sm">
                    <div className="col-span-6">
                      <div className="font-medium" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>
                        {item.description}
                      </div>
                      {item.comment && (
                        <div className="text-xs mt-0.5" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                          {item.comment}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 text-right font-mono" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                      {Number(item.quantity) || 0}
                    </div>
                    <div className="col-span-2 text-right font-mono" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                      {formatCurrency(Number(item.price) || 0, currency)}
                    </div>
                    <div className="col-span-2 text-right font-semibold font-mono">
                      {formatCurrency(lineTotal, currency)}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="grid grid-cols-12 gap-2 py-2 text-sm" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                <div className="col-span-6">No items</div>
                <div className="col-span-2 text-right">—</div>
                <div className="col-span-2 text-right">—</div>
                <div className="col-span-2 text-right">—</div>
              </div>
            )}
          </div>

          {/* Expenses */}
          {expenses.length > 0 && (
            <div
              className="border-b pb-4 mb-4"
              style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
            >
              <div
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: isDark ? '#64748b' : '#94a3b8' }}
              >
                Expenses
              </div>
              {expenses.map((expense, i) => (
                <div key={i} className="flex justify-between py-1 text-sm">
                  <span style={{ color: isDark ? '#e2e8f0' : '#334155' }}>{expense.description || 'Expense'}</span>
                  <span className="font-mono font-semibold">{formatCurrency(expense.amount || 0, currency)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          <div className="flex justify-end mb-4">
            <div className="space-y-1 text-right">
              <div className="flex justify-between gap-12 text-sm" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(calculateSubtotal(), currency)}</span>
              </div>
              {calculateVat() > 0 && (
                <div className="flex justify-between gap-12 text-sm" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                  <span>VAT</span>
                  <span className="font-mono">{formatCurrency(calculateVat(), currency)}</span>
                </div>
              )}
              {calculateExpenses() > 0 && (
                <div className="flex justify-between gap-12 text-sm" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                  <span>Expenses</span>
                  <span className="font-mono">{formatCurrency(calculateExpenses(), currency)}</span>
                </div>
              )}
              <div
                className="flex justify-between gap-12 text-lg font-bold pt-2 border-t"
                style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: styles.accentColor }}
              >
                <span>Total</span>
                <span className="font-mono">{formatCurrency(calculateTotal(), currency)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div
              className="mb-4 p-3 rounded-lg text-sm"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
            >
              <div className="text-xs font-semibold mb-1" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Note</div>
              <div className="whitespace-pre-line">{notes}</div>
            </div>
          )}

          {/* Signature */}
          {signature && (
            <div className="mb-4">
              <div className="text-xs mb-2" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Authorized Signature</div>
              <img src={signature} alt="Signature" className="h-12 w-auto object-contain" />
              <div className="w-40 mt-1" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}></div>
            </div>
          )}
        </div>

        {/* Payment Details + Footer — pinned to bottom */}
        <div className="mt-auto">
          {(beneficiary || iban || bic) && (
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
            >
              <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: styles.accentColor }}>
                Payment Details
              </div>
              <div className="space-y-2 text-sm">
                {beneficiary && (
                  <div>
                    <span className="font-semibold" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Beneficiary: </span>
                    <span>{beneficiary}</span>
                  </div>
                )}
                {iban && (
                  <div>
                    <span className="font-semibold" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>IBAN: </span>
                    <span className="font-mono">{iban}</span>
                  </div>
                )}
                {bic && (
                  <div>
                    <span className="font-semibold" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>BIC: </span>
                    <span className="font-mono">{bic}</span>
                  </div>
                )}
                {intermediaryBic && (
                  <div>
                    <span className="font-semibold" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Intermediary BIC: </span>
                    <span className="font-mono">{intermediaryBic}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer — always at page bottom */}
          <div
            className="flex justify-between items-center pt-3 mt-3 text-xs"
            style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, color: isDark ? '#64748b' : '#94a3b8' }}
          >
            <span>{yourName || 'Your Company'}</span>
            <span>{invoiceNumber} · 1/1</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Alias for PDF export (uses same component)
export const PDFInvoicePreview = InvoicePreview

// Generate HTML for print/PDF export
export const generatePrintHTML = (data) => {
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
  const isDark = template === 'midnight' || template === 'charcoal'

  const formatCurr = (amount) => {
    const symbols = { EUR: '€', USD: '$', GBP: '£', CHF: 'Fr.', CAD: 'C$', AUD: 'A$', JPY: '¥', CNY: '¥', INR: '₹', BRL: 'R$', MXN: 'MX$', SEK: 'kr ', NOK: 'kr ', DKK: 'kr ', PLN: 'zł', CZK: 'Kč' }
    return `${symbols[currency] || currency + ' '}${Number(amount || 0).toFixed(2)}`
  }

  const fmtDate = (dateStr) => {
    if (!dateStr) return ''
    const parts = dateStr.split('T')[0].split('-')
    if (parts.length === 3) {
      const date = new Date(parts[0], parts[1] - 1, parts[2])
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }
    return dateStr
  }

  const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0)
  const vatAmount = lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0) * (Number(item.vat) || 0) / 100, 0)
  const expensesTotal = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0)
  const total = subtotal + vatAmount + expensesTotal

  const labelColor = isDark ? '#94a3b8' : '#64748b'
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const bgMuted = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Invoice ${invoiceNumber}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", system-ui, sans-serif; }
            html, body { height: 100%; }
            body { padding: 32px 36px; background: ${styles.bodyBg}; color: ${styles.bodyText}; font-size: 13px; line-height: 1.4; }
            @page { size: A4; margin: 0; }
            .container { height: 100%; display: flex; flex-direction: column; }
            .header { margin-bottom: 24px; }
            .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
            .title { font-size: 28px; font-weight: 300; letter-spacing: -0.5px; }
            .logo { height: 56px; width: auto; }
            .meta { font-size: 13px; }
            .meta-row { display: flex; margin-bottom: 2px; }
            .meta-label { width: 100px; font-weight: 600; color: ${labelColor}; }
            .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 24px; }
            .party-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${styles.accentColor}; margin-bottom: 8px; }
            .party-name { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
            .party-detail { font-size: 12px; color: ${labelColor}; line-height: 1.5; }
            .items { flex: 1; }
            .items-table { border-top: 1px solid ${borderColor}; border-bottom: 1px solid ${borderColor}; padding: 12px 0; margin-bottom: 16px; }
            .items-header { display: grid; grid-template-columns: 6fr 2fr 2fr 2fr; gap: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${labelColor}; margin-bottom: 12px; }
            .items-header > div:not(:first-child) { text-align: right; }
            .item-row { display: grid; grid-template-columns: 6fr 2fr 2fr 2fr; gap: 8px; padding: 8px 0; font-size: 13px; }
            .item-row > div:not(:first-child) { text-align: right; font-family: monospace; }
            .item-desc { font-weight: 500; }
            .item-comment { font-size: 11px; color: ${labelColor}; margin-top: 2px; }
            .item-total { font-weight: 600; }
            .totals { display: flex; justify-content: flex-end; margin-bottom: 16px; }
            .totals-inner { text-align: right; }
            .totals-row { display: flex; justify-content: space-between; gap: 48px; font-size: 13px; color: ${labelColor}; margin-bottom: 4px; }
            .totals-row span:last-child { font-family: monospace; }
            .totals-final { display: flex; justify-content: space-between; gap: 48px; font-size: 18px; font-weight: 700; color: ${styles.accentColor}; padding-top: 8px; border-top: 1px solid ${borderColor}; }
            .totals-final span:last-child { font-family: monospace; }
            .notes { background: ${bgMuted}; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; }
            .notes-label { font-size: 11px; font-weight: 600; color: ${labelColor}; margin-bottom: 4px; }
            .bottom-section { margin-top: auto; }
            .payment { background: ${bgMuted}; padding: 16px; border-radius: 8px; }
            .payment-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${styles.accentColor}; margin-bottom: 12px; }
            .payment-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 4px 32px; font-size: 13px; }
            .payment-key { color: ${labelColor}; }
            .payment-value { font-weight: 500; }
            .payment-value.mono { font-family: monospace; font-size: 12px; }
            .footer { display: flex; justify-content: space-between; padding-top: 12px; margin-top: 12px; border-top: 1px solid ${borderColor}; font-size: 11px; color: ${labelColor}; }
            @media print {
                body { padding: 32px 36px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="header-row">
                    <div class="title">Invoice</div>
                    ${logo ? `<img src="${logo}" class="logo" />` : ''}
                </div>
                <div class="meta">
                    <div class="meta-row"><span class="meta-label">Invoice no.</span><span>${invoiceNumber || 'INV-001'}</span></div>
                    <div class="meta-row"><span class="meta-label">Issue date</span><span>${fmtDate(issueDate) || fmtDate(new Date().toISOString().split('T')[0])}</span></div>
                    <div class="meta-row"><span class="meta-label">Due date</span><span>${fmtDate(dueDate) || '—'}</span></div>
                </div>
            </div>

            <div class="parties">
                <div>
                    <div class="party-label">From</div>
                    <div class="party-name">${yourName || 'Your Name'}</div>
                    <div class="party-detail">
                        ${yourAddress ? yourAddress.replace(/\n/g, '<br>') : ''}
                        ${yourEmail ? `<br>${yourEmail}` : ''}
                        ${yourTaxId ? `<br>${yourTaxId}` : ''}
                    </div>
                </div>
                <div>
                    <div class="party-label">Bill To</div>
                    <div class="party-name">${clientName || 'Client Name'}</div>
                    <div class="party-detail">
                        ${clientAddress ? clientAddress.replace(/\n/g, '<br>') : ''}
                        ${clientEmail ? `<br>${clientEmail}` : ''}
                        ${clientTaxId ? `<br>${clientTaxId}` : ''}
                    </div>
                </div>
            </div>

            <div class="items">
                <div class="items-table">
                    <div class="items-header">
                        <div>Item</div>
                        <div>Qty</div>
                        <div>Rate</div>
                        <div>Total</div>
                    </div>
                    ${lineItems.filter(item => item.description).length > 0 ?
                      lineItems.filter(item => item.description).map(item => {
                        const lineTotal = (Number(item.quantity) || 0) * (Number(item.price) || 0) * (1 + (Number(item.vat) || 0) / 100)
                        return `
                          <div class="item-row">
                              <div>
                                  <div class="item-desc">${item.description}</div>
                                  ${item.comment ? `<div class="item-comment">${item.comment}</div>` : ''}
                              </div>
                              <div>${Number(item.quantity) || 0}</div>
                              <div>${formatCurr(Number(item.price) || 0)}</div>
                              <div class="item-total">${formatCurr(lineTotal)}</div>
                          </div>
                        `
                      }).join('') : `
                        <div class="item-row" style="color: ${labelColor}">
                            <div>No items</div>
                            <div>—</div>
                            <div>—</div>
                            <div>—</div>
                        </div>
                      `
                    }
                </div>

                ${expenses.length > 0 ? `
                <div style="border-bottom: 1px solid ${borderColor}; padding-bottom: 16px; margin-bottom: 16px;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${labelColor}; margin-bottom: 12px;">Expenses</div>
                    ${expenses.map(expense => `
                        <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px;">
                            <span>${expense.description || 'Expense'}</span>
                            <span style="font-family: monospace; font-weight: 600;">${formatCurr(expense.amount || 0)}</span>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                <div class="totals">
                    <div class="totals-inner">
                        <div class="totals-row"><span>Subtotal</span><span>${formatCurr(subtotal)}</span></div>
                        ${vatAmount > 0 ? `<div class="totals-row"><span>VAT</span><span>${formatCurr(vatAmount)}</span></div>` : ''}
                        ${expensesTotal > 0 ? `<div class="totals-row"><span>Expenses</span><span>${formatCurr(expensesTotal)}</span></div>` : ''}
                        <div class="totals-final"><span>Total</span><span>${formatCurr(total)}</span></div>
                    </div>
                </div>

                ${notes ? `
                <div class="notes">
                    <div class="notes-label">Note</div>
                    <div style="white-space: pre-line;">${notes}</div>
                </div>
                ` : ''}

                ${signature ? `
                <div style="margin-bottom: 16px;">
                    <div style="font-size: 11px; color: ${labelColor}; margin-bottom: 8px;">Authorized Signature</div>
                    <img src="${signature}" style="height: 48px; width: auto;" />
                    <div style="border-top: 1px solid ${borderColor}; width: 160px; margin-top: 4px;"></div>
                </div>
                ` : ''}
            </div>

            <div class="bottom-section">
                ${(beneficiary || iban || bic) ? `
                <div class="payment">
                    <div class="payment-label">Payment Details</div>
                    <div style="font-size: 13px; line-height: 1.8;">
                        ${beneficiary ? `<div><span style="font-weight: 600; color: ${labelColor}">Beneficiary:</span> ${beneficiary}</div>` : ''}
                        ${iban ? `<div><span style="font-weight: 600; color: ${labelColor}">IBAN:</span> <span style="font-family: monospace;">${iban}</span></div>` : ''}
                        ${bic ? `<div><span style="font-weight: 600; color: ${labelColor}">BIC:</span> <span style="font-family: monospace;">${bic}</span></div>` : ''}
                        ${intermediaryBic ? `<div><span style="font-weight: 600; color: ${labelColor}">Intermediary BIC:</span> <span style="font-family: monospace;">${intermediaryBic}</span></div>` : ''}
                    </div>
                </div>
                ` : ''}

                <div class="footer">
                    <span>${yourName || 'Your Company'}</span>
                    <span>${invoiceNumber} · 1/1</span>
                </div>
            </div>
        </div>
        <script>window.onload = () => window.print();</script>
    </body>
    </html>
  `
}
