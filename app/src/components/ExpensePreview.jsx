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
    ethAddress,
    paymentMethod = 'bank',
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
  const accent = styles.accentColor
  const gray = isDark ? '#94a3b8' : '#9ca3af'
  const dark = isDark ? '#e2e8f0' : '#1a1a1a'
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
  const muted = isDark ? 'rgba(255,255,255,0.03)' : '#f3f4f6'

  const total = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0)

  const byCategory = expenses.reduce((acc, exp) => {
    const cat = exp.category || 'Other'
    acc[cat] = (acc[cat] || 0) + (Number(exp.amount) || 0)
    return acc
  }, {})

  const allAttachments = expenses.flatMap((exp, i) =>
    (exp.attachments || []).filter(a => a.type?.startsWith('image/')).map(a => ({
      ...a,
      expenseDescription: exp.description || `Expense ${i + 1}`,
    }))
  )
  const totalPages = 1 + allAttachments.length

  return (
    <div>
    <div
      style={{
        padding: '36px 40px',
        height: '297mm',
        minHeight: '297mm',
        position: 'relative',
        backgroundColor: styles.bodyBg,
        color: dark,
        fontFamily: styles.fontFamily,
        fontSize: '13px',
        lineHeight: '1.4',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, letterSpacing: '-0.5px', color: dark, marginBottom: '16px' }}>
            Expense Report
          </h1>
          <div style={{ fontSize: '13px' }}>
            {[
              ['Report no.', reportNumber],
              ['Date', formatDate(date) || formatDate(new Date().toISOString().split('T')[0])],
              ...(periodStart || periodEnd ? [['Period', formatPeriod(periodStart, periodEnd)]] : []),
            ].map(([label, value]) => (
              <div key={label} className="flex" style={{ marginBottom: '3px' }}>
                <span style={{ width: '100px', fontWeight: 600, color: accent }}>{label}</span>
                <span style={{ color: dark }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* From / To */}
        <div className="grid grid-cols-2 gap-8" style={{ marginBottom: '28px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: accent, marginBottom: '8px' }}>From</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: dark, marginBottom: '4px' }}>{yourName || 'Your Name'}</div>
            <div style={{ fontSize: '12px', color: gray, lineHeight: '1.6' }}>
              {yourAddress && <div className="whitespace-pre-line">{yourAddress}</div>}
              {yourEmail && <div>{yourEmail}</div>}
              {yourTaxId && <div>{yourTaxId}</div>}
            </div>
          </div>
          {clientName && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: accent, marginBottom: '8px' }}>Bill To</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: dark, marginBottom: '4px' }}>{clientName}</div>
              <div style={{ fontSize: '12px', color: gray, lineHeight: '1.6' }}>
                {clientAddress && <div className="whitespace-pre-line">{clientAddress}</div>}
                {clientEmail && <div>{clientEmail}</div>}
                {clientTaxId && <div>{clientTaxId}</div>}
              </div>
            </div>
          )}
        </div>

        {/* Expenses table */}
        <div>
          <div style={{ borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`, padding: '14px 0', marginBottom: '20px' }}>
            <div className="grid grid-cols-12 gap-2" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: gray, marginBottom: '14px' }}>
              <div className="col-span-2">Date</div>
              <div className="col-span-5">Description</div>
              <div className="col-span-3">Category</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            {expenses.filter(e => e.description || e.amount).length > 0 ? (
              expenses.filter(e => e.description || e.amount).map((exp, i) => (
                <div key={i} className="grid grid-cols-12 gap-2" style={{ padding: '8px 0', fontSize: '13px' }}>
                  <div className="col-span-2" style={{ fontSize: '12px', color: gray }}>{formatDate(exp.date)}</div>
                  <div className="col-span-5" style={{ fontWeight: 600, color: dark }}>{exp.description}</div>
                  <div className="col-span-3" style={{ fontSize: '12px', color: gray }}>{exp.category || 'Other'}</div>
                  <div className="col-span-2 text-right" style={{ fontWeight: 700, color: dark }}>{formatCurrency(exp.amount, currency)}</div>
                </div>
              ))
            ) : (
              <div style={{ padding: '8px 0', fontSize: '13px', color: gray }}>No expenses</div>
            )}
          </div>

          {/* Category summary */}
          {Object.keys(byCategory).length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: gray, marginBottom: '8px' }}>By Category</div>
              {Object.entries(byCategory).map(([cat, amt]) => (
                <div key={cat} className="flex justify-between" style={{ padding: '4px 0', fontSize: '13px' }}>
                  <span style={{ color: dark }}>{cat}</span>
                  <span style={{ color: gray }}>{formatCurrency(amt, currency)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="flex justify-end" style={{ marginBottom: '20px' }}>
            <div className="flex justify-between" style={{ gap: '48px', fontSize: '18px', fontWeight: 700, color: accent, paddingTop: '10px' }}>
              <span>Total</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div style={{ backgroundColor: muted, padding: '14px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: gray, marginBottom: '5px' }}>Note</div>
              <div className="whitespace-pre-line" style={{ color: dark }}>{notes}</div>
            </div>
          )}
        </div>

        {/* Payment Details + Footer — pushed to bottom */}
        <div style={{ marginTop: 'auto' }}>
          {((paymentMethod === 'bank' && (beneficiary || iban || bic || intermediaryBic)) || (paymentMethod === 'crypto' && ethAddress)) && (
            <div style={{ backgroundColor: muted, padding: '18px 20px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: accent, marginBottom: '14px' }}>
                Payment Details
              </div>
              <div style={{ fontSize: '13px', lineHeight: '2' }}>
                {paymentMethod === 'bank' && (
                  <>
                    {beneficiary && <div><span style={{ fontWeight: 600, color: accent }}>Beneficiary:</span> {beneficiary}</div>}
                    {iban && <div><span style={{ fontWeight: 600, color: accent }}>IBAN:</span> {iban}</div>}
                    {bic && <div><span style={{ fontWeight: 600, color: accent }}>BIC:</span> {bic}</div>}
                    {intermediaryBic && <div><span style={{ fontWeight: 600, color: accent }}>Intermediary BIC:</span> {intermediaryBic}</div>}
                  </>
                )}
                {paymentMethod === 'crypto' && ethAddress && (
                  <>
                    <div><span style={{ fontWeight: 600, color: accent }}>Network:</span> Ethereum (ERC-20)</div>
                    <div><span style={{ fontWeight: 600, color: accent }}>Address:</span> <span style={{ fontSize: '11px' }}>{ethAddress}</span></div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center" style={{ paddingTop: '14px', marginTop: '14px', borderTop: `1px solid ${border}`, fontSize: '11px', color: gray }}>
            <span>{yourName || 'Your Company'}</span>
            <span>{reportNumber} · 1/{totalPages}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Attachment pages */}
    {allAttachments.map((att, i) => (
      <div
        key={i}
        style={{
          padding: '36px 40px',
          height: '297mm',
          minHeight: '297mm',
          position: 'relative',
          backgroundColor: styles.bodyBg,
          color: dark,
          fontFamily: styles.fontFamily,
        }}
      >
        <div style={{ color: gray, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          Attachment
        </div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: dark, marginBottom: '16px' }}>
          {att.name}
          <span style={{ color: gray, fontWeight: 400, marginLeft: '8px' }}>— {att.expenseDescription}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', flex: 1 }}>
          <img src={att.data} alt={att.name} style={{ maxWidth: '100%', maxHeight: '240mm', objectFit: 'contain', borderRadius: '4px' }} />
        </div>
        <div style={{ position: 'absolute', bottom: '36px', left: '40px', right: '40px', display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${border}`, paddingTop: '14px', fontSize: '11px', color: gray }}>
          <span>{yourName || 'Your Company'}</span>
          <span>{reportNumber} · {i + 2}/{totalPages}</span>
        </div>
      </div>
    ))}
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
    ethAddress,
    paymentMethod = 'bank',
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

  const formatCurr = (amount) => {
    const symbols = { EUR: '€', USD: '$', GBP: '£', CHF: 'Fr.', CAD: 'C$', AUD: 'A$', JPY: '¥', CNY: '¥', INR: '₹', BRL: 'R$', MXN: 'MX$', SEK: 'kr ', NOK: 'kr ', DKK: 'kr ', PLN: 'zł', CZK: 'Kč' }
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

  const accent = styles.accentColor
  const gray = isDark ? '#94a3b8' : '#9ca3af'
  const dark = isDark ? '#e2e8f0' : '#1a1a1a'
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
  const muted = isDark ? 'rgba(255,255,255,0.03)' : '#f3f4f6'

  const printAttachments = expenses.flatMap((exp, i) =>
    (exp.attachments || []).filter(a => a.type?.startsWith('image/')).map(a => ({
      ...a,
      expenseDescription: exp.description || `Expense ${i + 1}`,
    }))
  )
  const printTotalPages = 1 + printAttachments.length

  const hasPayment = (paymentMethod === 'bank' && (beneficiary || iban || bic || intermediaryBic)) || (paymentMethod === 'crypto' && ethAddress)

  return `<!DOCTYPE html>
<html>
<head>
    <title>Expense Report ${reportNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", system-ui, sans-serif; }
        html, body { height: 100%; }
        body { padding: 36px 40px; background: ${styles.bodyBg}; color: ${dark}; font-size: 13px; line-height: 1.4; }
        @page { size: A4; margin: 0; }
        .container { min-height: 1051px; display: flex; flex-direction: column; }

        .title { font-size: 28px; font-weight: 300; letter-spacing: -0.5px; color: ${dark}; margin-bottom: 16px; }
        .meta-row { display: flex; margin-bottom: 3px; font-size: 13px; }
        .meta-label { width: 100px; font-weight: 600; color: ${accent}; }

        .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin: 28px 0; }
        .party-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: ${accent}; margin-bottom: 8px; }
        .party-name { font-size: 14px; font-weight: 600; color: ${dark}; margin-bottom: 4px; }
        .party-detail { font-size: 12px; color: ${gray}; line-height: 1.6; }

        .items-table { border-top: 1px solid ${border}; border-bottom: 1px solid ${border}; padding: 14px 0; margin-bottom: 20px; }
        .items-header { display: grid; grid-template-columns: 2fr 5fr 3fr 2fr; gap: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${gray}; margin-bottom: 14px; }
        .items-header > div:last-child { text-align: right; }

        .item-row { display: grid; grid-template-columns: 2fr 5fr 3fr 2fr; gap: 8px; padding: 8px 0; font-size: 13px; }
        .item-date { font-size: 12px; color: ${gray}; }
        .item-desc { font-weight: 600; color: ${dark}; }
        .item-cat { font-size: 12px; color: ${gray}; }
        .item-amt { text-align: right; font-weight: 700; color: ${dark}; }

        .cat-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${gray}; margin-bottom: 8px; }
        .cat-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
        .cat-name { color: ${dark}; }
        .cat-amt { color: ${gray}; }

        .totals-final { display: flex; justify-content: flex-end; gap: 48px; font-size: 18px; font-weight: 700; color: ${accent}; padding-top: 10px; margin-bottom: 20px; }

        .notes { background: ${muted}; padding: 14px 16px; border-radius: 8px; margin-bottom: 16px; }
        .notes-label { font-size: 11px; font-weight: 600; color: ${gray}; margin-bottom: 5px; }

        .bottom-section { margin-top: auto; }
        .payment { background: ${muted}; padding: 18px 20px; border-radius: 10px; }
        .payment-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: ${accent}; margin-bottom: 14px; }
        .payment-rows { font-size: 13px; line-height: 2; }
        .payment-rows .label { font-weight: 600; color: ${accent}; }

        .footer { display: flex; justify-content: space-between; padding-top: 14px; margin-top: 14px; border-top: 1px solid ${border}; font-size: 11px; color: ${gray}; }

        @media print { body { padding: 36px 40px; } }
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

        <div>
            <div class="items-table">
                <div class="items-header">
                    <div>Date</div>
                    <div>Description</div>
                    <div>Category</div>
                    <div>Amount</div>
                </div>
                ${expenses.filter(e => e.description || e.amount).map(exp => `
                    <div class="item-row">
                        <div class="item-date">${fmtDate(exp.date)}</div>
                        <div class="item-desc">${exp.description || ''}</div>
                        <div class="item-cat">${exp.category || 'Other'}</div>
                        <div class="item-amt">${formatCurr(exp.amount)}</div>
                    </div>
                `).join('')}
            </div>

            <div class="totals-final"><span>Total</span><span>${formatCurr(total)}</span></div>

            ${notes ? `
            <div class="notes">
                <div class="notes-label">Note</div>
                <div style="white-space: pre-line; color: ${dark}">${notes}</div>
            </div>
            ` : ''}
        </div>

        <div class="bottom-section">
            ${hasPayment ? `
            <div class="payment">
                <div class="payment-title">Payment Details</div>
                <div class="payment-rows">
                    ${paymentMethod === 'bank' ? `
                        ${beneficiary ? `<div><span class="label">Beneficiary:</span> ${beneficiary}</div>` : ''}
                        ${iban ? `<div><span class="label">IBAN:</span> ${iban}</div>` : ''}
                        ${bic ? `<div><span class="label">BIC:</span> ${bic}</div>` : ''}
                        ${intermediaryBic ? `<div><span class="label">Intermediary BIC:</span> ${intermediaryBic}</div>` : ''}
                    ` : ''}
                    ${paymentMethod === 'crypto' && ethAddress ? `
                        <div><span class="label">Network:</span> Ethereum (ERC-20)</div>
                        <div><span class="label">Address:</span> <span style="font-size: 11px;">${ethAddress}</span></div>
                    ` : ''}
                </div>
            </div>
            ` : ''}

            <div class="footer">
                <span>${yourName || 'Your Company'}</span>
                <span>${reportNumber} · 1/${printTotalPages}</span>
            </div>
        </div>
    </div>

    ${printAttachments.map((att, i) => `
    <div class="container" style="page-break-before: always;">
        <div style="color: ${gray}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Attachment</div>
        <div style="font-size: 13px; font-weight: 500; color: ${dark}; margin-bottom: 16px;">
            ${att.name}
            <span style="color: ${gray}; font-weight: 400; margin-left: 8px;">— ${att.expenseDescription}</span>
        </div>
        <div style="text-align: center;">
            <img src="${att.data}" alt="${att.name}" style="max-width: 100%; max-height: 240mm; object-fit: contain; border-radius: 4px;" />
        </div>
        <div class="footer" style="position: absolute; bottom: 0; left: 0; right: 0;">
            <span>${yourName || 'Your Company'}</span>
            <span>${reportNumber} · ${i + 2}/${printTotalPages}</span>
        </div>
    </div>
    `).join('')}

    <script>window.onload = () => window.print();</script>
</body>
</html>`
}
