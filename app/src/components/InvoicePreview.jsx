import { getTemplateStyles, DEFAULT_TEMPLATE } from '../lib/invoiceTemplates'

const formatCurrency = (amount, currency) => {
  const symbols = { EUR: '€', USD: '$', GBP: '£', CHF: 'CHF ' }
  return `${symbols[currency] || currency + ' '}${amount.toFixed(2)}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const InvoicePreview = ({ data, fullScreen = false }) => {
  const {
    invoiceNumber = 'INV-001',
    issueDate,
    dueDate,
    currency = 'EUR',
    projectName,
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
    beneficiary,
    iban,
    bic,
    intermediaryBic,
    logo,
    signature,
    template = DEFAULT_TEMPLATE,
  } = data

  const styles = getTemplateStyles(template)

  const calculateSubtotal = () =>
    lineItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)

  const calculateVat = () =>
    lineItems.reduce((sum, item) => sum + (item.quantity * item.price * item.vat / 100), 0)

  const calculateTotal = () => calculateSubtotal() + calculateVat()

  return (
    <div
      className={`${fullScreen ? 'max-w-4xl mx-auto my-8 shadow-xl' : ''}`}
      style={{
        padding: '40px 44px',
        height: '842px',
        minHeight: '842px',
        backgroundColor: styles.bodyBg,
        color: styles.bodyText,
        fontFamily: styles.fontFamily,
      }}
    >
      <div className="flex flex-col" style={{ height: '762px' }}>
        <div className="flex-1">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-4xl font-normal" style={{ color: styles.accentColor }}>Invoice</h1>
              {logo && (
                <img src={logo} alt="Logo" className="h-12 w-auto object-contain" />
              )}
            </div>
            <div className="text-sm space-y-1">
              <div className="flex">
                <span className="w-32" style={{ color: styles.mutedText }}>Invoice number</span>
                <span>{invoiceNumber || 'INV-001'}</span>
              </div>
              <div className="flex">
                <span className="w-32" style={{ color: styles.mutedText }}>Issue date</span>
                <span>{formatDate(issueDate) || formatDate(new Date().toISOString().split('T')[0])}</span>
              </div>
              <div className="flex">
                <span className="w-32" style={{ color: styles.mutedText }}>Due date</span>
                <span>{formatDate(dueDate) || '-'}</span>
              </div>
              {projectName && (
                <div className="flex mt-2">
                  <span className="w-32" style={{ color: styles.mutedText }}>Project</span>
                  <span className="font-medium">{projectName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Parties */}
          <div className="flex justify-between mb-8">
            <div className="w-5/12">
              <p className="font-bold text-sm mb-1">{yourName || 'Your Name / Company'}</p>
              <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: styles.mutedText }}>
                {yourAddress || 'Your Address'}
              </p>
              {yourEmail && <p className="text-sm" style={{ color: styles.mutedText }}>{yourEmail}</p>}
              {yourTaxId && <p className="text-sm" style={{ color: styles.mutedText }}>{yourTaxId}</p>}
            </div>
            <div className="w-5/12">
              <p className="font-bold text-sm mb-1">{clientName || 'Client Name / Company'}</p>
              <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: styles.mutedText }}>
                {clientAddress || 'Client Address'}
              </p>
              {clientEmail && <p className="text-sm" style={{ color: styles.mutedText }}>{clientEmail}</p>}
              {clientTaxId && <p className="text-sm" style={{ color: styles.mutedText }}>{clientTaxId}</p>}
            </div>
          </div>

          {/* Line Items */}
          <table className="w-full mb-5">
            <thead>
              <tr style={{ backgroundColor: styles.tableHeaderBg, color: styles.tableHeaderText }}>
                <th className="text-left py-3 px-4 text-xs font-normal">Description</th>
                <th className="text-right py-3 px-4 text-xs font-normal w-14">Qty</th>
                <th className="text-right py-3 px-4 text-xs font-normal w-20">Unit price</th>
                <th className="text-right py-3 px-4 text-xs font-normal w-14">VAT %</th>
                <th className="text-right py-3 px-4 text-xs font-normal w-20">VAT amt</th>
                <th className="text-right py-3 px-4 text-xs font-normal w-24">Total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.filter(item => item.description).length > 0 ? (
                lineItems.filter(item => item.description).map((item, i, arr) => {
                  const subtotal = item.quantity * item.price
                  const vatAmount = subtotal * (item.vat / 100)
                  const isLast = i === arr.length - 1
                  return (
                    <tr
                      key={i}
                      style={{
                        borderBottom: isLast ? `2px solid ${styles.accentColor}` : `1px solid ${styles.borderColor}`,
                      }}
                    >
                      <td className="py-3 px-4 text-sm">
                        <div>{item.description}</div>
                        {item.comment && (
                          <div className="text-xs mt-1" style={{ color: styles.mutedText }}>{item.comment}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-right align-top">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-sm text-right align-top">
                        {formatCurrency(item.price, currency)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right align-top">{item.vat}%</td>
                      <td className="py-3 px-4 text-sm text-right align-top" style={{ color: styles.mutedText }}>
                        {formatCurrency(vatAmount, currency)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right align-top font-medium">
                        {formatCurrency(subtotal + vatAmount, currency)}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr style={{ borderBottom: `2px solid ${styles.accentColor}` }}>
                  <td className="py-3 px-4 text-sm" style={{ color: styles.mutedText }}>No items</td>
                  <td className="py-3 px-4 text-sm text-right" style={{ color: styles.mutedText }}>-</td>
                  <td className="py-3 px-4 text-sm text-right" style={{ color: styles.mutedText }}>-</td>
                  <td className="py-3 px-4 text-sm text-right" style={{ color: styles.mutedText }}>-</td>
                  <td className="py-3 px-4 text-sm text-right" style={{ color: styles.mutedText }}>-</td>
                  <td className="py-3 px-4 text-sm text-right" style={{ color: styles.mutedText }}>-</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-64">
              <div className="flex justify-between py-2 text-sm">
                <span>Total excl. VAT</span>
                <span>{formatCurrency(calculateSubtotal(), currency)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span>Total VAT amount</span>
                <span>{formatCurrency(calculateVat(), currency)}</span>
              </div>
              <div
                className="flex justify-between py-2 text-sm font-bold px-2 -mx-2"
                style={{ backgroundColor: styles.totalsBg }}
              >
                <span>Total incl. VAT</span>
                <span>{formatCurrency(calculateTotal(), currency)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div
              className="mb-6 p-4 rounded"
              style={{ backgroundColor: styles.paymentBg, border: `1px solid ${styles.borderColor}` }}
            >
              <p className="text-xs mb-1" style={{ color: styles.mutedText }}>Note</p>
              <p className="text-sm whitespace-pre-line">{notes}</p>
            </div>
          )}

          {/* Signature */}
          {signature && (
            <div className="mb-6">
              <p className="text-xs mb-2" style={{ color: styles.mutedText }}>Authorized Signature</p>
              <img src={signature} alt="Signature" className="h-16 w-auto object-contain" />
              <div className="w-48 mt-1" style={{ borderTop: `1px solid ${styles.borderColor}` }}></div>
            </div>
          )}
        </div>

        {/* Payment Details */}
        <div
          className="p-5 mt-auto"
          style={{
            backgroundColor: styles.paymentBg,
            borderTop: `4px solid ${styles.paymentBorder}`,
          }}
        >
          <p className="font-bold text-sm mb-4">Payment details</p>
          <div className="flex flex-wrap gap-x-12 gap-y-3 text-sm">
            <div>
              <p className="text-xs mb-1" style={{ color: styles.mutedText }}>Beneficiary name</p>
              <p>{beneficiary || '-'}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: styles.mutedText }}>BIC</p>
              <p>{bic || '-'}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: styles.mutedText }}>IBAN</p>
              <p>{iban || '-'}</p>
            </div>
            {intermediaryBic && (
              <div>
                <p className="text-xs mb-1" style={{ color: styles.mutedText }}>Intermediary bank BIC</p>
                <p>{intermediaryBic}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-between items-center pt-3 mt-3 text-xs"
          style={{ borderTop: `1px solid ${styles.borderColor}`, color: styles.mutedText }}
        >
          <span>{yourName || 'Your Company'}</span>
          <span>{invoiceNumber} · 1/1</span>
        </div>
      </div>
    </div>
  )
}

// Export function for PDF export
export const generatePrintHTML = (data) => {
  const {
    invoiceNumber = 'INV-001',
    issueDate,
    dueDate,
    currency = 'EUR',
    projectName,
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
    beneficiary,
    iban,
    bic,
    intermediaryBic,
    logo,
    signature,
    template = DEFAULT_TEMPLATE,
  } = data

  const styles = getTemplateStyles(template)

  const formatCurr = (amount) => {
    const symbols = { EUR: '€', USD: '$', GBP: '£', CHF: 'CHF ' }
    return `${symbols[currency] || currency + ' '}${amount.toFixed(2)}`
  }

  const fmtDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const vatAmount = lineItems.reduce((sum, item) => sum + (item.quantity * item.price * item.vat / 100), 0)
  const total = subtotal + vatAmount

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Invoice ${invoiceNumber}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: ${styles.fontFamily}; }
            body { padding: 50px 55px; background: ${styles.bodyBg}; color: ${styles.bodyText}; font-size: 13px; min-height: 100vh; line-height: 1.4; }
            @page { size: A4; margin: 0; }
            .invoice-container { min-height: 247mm; height: 247mm; display: flex; flex-direction: column; }
            .invoice-content { flex: 1; }
            .header { margin-bottom: 35px; }
            .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; }
            .title { font-size: 36px; font-weight: normal; color: ${styles.accentColor}; }
            .logo { height: 48px; width: auto; object-fit: contain; }
            .meta-table { font-size: 13px; }
            .meta-table td { padding: 3px 0; }
            .meta-table td:first-child { color: ${styles.mutedText}; padding-right: 40px; }
            .parties { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .party { width: 45%; }
            .party-name { font-weight: bold; font-size: 14px; margin-bottom: 6px; }
            .party-detail { color: ${styles.mutedText}; font-size: 13px; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: ${styles.tableHeaderBg}; color: ${styles.tableHeaderText}; text-align: left; padding: 12px 15px; font-weight: normal; font-size: 12px; }
            th:not(:first-child) { text-align: right; }
            td { padding: 14px 15px; border-bottom: 1px solid ${styles.borderColor}; font-size: 13px; }
            td:not(:first-child) { text-align: right; }
            tr:last-child td { border-bottom: 2px solid ${styles.accentColor}; }
            .totals-section { display: flex; justify-content: flex-end; margin-bottom: 30px; }
            .totals-table { width: 280px; }
            .totals-table td { padding: 8px 0; font-size: 13px; border: none; }
            .totals-table td:last-child { text-align: right; }
            .totals-table tr:last-child td { font-weight: bold; font-size: 14px; padding-top: 12px; border-top: 1px solid ${styles.borderColor}; }
            .totals-table .highlight { background: ${styles.totalsBg}; }
            .totals-table .highlight td { padding: 10px 8px; }
            .payment { background: ${styles.paymentBg}; padding: 20px 25px; margin-top: auto; border-top: 4px solid ${styles.paymentBorder}; }
            .payment-title { font-weight: bold; font-size: 13px; margin-bottom: 15px; }
            .payment-grid { display: flex; flex-wrap: wrap; gap: 25px 50px; }
            .payment-item .label { font-size: 11px; color: ${styles.mutedText}; margin-bottom: 3px; }
            .payment-item .value { font-size: 13px; }
            .footer { display: flex; justify-content: space-between; align-items: center; padding-top: 15px; margin-top: 15px; border-top: 1px solid ${styles.borderColor}; font-size: 11px; color: ${styles.mutedText}; }
            @media print {
                body { padding: 50px 55px; }
                .invoice-container { min-height: 247mm; height: 247mm; }
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <div class="invoice-content">
                <div class="header">
                    <div class="header-row">
                        <div class="title">Invoice</div>
                        ${logo ? `<img src="${logo}" alt="Logo" class="logo" />` : ''}
                    </div>
                    <table class="meta-table">
                        <tr><td>Invoice number</td><td>${invoiceNumber || 'INV-001'}</td></tr>
                        <tr><td>Issue date</td><td>${fmtDate(issueDate) || fmtDate(new Date().toISOString().split('T')[0])}</td></tr>
                        <tr><td>Due date</td><td>${fmtDate(dueDate) || '-'}</td></tr>
                        ${projectName ? `<tr><td>Project</td><td style="font-weight: 500;">${projectName}</td></tr>` : ''}
                    </table>
                </div>
                <div class="parties">
                    <div class="party">
                        <div class="party-name">${yourName || 'Your Name / Company'}</div>
                        <div class="party-detail">${(yourAddress || 'Your Address').replace(/\n/g, '<br>')}</div>
                        <div class="party-detail">${yourEmail || ''}</div>
                        <div class="party-detail">${yourTaxId || ''}</div>
                    </div>
                    <div class="party">
                        <div class="party-name">${clientName || 'Client Name / Company'}</div>
                        <div class="party-detail">${(clientAddress || 'Client Address').replace(/\n/g, '<br>')}</div>
                        <div class="party-detail">${clientEmail || ''}</div>
                        <div class="party-detail">${clientTaxId || ''}</div>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="width: 50px;">Qty</th>
                            <th style="width: 90px;">Unit price</th>
                            <th style="width: 50px;">VAT %</th>
                            <th style="width: 80px;">VAT amt</th>
                            <th style="width: 100px;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lineItems.filter(item => item.description).length > 0 ? lineItems.filter(item => item.description).map(item => {
                          const itemSubtotal = item.quantity * item.price
                          const itemVat = itemSubtotal * (item.vat / 100)
                          return `
                            <tr>
                                <td>
                                    <div>${item.description}</div>
                                    ${item.comment ? `<div style="font-size: 11px; color: #666; margin-top: 4px;">${item.comment}</div>` : ''}
                                </td>
                                <td style="vertical-align: top;">${item.quantity}</td>
                                <td style="vertical-align: top;">${formatCurr(item.price)}</td>
                                <td style="vertical-align: top;">${item.vat}%</td>
                                <td style="vertical-align: top; color: #666;">${formatCurr(itemVat)}</td>
                                <td style="vertical-align: top; font-weight: 500;">${formatCurr(itemSubtotal + itemVat)}</td>
                            </tr>
                        `}).join('') : `
                            <tr>
                                <td style="color: #999;">No items</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                            </tr>
                        `}
                    </tbody>
                </table>
                <div class="totals-section">
                    <table class="totals-table">
                        <tr><td>Total excl. VAT</td><td>${formatCurr(subtotal)}</td></tr>
                        <tr><td>Total VAT amount</td><td>${formatCurr(vatAmount)}</td></tr>
                        <tr class="highlight"><td>Total incl. VAT</td><td>${formatCurr(total)}</td></tr>
                    </table>
                </div>
                ${notes ? `
                <div style="background: ${styles.paymentBg}; padding: 15px 20px; border-radius: 4px; border: 1px solid ${styles.borderColor}; margin-bottom: 20px;">
                    <div style="font-size: 11px; color: ${styles.mutedText}; margin-bottom: 5px;">Note</div>
                    <div style="font-size: 13px; white-space: pre-line;">${notes}</div>
                </div>
                ` : ''}
                ${signature ? `
                <div style="margin-bottom: 20px;">
                    <div style="font-size: 11px; color: ${styles.mutedText}; margin-bottom: 8px;">Authorized Signature</div>
                    <img src="${signature}" alt="Signature" style="height: 60px; width: auto; object-fit: contain;" />
                    <div style="border-top: 1px solid ${styles.borderColor}; width: 180px; margin-top: 4px;"></div>
                </div>
                ` : ''}
            </div>
            <div class="payment">
                <div class="payment-title">Payment details</div>
                <div class="payment-grid">
                    <div class="payment-item">
                        <div class="label">Beneficiary name</div>
                        <div class="value">${beneficiary || '-'}</div>
                    </div>
                    <div class="payment-item">
                        <div class="label">BIC</div>
                        <div class="value">${bic || '-'}</div>
                    </div>
                    <div class="payment-item">
                        <div class="label">IBAN</div>
                        <div class="value">${iban || '-'}</div>
                    </div>
                    ${intermediaryBic ? `
                    <div class="payment-item">
                        <div class="label">Intermediary bank BIC</div>
                        <div class="value">${intermediaryBic}</div>
                    </div>
                    ` : ''}
                </div>
            </div>
            <div class="footer">
                <span>${yourName || 'Your Company'}</span>
                <span>${invoiceNumber} · 1/1</span>
            </div>
        </div>
        <script>window.onload = () => window.print();</script>
    </body>
    </html>
  `
}
