/**
 * Generate the next INV-XXX number by scanning existing invoices.
 * E.g. INV-001, INV-002, INV-003
 */
export const generateNextInvNumber = (existingInvoices = []) => {
  const matching = existingInvoices
    .map(inv => inv.invoice_number || inv.invoiceNumber || '')
    .filter(num => /^INV-\d+$/.test(num))

  const sequences = matching.map(num => {
    const m = num.match(/INV-(\d+)$/)
    return m ? parseInt(m[1], 10) : 0
  })

  const maxSeq = sequences.length > 0 ? Math.max(...sequences) : 0
  return `INV-${String(maxSeq + 1).padStart(3, '0')}`
}

/**
 * Get the latest INV-XXX number for linking expense reports.
 * Returns the highest INV number, or INV-001 if none exist.
 */
export const getLatestInvNumber = (existingInvoices = []) => {
  const matching = existingInvoices
    .map(inv => inv.invoice_number || inv.invoiceNumber || '')
    .filter(num => /^INV-\d+$/.test(num))

  const sequences = matching.map(num => {
    const m = num.match(/INV-(\d+)$/)
    return m ? parseInt(m[1], 10) : 0
  })

  const maxSeq = sequences.length > 0 ? Math.max(...sequences) : 0
  return maxSeq > 0 ? `INV-${String(maxSeq).padStart(3, '0')}` : 'INV-001'
}

/**
 * Generate the next invoice number based on user settings and existing invoices
 */
export const generateInvoiceNumber = (existingInvoices = []) => {
  const format = localStorage.getItem('invoice_number_format') || 'INV-{YYYYMMDD}-{SEQ}'
  const customPrefix = localStorage.getItem('invoice_custom_prefix') || 'INV'
  const startingNumber = parseInt(localStorage.getItem('invoice_starting_number') || '1', 10)

  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  // Calculate next sequence number
  const existingNumbers = existingInvoices
    .map(inv => inv.invoice_number || inv.invoiceNumber || '')
    .filter(Boolean)

  // Extract numeric sequences from existing invoice numbers
  const sequences = existingNumbers.map(num => {
    const matches = num.match(/(\d+)$/)
    return matches ? parseInt(matches[1], 10) : 0
  })

  const maxSeq = sequences.length > 0 ? Math.max(...sequences) : startingNumber - 1
  const nextSeq = Math.max(maxSeq + 1, startingNumber)
  const seq = String(nextSeq).padStart(3, '0')

  switch (format) {
    case 'INV-{YYYYMMDD}-{SEQ}':
      return `INV-${year}${month}${day}-${seq}`
    case 'INV-{YYYY}-{SEQ}':
      return `INV-${year}-${seq}`
    case '{YYYY}{MM}{SEQ}':
      return `${year}${month}${seq}`
    case 'INV{SEQ}':
      return `INV${seq}`
    case '{PREFIX}-{SEQ}':
      return `${customPrefix}-${seq}`
    default:
      return `INV-${year}${month}${day}-${seq}`
  }
}

/**
 * Get default payment terms in days from settings
 */
export const getDefaultPaymentTerms = () => {
  return parseInt(localStorage.getItem('default_payment_terms') || '30', 10)
}

/**
 * Get default currency from settings
 */
export const getDefaultCurrency = () => {
  return localStorage.getItem('default_currency') || 'EUR'
}

/**
 * Get default VAT rate from settings
 */
export const getDefaultVatRate = () => {
  return parseFloat(localStorage.getItem('default_vat_rate') || '0')
}

/**
 * Calculate due date from issue date and payment terms
 */
export const calculateDueDate = (issueDate, paymentTermsDays) => {
  if (!issueDate) return ''
  const terms = paymentTermsDays || getDefaultPaymentTerms()
  const date = new Date(issueDate)
  date.setDate(date.getDate() + terms)
  return date.toISOString().split('T')[0]
}
