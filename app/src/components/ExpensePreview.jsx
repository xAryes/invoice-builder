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

const formatPeriod = (start, end) => {
  if (!start && !end) return ''
  if (start && end) return `${formatDate(start)} - ${formatDate(end)}`
  return formatDate(start || end)
}

export const ExpensePreview = ({ data }) => {
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
  const isDark = template === 'midnight' || template === 'charcoal'

  const total = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0)

  // Group by category
  const byCategory = expenses.reduce((acc, exp) => {
    const cat = exp.category || 'Other'
    acc[cat] = (acc[cat] || 0) + (Number(exp.amount) || 0)
    return acc
  }, {})

  return (
    <div
      style={{
        padding: '32px 36px',
        height: '297mm',
        minHeight: '297mm',
        position: 'relative',
        backgroundColor: styles.bodyBg,
        color: styles.bodyText,
        fontFamily: styles.fontFamily,
      }}
    >
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-light tracking-tight mb-4" style={{ color: styles.bodyText }}>
            Expense Report
          </h1>
          <div className="text-sm space-y-0.5">
            <div className="flex">
              <span className="w-28 font-semibold" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Report no.</span>
              <span>{reportNumber}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Date</span>
              <span>{formatDate(date) || formatDate(new Date().toISOString().split('T')[0])}</span>
            </div>
            {(periodStart || periodEnd) && (
              <div className="flex">
                <span className="w-28 font-semibold" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Period</span>
                <span>{formatPeriod(periodStart, periodEnd)}</span>
              </div>
            )}
          </div>
        </div>

        {/* From / To */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: styles.accentColor }}>
              From
            </div>
            <div className="text-sm font-semibold mb-1">{yourName || 'Your Name'}</div>
            <div className="text-xs leading-relaxed" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
              {yourAddress && <div className="whitespace-pre-line">{yourAddress}</div>}
              {yourEmail && <div>{yourEmail}</div>}
              {yourTaxId && <div>{yourTaxId}</div>}
            </div>
          </div>
          {clientName && (
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: styles.accentColor }}>
                Bill To
              </div>
              <div className="text-sm font-semibold mb-1">{clientName}</div>
              <div className="text-xs leading-relaxed" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                {clientAddress && <div className="whitespace-pre-line">{clientAddress}</div>}
                {clientEmail && <div>{clientEmail}</div>}
                {clientTaxId && <div>{clientTaxId}</div>}
              </div>
            </div>
          )}
        </div>

        {/* Expenses table */}
        <div>
          <div
            className="border-t border-b py-3 mb-4"
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
          >
            <div
              className="grid grid-cols-12 gap-2 text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: isDark ? '#64748b' : '#94a3b8' }}
            >
              <div className="col-span-2">Date</div>
              <div className="col-span-5">Description</div>
              <div className="col-span-3">Category</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            {expenses.filter(e => e.description || e.amount).length > 0 ? (
              expenses.filter(e => e.description || e.amount).map((exp, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 py-2 text-sm">
                  <div className="col-span-2 font-mono text-xs" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                    {formatDate(exp.date)}
                  </div>
                  <div className="col-span-5">
                    <div className="font-medium" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>
                      {exp.description}
                      {exp.attachments?.length > 0 && (
                        <span className="inline-flex items-center gap-0.5 ml-1.5 text-[10px] font-normal" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                          {exp.attachments.length}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-3 text-xs" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                    {exp.category || 'Other'}
                  </div>
                  <div className="col-span-2 text-right font-semibold font-mono">
                    {formatCurrency(exp.amount, currency)}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-2 text-sm" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                No expenses
              </div>
            )}
          </div>

          {/* Category summary */}
          {Object.keys(byCategory).length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                By Category
              </div>
              {Object.entries(byCategory).map(([cat, amt]) => (
                <div key={cat} className="flex justify-between py-1 text-sm">
                  <span style={{ color: isDark ? '#e2e8f0' : '#334155' }}>{cat}</span>
                  <span className="font-mono" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{formatCurrency(amt, currency)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="flex justify-end mb-4">
            <div
              className="flex justify-between gap-12 text-lg font-bold pt-2 border-t"
              style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: styles.accentColor }}
            >
              <span>Total</span>
              <span className="font-mono">{formatCurrency(total, currency)}</span>
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
        </div>

        {/* Payment Details + Footer — pinned to bottom */}
        <div style={{ position: 'absolute', bottom: '32px', left: '36px', right: '36px' }}>
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

          <div
            className="flex justify-between items-center pt-3 mt-3 text-xs"
            style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, color: isDark ? '#64748b' : '#94a3b8' }}
          >
            <span>{yourName || 'Your Company'}</span>
            <span>{reportNumber} · 1/1</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export const generateExpensePrintHTML = (data) => {
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
  const isDark = template === 'midnight' || template === 'charcoal'

  const formatCurr = (amount) => {
    const symbols = { EUR: '€', USD: '$', GBP: '£', CHF: 'Fr.', CAD: 'C$', AUD: 'A$', JPY: '¥', CNY: '¥', INR: '₹', BRL: 'R$' }
    return `${symbols[currency] || currency + ' '}${Number(amount || 0).toFixed(2)}`
  }

  const fmtDate = (dateStr) => {
    if (!dateStr) return ''
    const parts = dateStr.split('T')[0].split('-')
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2])
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }
    return dateStr
  }

  const total = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0)

  const labelColor = isDark ? '#94a3b8' : '#64748b'
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const bgMuted = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Expense Report ${reportNumber}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", system-ui, sans-serif; }
            html, body { height: 100%; }
            body { padding: 32px 36px; background: ${styles.bodyBg}; color: ${styles.bodyText}; font-size: 13px; line-height: 1.4; }
            @page { size: A4; margin: 0; }
            .container { height: 100%; position: relative; }
            .title { font-size: 28px; font-weight: 300; letter-spacing: -0.5px; margin-bottom: 16px; }
            .meta-row { display: flex; margin-bottom: 2px; font-size: 13px; }
            .meta-label { width: 100px; font-weight: 600; color: ${labelColor}; }
            .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin: 24px 0; }
            .party-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${styles.accentColor}; margin-bottom: 8px; }
            .party-name { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
            .party-detail { font-size: 12px; color: ${labelColor}; line-height: 1.5; }
            .items { }
            .items-table { border-top: 1px solid ${borderColor}; border-bottom: 1px solid ${borderColor}; padding: 12px 0; margin-bottom: 16px; }
            .items-header { display: grid; grid-template-columns: 2fr 5fr 3fr 2fr; gap: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${labelColor}; margin-bottom: 12px; }
            .items-header > div:last-child { text-align: right; }
            .item-row { display: grid; grid-template-columns: 2fr 5fr 3fr 2fr; gap: 8px; padding: 6px 0; font-size: 13px; }
            .item-row > div:last-child { text-align: right; font-family: monospace; font-weight: 600; }
            .totals-final { display: flex; justify-content: flex-end; gap: 48px; font-size: 18px; font-weight: 700; color: ${styles.accentColor}; padding-top: 8px; border-top: 1px solid ${borderColor}; margin-bottom: 16px; }
            .totals-final span:last-child { font-family: monospace; }
            .payment { margin-bottom: 16px; }
            .payment-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${styles.accentColor}; margin-bottom: 8px; }
            .payment-detail { font-size: 13px; color: ${labelColor}; line-height: 1.8; }
            .notes { background: ${bgMuted}; padding: 12px; border-radius: 8px; margin-bottom: 16px; }
            .notes-label { font-size: 11px; font-weight: 600; color: ${labelColor}; margin-bottom: 4px; }
            .bottom-section { position: absolute; bottom: 0; left: 0; right: 0; }
            .footer { display: flex; justify-content: space-between; padding-top: 12px; margin-top: 12px; border-top: 1px solid ${borderColor}; font-size: 11px; color: ${labelColor}; }
            @media print { body { padding: 32px 36px; } }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="title">Expense Report</div>
            <div>
                <div class="meta-row"><span class="meta-label">Report no.</span><span>${reportNumber}</span></div>
                <div class="meta-row"><span class="meta-label">Date</span><span>${fmtDate(date) || fmtDate(new Date().toISOString().split('T')[0])}</span></div>
                ${periodStart || periodEnd ? `<div class="meta-row"><span class="meta-label">Period</span><span>${fmtDate(periodStart)} - ${fmtDate(periodEnd)}</span></div>` : ''}
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
                ${clientName ? `
                <div>
                    <div class="party-label">Bill To</div>
                    <div class="party-name">${clientName}</div>
                    <div class="party-detail">
                        ${clientAddress ? clientAddress.replace(/\n/g, '<br>') : ''}
                        ${clientEmail ? `<br>${clientEmail}` : ''}
                        ${clientTaxId ? `<br>${clientTaxId}` : ''}
                    </div>
                </div>
                ` : ''}
            </div>

            <div class="items">
                <div class="items-table">
                    <div class="items-header">
                        <div>Date</div>
                        <div>Description</div>
                        <div>Category</div>
                        <div>Amount</div>
                    </div>
                    ${expenses.filter(e => e.description || e.amount).map(exp => `
                        <div class="item-row">
                            <div style="font-family: monospace; font-size: 12px; color: ${labelColor}">${fmtDate(exp.date)}</div>
                            <div style="font-weight: 500">${exp.description || ''}${(exp.attachments?.length > 0) ? ` <span style="color: ${labelColor}; font-size: 10px; font-weight: 400;">&#x1F4CE; ${exp.attachments.length}</span>` : ''}</div>
                            <div style="font-size: 12px; color: ${labelColor}">${exp.category || 'Other'}</div>
                            <div>${formatCurr(exp.amount)}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="totals-final"><span>Total</span><span>${formatCurr(total)}</span></div>

                ${notes ? `
                <div class="notes">
                    <div class="notes-label">Note</div>
                    <div style="white-space: pre-line;">${notes}</div>
                </div>
                ` : ''}
            </div>

            <div class="bottom-section">
                ${(beneficiary || iban || bic) ? `
                <div class="payment" style="background: ${bgMuted}; padding: 16px; border-radius: 8px;">
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
                    <span>${reportNumber} · 1/1</span>
                </div>
            </div>
        </div>
        <script>window.onload = () => window.print();</script>
    </body>
    </html>
  `
}
