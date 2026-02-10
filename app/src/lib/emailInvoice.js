/**
 * Generate email content for sending invoice to client
 */
export const generateEmailContent = (invoiceData) => {
  const {
    invoiceNumber,
    clientName,
    yourName,
    dueDate,
    currency,
    lineItems = [],
  } = invoiceData

  // Calculate total
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const vatAmount = lineItems.reduce((sum, item) => sum + (item.quantity * item.price * item.vat / 100), 0)
  const total = subtotal + vatAmount

  const symbols = { EUR: '€', USD: '$', GBP: '£', CHF: 'CHF ' }
  const currencySymbol = symbols[currency] || currency + ' '
  const formattedTotal = `${currencySymbol}${total.toFixed(2)}`

  const formattedDueDate = dueDate
    ? new Date(dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'as per agreement'

  const subject = `Invoice ${invoiceNumber} from ${yourName || 'Your Company'}`

  const body = `Dear ${clientName || 'Client'},

Please find attached invoice ${invoiceNumber} for the total amount of ${formattedTotal}.

Payment is due by ${formattedDueDate}.

If you have any questions regarding this invoice, please don't hesitate to contact me.

Thank you for your business!

Best regards,
${yourName || 'Your Name'}

---
Note: Please attach the PDF invoice to this email before sending.`

  return { subject, body }
}

/**
 * Open email client with pre-filled email
 */
export const openEmailClient = (invoiceData) => {
  const { clientEmail } = invoiceData

  if (!clientEmail) {
    return false
  }

  const { subject, body } = generateEmailContent(invoiceData)

  // Create mailto URL
  const mailtoUrl = `mailto:${encodeURIComponent(clientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  // Open email client
  window.open(mailtoUrl, '_self')

  return true
}

/**
 * Copy email content to clipboard
 */
export const copyEmailContent = async (invoiceData) => {
  const { subject, body } = generateEmailContent(invoiceData)

  const fullContent = `Subject: ${subject}\n\n${body}`

  try {
    await navigator.clipboard.writeText(fullContent)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}
