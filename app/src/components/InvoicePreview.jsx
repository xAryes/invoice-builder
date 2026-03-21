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
    ethAddress,
    paymentMethod = 'bank',
    logo,
    signature,
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

  const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0)
  const vatAmount = lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0) * (Number(item.vat) || 0) / 100, 0)
  const expensesTotal = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0)
  const total = subtotal + vatAmount + expensesTotal

  return (
    <div
      className={`${fullScreen ? 'max-w-4xl mx-auto my-8 shadow-xl' : ''}`}
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
          <div className="flex justify-between items-start" style={{ marginBottom: '16px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 300, letterSpacing: '-0.5px', color: dark }}>
              Invoice
            </h1>
            {logo && <img src={logo} alt="Logo" style={{ height: '56px', width: 'auto' }} />}
          </div>

          <div style={{ fontSize: '13px' }}>
            {[
              ['Invoice no.', invoiceNumber || 'INV-001'],
              ['Issue date', formatDate(issueDate) || formatDate(new Date().toISOString().split('T')[0])],
              ['Due date', formatDate(dueDate) || '—'],
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
          {[
            { label: 'From', name: yourName || 'Your Name', address: yourAddress, email: yourEmail, taxId: yourTaxId },
            { label: 'Bill To', name: clientName || 'Client Name', address: clientAddress, email: clientEmail, taxId: clientTaxId },
          ].map(party => (
            <div key={party.label}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: accent, marginBottom: '8px' }}>
                {party.label}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: dark, marginBottom: '4px' }}>{party.name}</div>
              <div style={{ fontSize: '12px', color: gray, lineHeight: '1.6' }}>
                {party.address && <div className="whitespace-pre-line">{party.address}</div>}
                {party.email && <div>{party.email}</div>}
                {party.taxId && <div>{party.taxId}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Line Items */}
        <div>
          <div style={{ borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`, padding: '14px 0', marginBottom: '20px' }}>
            <div className="grid grid-cols-12 gap-2" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: gray, marginBottom: '14px' }}>
              <div className="col-span-6">Item</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Rate</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            {lineItems.filter(item => item.description).length > 0 ? (
              lineItems.filter(item => item.description).map((item, i) => {
                const lineTotal = (Number(item.quantity) || 0) * (Number(item.price) || 0) * (1 + (Number(item.vat) || 0) / 100)
                return (
                  <div key={i} className="grid grid-cols-12 gap-2" style={{ padding: '8px 0', fontSize: '13px' }}>
                    <div className="col-span-6">
                      <div style={{ fontWeight: 600, color: dark }}>{item.description}</div>
                      {item.comment && (
                        <div style={{ fontSize: '11px', color: gray, marginTop: '3px', lineHeight: '1.5' }}>{item.comment}</div>
                      )}
                    </div>
                    <div className="col-span-2 text-right" style={{ color: gray }}>{Number(item.quantity) || 0}</div>
                    <div className="col-span-2 text-right" style={{ color: gray }}>{formatCurrency(Number(item.price) || 0, currency)}</div>
                    <div className="col-span-2 text-right" style={{ fontWeight: 700, color: dark }}>{formatCurrency(lineTotal, currency)}</div>
                  </div>
                )
              })
            ) : (
              <div className="grid grid-cols-12 gap-2" style={{ padding: '8px 0', fontSize: '13px', color: gray }}>
                <div className="col-span-6">No items</div>
                <div className="col-span-2 text-right">—</div>
                <div className="col-span-2 text-right">—</div>
                <div className="col-span-2 text-right">—</div>
              </div>
            )}
          </div>

          {/* Expenses */}
          {expenses.length > 0 && (
            <div style={{ borderBottom: `1px solid ${border}`, paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: gray, marginBottom: '12px' }}>Expenses</div>
              {expenses.map((expense, i) => (
                <div key={i} className="flex justify-between" style={{ padding: '4px 0', fontSize: '13px' }}>
                  <span style={{ color: dark }}>{expense.description || 'Expense'}</span>
                  <span style={{ fontWeight: 600, color: dark }}>{formatCurrency(expense.amount || 0, currency)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          <div className="flex justify-end" style={{ marginBottom: '20px' }}>
            <div>
              <div className="flex justify-between" style={{ gap: '48px', fontSize: '13px', color: gray, marginBottom: '6px' }}>
                <span>Subtotal</span>
                <span style={{ color: dark }}>{formatCurrency(subtotal, currency)}</span>
              </div>
              {vatAmount > 0 && (
                <div className="flex justify-between" style={{ gap: '48px', fontSize: '13px', color: gray, marginBottom: '6px' }}>
                  <span>VAT</span>
                  <span style={{ color: dark }}>{formatCurrency(vatAmount, currency)}</span>
                </div>
              )}
              {expensesTotal > 0 && (
                <div className="flex justify-between" style={{ gap: '48px', fontSize: '13px', color: gray, marginBottom: '6px' }}>
                  <span>Expenses</span>
                  <span style={{ color: dark }}>{formatCurrency(expensesTotal, currency)}</span>
                </div>
              )}
              <div className="flex justify-between" style={{ gap: '48px', fontSize: '18px', fontWeight: 700, color: accent, paddingTop: '10px' }}>
                <span>Total</span>
                <span>{formatCurrency(total, currency)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div style={{ backgroundColor: muted, padding: '14px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: gray, marginBottom: '5px' }}>Note</div>
              <div className="whitespace-pre-line" style={{ color: dark }}>{notes}</div>
            </div>
          )}

          {/* Signature */}
          {signature && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: gray, marginBottom: '8px' }}>Authorized Signature</div>
              <img src={signature} alt="Signature" style={{ height: '48px', width: 'auto' }} />
              <div style={{ borderTop: `1px solid ${border}`, width: '160px', marginTop: '4px' }} />
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
            <span>{invoiceNumber} · 1/1</span>
          </div>
        </div>
      </div>
    </div>
  )
}

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
    ethAddress,
    paymentMethod = 'bank',
    logo,
    signature,
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
      const date = new Date(parts[0], parts[1] - 1, parts[2])
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }
    return dateStr
  }

  const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0)
  const vatAmount = lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0) * (Number(item.vat) || 0) / 100, 0)
  const expensesTotal = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0)
  const total = subtotal + vatAmount + expensesTotal

  const accent = styles.accentColor
  const gray = isDark ? '#94a3b8' : '#9ca3af'
  const dark = isDark ? '#e2e8f0' : '#1a1a1a'
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
  const muted = isDark ? 'rgba(255,255,255,0.03)' : '#f3f4f6'

  return `<!DOCTYPE html>
<html>
<head>
    <title>Invoice ${invoiceNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", system-ui, sans-serif; }
        html, body { height: 100%; }
        body { padding: 36px 40px; background: ${styles.bodyBg}; color: ${dark}; font-size: 13px; line-height: 1.4; }
        @page { size: A4; margin: 0; }
        .container { min-height: 1051px; display: flex; flex-direction: column; }

        .header { margin-bottom: 24px; }
        .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .title { font-size: 28px; font-weight: 300; letter-spacing: -0.5px; color: ${dark}; }
        .logo { height: 56px; width: auto; }

        .meta-row { display: flex; margin-bottom: 3px; font-size: 13px; }
        .meta-label { width: 100px; font-weight: 600; color: ${accent}; }

        .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 28px; }
        .party-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: ${accent}; margin-bottom: 8px; }
        .party-name { font-size: 14px; font-weight: 600; color: ${dark}; margin-bottom: 4px; }
        .party-detail { font-size: 12px; color: ${gray}; line-height: 1.6; }

        .items-table { border-top: 1px solid ${border}; border-bottom: 1px solid ${border}; padding: 14px 0; margin-bottom: 20px; }
        .items-header { display: grid; grid-template-columns: 6fr 2fr 2fr 2fr; gap: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${gray}; margin-bottom: 14px; }
        .items-header > div:not(:first-child) { text-align: right; }

        .item-row { display: grid; grid-template-columns: 6fr 2fr 2fr 2fr; gap: 8px; padding: 8px 0; font-size: 13px; }
        .item-row > div:not(:first-child) { text-align: right; }
        .item-desc { font-weight: 600; color: ${dark}; }
        .item-comment { font-size: 11px; color: ${gray}; margin-top: 3px; line-height: 1.5; }
        .item-qty, .item-rate { color: ${gray}; }
        .item-total { font-weight: 700; color: ${dark}; }

        .totals { display: flex; justify-content: flex-end; margin-bottom: 20px; }
        .totals-row { display: flex; justify-content: space-between; gap: 48px; font-size: 13px; color: ${gray}; margin-bottom: 6px; }
        .totals-row .val { color: ${dark}; }
        .totals-final { display: flex; justify-content: space-between; gap: 48px; font-size: 18px; font-weight: 700; color: ${accent}; padding-top: 10px; }

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
        <div class="header">
            <div class="header-row">
                <div class="title">Invoice</div>
                ${logo ? `<img src="${logo}" class="logo" />` : ''}
            </div>
            <div>
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

        <div>
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
                          <div class="item-qty">${Number(item.quantity) || 0}</div>
                          <div class="item-rate">${formatCurr(Number(item.price) || 0)}</div>
                          <div class="item-total">${formatCurr(lineTotal)}</div>
                      </div>
                    `
                  }).join('') : `
                    <div class="item-row" style="color: ${gray}">
                        <div>No items</div><div>—</div><div>—</div><div>—</div>
                    </div>
                  `
                }
            </div>

            ${expenses.length > 0 ? `
            <div style="border-bottom: 1px solid ${border}; padding-bottom: 16px; margin-bottom: 16px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${gray}; margin-bottom: 12px;">Expenses</div>
                ${expenses.map(expense => `
                    <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px;">
                        <span style="color: ${dark}">${expense.description || 'Expense'}</span>
                        <span style="font-weight: 600; color: ${dark}">${formatCurr(expense.amount || 0)}</span>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            <div class="totals">
                <div>
                    <div class="totals-row"><span>Subtotal</span><span class="val">${formatCurr(subtotal)}</span></div>
                    ${vatAmount > 0 ? `<div class="totals-row"><span>VAT</span><span class="val">${formatCurr(vatAmount)}</span></div>` : ''}
                    ${expensesTotal > 0 ? `<div class="totals-row"><span>Expenses</span><span class="val">${formatCurr(expensesTotal)}</span></div>` : ''}
                    <div class="totals-final"><span>Total</span><span>${formatCurr(total)}</span></div>
                </div>
            </div>

            ${notes ? `
            <div class="notes">
                <div class="notes-label">Note</div>
                <div style="white-space: pre-line; color: ${dark}">${notes}</div>
            </div>
            ` : ''}

            ${signature ? `
            <div style="margin-bottom: 16px;">
                <div style="font-size: 11px; color: ${gray}; margin-bottom: 8px;">Authorized Signature</div>
                <img src="${signature}" style="height: 48px; width: auto;" />
                <div style="border-top: 1px solid ${border}; width: 160px; margin-top: 4px;"></div>
            </div>
            ` : ''}
        </div>

        <div class="bottom-section">
            ${((paymentMethod === 'bank' && (beneficiary || iban || bic || intermediaryBic)) || (paymentMethod === 'crypto' && ethAddress)) ? `
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
                <span>${invoiceNumber} · 1/1</span>
            </div>
        </div>
    </div>
    <script>window.onload = () => window.print();</script>
</body>
</html>`
}
