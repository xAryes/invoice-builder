import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useInvoices } from '../hooks/useInvoices'
import { useProfiles } from '../hooks/useProfiles'
import { exportToPDF } from '../lib/pdfExport'
import { openEmailClient } from '../lib/emailInvoice'
import { generateInvoiceNumber, generateTypedInvoiceNumber, getDefaultCurrency, getDefaultVatRate, calculateDueDate } from '../lib/invoiceNumber'
import { INVOICE_TEMPLATES, DEFAULT_TEMPLATE } from '../lib/invoiceTemplates'
import { InvoicePreview, generatePrintHTML } from '../components/InvoicePreview'
import { SignatureCanvas } from '../components/SignatureCanvas'
import { Layout } from '../components/Layout'
import { useToast } from '../components/ui'
import {
  Plus,
  Trash2,
  Download,
  Save,
  Printer,
  Mail,
  ChevronDown,
  ChevronRight,
  Upload,
  X,
  Check,
} from 'lucide-react'

const CURRENCIES = [
  { value: 'EUR', label: '€ EUR' },
  { value: 'USD', label: '$ USD' },
  { value: 'GBP', label: '£ GBP' },
  { value: 'CHF', label: 'Fr. CHF' },
  { value: 'CAD', label: '$ CAD' },
  { value: 'AUD', label: '$ AUD' },
  { value: 'JPY', label: '¥ JPY' },
  { value: 'SEK', label: 'kr SEK' },
]

const CURRENCY_SYMBOLS = { EUR: '€', USD: '$', GBP: '£', CHF: 'Fr.', CAD: 'C$', AUD: 'A$', JPY: '¥', CNY: '¥', INR: '₹', BRL: 'R$', MXN: 'MX$', SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč' }

const DOCUMENT_TYPES = [
  { id: 'salary', label: 'Salary', prefix: 'SAL', category: null },
  { id: 'office', label: 'Office & IT', prefix: 'OFF', category: 'Office' },
  { id: 'ga', label: 'General & Admin', prefix: 'GA', category: 'Other' },
  { id: 'travel', label: 'Travel & Events', prefix: 'TE', category: 'Travel' },
]

const defaultLineItem = { description: '', comment: '', quantity: 1, price: 0, vat: 0 }
const defaultExpenseItem = { description: '', amount: 0 }

// Reusable compact input
const F = ({ label, children, className = '' }) => (
  <div className={className}>
    {label && <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">{label}</label>}
    {children}
  </div>
)

const inputClass = "w-full px-2.5 py-[7px] text-[13px] bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 dark:focus:border-brand-500/40 outline-none text-gray-900 dark:text-white transition placeholder:text-gray-300 dark:placeholder:text-gray-600"

export const InvoiceForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const isNew = !id
  const pdfRef = useRef(null)

  const { invoices, createInvoice, updateInvoice, getInvoice } = useInvoices()
  const { profiles, clients, lineItems: savedItems, saveProfile, saveClient, saveLineItem } = useProfiles()

  const today = new Date().toISOString().split('T')[0]
  const defaultCurrency = getDefaultCurrency()
  const defaultVat = getDefaultVatRate()
  const defaultProfile = profiles.length > 0 ? profiles[0] : null

  const [data, setData] = useState({
    invoiceNumber: 'INV-001',
    issueDate: today,
    dueDate: calculateDueDate(today),
    currency: defaultCurrency,
    status: 'draft',
    logo: '',
    yourName: '',
    yourAddress: '',
    yourEmail: '',
    yourTaxId: '',
    clientName: '',
    clientAddress: '',
    clientEmail: '',
    clientTaxId: '',
    lineItems: [{ ...defaultLineItem, vat: defaultVat }],
    expenses: [],
    beneficiary: '',
    iban: '',
    bic: '',
    intermediaryBic: '',
    notes: '',
    signature: '',
    template: DEFAULT_TEMPLATE,
    accentColor: '#4d65ff',
  })

  const [docType, setDocType] = useState(null)
  const [showOptional, setShowOptional] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [saved, setSaved] = useState(false)

  // Auto-load default profile for new invoices
  useEffect(() => {
    if (isNew && defaultProfile && !data.yourName) {
      setData(prev => ({
        ...prev,
        yourName: defaultProfile.your_name || defaultProfile.yourName || '',
        yourAddress: defaultProfile.your_address || defaultProfile.yourAddress || '',
        yourEmail: defaultProfile.your_email || defaultProfile.yourEmail || '',
        yourTaxId: defaultProfile.your_tax_id || defaultProfile.yourTaxId || '',
        beneficiary: defaultProfile.beneficiary || '',
        iban: defaultProfile.iban || '',
        bic: defaultProfile.bic || '',
        intermediaryBic: defaultProfile.intermediary_bic || defaultProfile.intermediaryBic || '',
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultProfile, isNew])

  // Generate invoice number
  useEffect(() => {
    if (isNew) {
      const generated = generateInvoiceNumber(invoices)
      setData(prev => {
        if (prev.invoiceNumber === 'INV-001' || !prev.invoiceNumber) {
          return { ...prev, invoiceNumber: generated }
        }
        return prev
      })
    }
  }, [invoices, isNew])

  // Load existing invoice
  useEffect(() => {
    if (!isNew) {
      const invoice = getInvoice(id)
      if (invoice) {
        setData({
          invoiceNumber: invoice.invoice_number || invoice.invoiceNumber || 'INV-001',
          issueDate: invoice.issue_date || invoice.issueDate || '',
          dueDate: invoice.due_date || invoice.dueDate || '',
          currency: invoice.currency || 'EUR',
          status: invoice.status || 'draft',
          logo: invoice.logo || '',
          yourName: invoice.your_name || invoice.yourName || '',
          yourAddress: invoice.your_address || invoice.yourAddress || '',
          yourEmail: invoice.your_email || invoice.yourEmail || '',
          yourTaxId: invoice.your_tax_id || invoice.yourTaxId || '',
          clientName: invoice.client_name || invoice.clientName || '',
          clientAddress: invoice.client_address || invoice.clientAddress || '',
          clientEmail: invoice.client_email || invoice.clientEmail || '',
          clientTaxId: invoice.client_tax_id || invoice.clientTaxId || '',
          lineItems: invoice.line_items || invoice.lineItems || [{ ...defaultLineItem }],
          expenses: invoice.expenses || [],
          beneficiary: invoice.beneficiary || '',
          iban: invoice.iban || '',
          bic: invoice.bic || '',
          intermediaryBic: invoice.intermediary_bic || invoice.intermediaryBic || '',
          notes: invoice.notes || '',
          signature: invoice.signature || '',
          template: invoice.template || DEFAULT_TEMPLATE,
          accentColor: invoice.accent_color || invoice.accentColor || '#4d65ff',
        })
        // Detect doc type from number prefix
        const num = invoice.invoice_number || invoice.invoiceNumber || ''
        if (num.startsWith('SAL-')) setDocType('salary')
        else if (num.startsWith('OFF-')) setDocType('office')
        else if (num.startsWith('GA-')) setDocType('ga')
        else if (num.startsWith('TE-')) setDocType('travel')
        // Show optional sections if they have content
        if (invoice.notes || invoice.signature || invoice.logo || (invoice.expenses && invoice.expenses.length > 0)) {
          setShowOptional(true)
        }
      }
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew])

  const handleChange = (field, value) => {
    setData(prev => {
      const updated = { ...prev, [field]: value }
      if (field === 'issueDate' && value) {
        const currentDueIsAuto = !prev.dueDate || prev.dueDate === calculateDueDate(prev.issueDate)
        if (currentDueIsAuto) {
          updated.dueDate = calculateDueDate(value)
        }
      }
      return updated
    })
  }

  const handleDocTypeSelect = (type) => {
    const isSame = docType === type.id
    const newType = isSame ? null : type.id
    setDocType(newType)
    if (!isSame) {
      const typedNumber = generateTypedInvoiceNumber(type.prefix, invoices)
      setData(prev => ({ ...prev, invoiceNumber: typedNumber, notes: type.label }))
    } else {
      const defaultNumber = generateInvoiceNumber(invoices)
      setData(prev => ({ ...prev, invoiceNumber: defaultNumber }))
    }
  }

  const handleLoadClient = (client) => {
    const clientVat = client.default_vat != null ? Number(client.default_vat) : null
    setData(prev => ({
      ...prev,
      clientName: client.client_name || client.clientName || '',
      clientAddress: client.client_address || client.clientAddress || '',
      clientEmail: client.client_email || client.clientEmail || '',
      clientTaxId: client.client_tax_id || client.clientTaxId || '',
      // Apply client's default VAT to all line items if set
      lineItems: clientVat != null
        ? prev.lineItems.map(item => ({ ...item, vat: clientVat }))
        : prev.lineItems,
    }))
  }

  // Load a saved line item template
  const handleLoadSavedItem = (savedId) => {
    const item = savedItems.find(i => i.id === savedId)
    if (!item) return
    setData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, {
        description: item.description || '',
        comment: item.comment || '',
        quantity: item.quantity ?? 1,
        price: item.price ?? 0,
        vat: item.vat ?? defaultVat,
      }],
    }))
  }

  // Line items
  const addLineItem = () => setData(prev => ({ ...prev, lineItems: [...prev.lineItems, { ...defaultLineItem, vat: defaultVat }] }))
  const removeLineItem = (i) => setData(prev => ({ ...prev, lineItems: prev.lineItems.filter((_, idx) => idx !== i) }))
  const updateLineItem = (i, field, value) => setData(prev => ({ ...prev, lineItems: prev.lineItems.map((item, idx) => idx === i ? { ...item, [field]: value } : item) }))

  // Expense items
  const addExpenseItem = () => setData(prev => ({ ...prev, expenses: [...prev.expenses, { ...defaultExpenseItem }] }))
  const removeExpenseItem = (i) => setData(prev => ({ ...prev, expenses: prev.expenses.filter((_, idx) => idx !== i) }))
  const updateExpenseItem = (i, field, value) => setData(prev => ({ ...prev, expenses: prev.expenses.map((item, idx) => idx === i ? { ...item, [field]: value } : item) }))

  // Logo
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500 * 1024) { toast.error('Logo must be less than 500KB'); return }
    const reader = new FileReader()
    reader.onload = (event) => handleChange('logo', event.target?.result)
    reader.readAsDataURL(file)
  }

  // Calculations
  const subtotal = data.lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0)
  const vatAmount = data.lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0) * (Number(item.vat) || 0) / 100, 0)
  const expensesTotal = data.expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const total = subtotal + vatAmount + expensesTotal
  const sym = CURRENCY_SYMBOLS[data.currency] || data.currency

  // Save
  const handleSave = () => {
    setSaving(true)
    try {
      const saveData = {
        invoice_number: data.invoiceNumber, issue_date: data.issueDate, due_date: data.dueDate,
        currency: data.currency, status: data.status, logo: data.logo,
        your_name: data.yourName, your_address: data.yourAddress, your_email: data.yourEmail, your_tax_id: data.yourTaxId,
        client_name: data.clientName, client_address: data.clientAddress, client_email: data.clientEmail, client_tax_id: data.clientTaxId,
        line_items: data.lineItems, expenses: data.expenses,
        beneficiary: data.beneficiary, iban: data.iban, bic: data.bic, intermediary_bic: data.intermediaryBic,
        notes: data.notes, signature: data.signature, template: data.template, accent_color: data.accentColor,
      }
      if (isNew) {
        const created = createInvoice(saveData)
        toast.success('Invoice saved')
        navigate(`/invoice/${created.id}`, { replace: true })
      } else {
        updateInvoice(id, saveData)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (error) {
      toast.error('Failed to save')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  // Export PDF
  const handleExportPDF = async () => {
    setExporting(true)
    try {
      await new Promise(r => setTimeout(r, 200))
      if (pdfRef.current) {
        await exportToPDF(pdfRef.current, `${data.invoiceNumber || 'invoice'}.pdf`)
        toast.success('PDF exported')
      }
    } catch (error) {
      toast.error('Failed to export PDF')
      console.error(error)
    } finally {
      setExporting(false)
    }
  }

  const handlePrint = () => {
    const html = generatePrintHTML(data)
    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close() }
  }

  const handleEmail = () => {
    if (!data.clientEmail) { toast.error('No client email set'); return }
    openEmailClient(data)
  }

  if (loading) {
    return (
      <Layout wide>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-white rounded-full" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout wide>
      {/* Sticky action bar */}
      <div className="sticky top-12 z-30 bg-white dark:bg-[#111113] border-b border-gray-200/60 dark:border-white/5">
        <div className="flex items-center justify-between px-4 sm:px-6 py-2 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <h1 className="text-[15px] font-semibold text-gray-900 dark:text-white">
              {isNew ? 'New Invoice' : data.invoiceNumber}
            </h1>
            {!isNew && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-medium">
                {data.status}
              </span>
            )}
            <div className="hidden sm:flex items-center gap-1 ml-1">
              {DOCUMENT_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleDocTypeSelect(t)}
                  className={`px-2 py-0.5 text-[11px] rounded-md border transition ${
                    docType === t.id
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 font-medium'
                      : 'border-gray-200 dark:border-white/[0.08] text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-white/[0.03]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={handlePrint} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition" title="Print">
              <Printer className="w-4 h-4" />
            </button>
            <button onClick={handleEmail} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition" title="Email">
              <Mail className="w-4 h-4" />
            </button>
            <button onClick={handleExportPDF} disabled={exporting} className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition disabled:opacity-50">
              <Download className="w-3.5 h-3.5" />
              PDF
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition disabled:opacity-50">
              {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Main content: form + preview side by side */}
      <div className="flex max-w-7xl mx-auto">
        {/* Left: Form */}
        <div className="flex-1 min-w-0 px-4 pt-5 pb-4 sm:px-8 sm:pt-6 sm:pb-6">

          {/* Invoice meta row */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <F label="Invoice #">
              <input type="text" value={data.invoiceNumber} onChange={e => handleChange('invoiceNumber', e.target.value)} className={inputClass} />
            </F>
            <F label="Date">
              <input type="date" value={data.issueDate} onChange={e => handleChange('issueDate', e.target.value)} className={inputClass} />
            </F>
            <F label="Due">
              <input type="date" value={data.dueDate} onChange={e => handleChange('dueDate', e.target.value)} className={inputClass} />
            </F>
            <F label="Currency">
              <select value={data.currency} onChange={e => handleChange('currency', e.target.value)} className={inputClass}>
                {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </F>
          </div>

          {/* From / To row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* FROM - sender info */}
            <div className="bg-white dark:bg-white/[0.02] rounded-xl border border-gray-200/60 dark:border-white/[0.06] p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">From</span>
                {profiles.length > 1 && (
                  <select
                    onChange={e => {
                      const p = profiles.find(p => p.id === e.target.value)
                      if (p) {
                        setData(prev => ({
                          ...prev,
                          yourName: p.your_name || p.yourName || '',
                          yourAddress: p.your_address || p.yourAddress || '',
                          yourEmail: p.your_email || p.yourEmail || '',
                          yourTaxId: p.your_tax_id || p.yourTaxId || '',
                          beneficiary: p.beneficiary || prev.beneficiary,
                          iban: p.iban || prev.iban,
                          bic: p.bic || prev.bic,
                          intermediaryBic: p.intermediary_bic || p.intermediaryBic || prev.intermediaryBic,
                        }))
                      }
                    }}
                    className="text-[11px] text-gray-400 dark:text-gray-500 bg-transparent border-0 p-0 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300"
                    defaultValue=""
                  >
                    <option value="" disabled>Switch profile</option>
                    {profiles.map(p => <option key={p.id} value={p.id}>{p.your_name || p.yourName}</option>)}
                  </select>
                )}
              </div>
              <input type="text" value={data.yourName} onChange={e => handleChange('yourName', e.target.value)} placeholder="Your name / company" className={`${inputClass} mb-2 font-medium`} />
              <textarea value={data.yourAddress} onChange={e => handleChange('yourAddress', e.target.value)} placeholder="Address" rows={2} className={`${inputClass} resize-none mb-2`} />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={data.yourEmail} onChange={e => handleChange('yourEmail', e.target.value)} placeholder="Email" className={inputClass} />
                <input type="text" value={data.yourTaxId} onChange={e => handleChange('yourTaxId', e.target.value)} placeholder="Tax ID" className={inputClass} />
              </div>
              {!defaultProfile && data.yourName && (
                <button
                  onClick={() => {
                    saveProfile({ your_name: data.yourName, your_address: data.yourAddress, your_email: data.yourEmail, your_tax_id: data.yourTaxId, beneficiary: data.beneficiary, iban: data.iban, bic: data.bic, intermediary_bic: data.intermediaryBic })
                    toast.success('Profile saved — will auto-fill next time')
                  }}
                  className="mt-2 text-[11px] text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Save as default profile
                </button>
              )}
            </div>

            {/* TO - client info */}
            <div className="bg-white dark:bg-white/[0.02] rounded-xl border border-gray-200/60 dark:border-white/[0.06] p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Bill To</span>
                {clients.length > 0 && (
                  <select
                    onChange={e => {
                      const c = clients.find(c => c.id === e.target.value)
                      if (c) handleLoadClient(c)
                    }}
                    className="text-[11px] text-gray-400 dark:text-gray-500 bg-transparent border-0 p-0 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300"
                    defaultValue=""
                  >
                    <option value="" disabled>Pick client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.client_name || c.clientName}</option>)}
                  </select>
                )}
              </div>
              <input type="text" value={data.clientName} onChange={e => handleChange('clientName', e.target.value)} placeholder="Client name" className={`${inputClass} mb-2 font-medium`} />
              <textarea value={data.clientAddress} onChange={e => handleChange('clientAddress', e.target.value)} placeholder="Address" rows={2} className={`${inputClass} resize-none mb-2`} />
              <div className="grid grid-cols-2 gap-2">
                <input type="email" value={data.clientEmail} onChange={e => handleChange('clientEmail', e.target.value)} placeholder="Email" className={inputClass} />
                <input type="text" value={data.clientTaxId} onChange={e => handleChange('clientTaxId', e.target.value)} placeholder="Tax ID" className={inputClass} />
              </div>
              {data.clientName && !clients.find(c => (c.client_name || c.clientName) === data.clientName) && (
                <button
                  onClick={() => {
                    saveClient({ client_name: data.clientName, client_address: data.clientAddress, client_email: data.clientEmail, client_tax_id: data.clientTaxId })
                    toast.success('Client saved')
                  }}
                  className="mt-2 text-[11px] text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Save client for next time
                </button>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</span>
            </div>
            <div className="bg-white dark:bg-white/[0.02] rounded-xl border border-gray-200/60 dark:border-white/[0.06] overflow-hidden">
              {/* Header */}
              <div className="hidden sm:grid grid-cols-12 gap-2 px-3.5 py-2 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/[0.04]">
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">VAT %</div>
                <div className="col-span-1"></div>
              </div>
              {data.lineItems.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 px-3.5 py-2 items-start border-b border-gray-50 dark:border-white/[0.02] last:border-0 group">
                  <div className="col-span-12 sm:col-span-5">
                    <input type="text" value={item.description} onChange={e => updateLineItem(i, 'description', e.target.value)} placeholder="What did you do?" className={inputClass} />
                    <input type="text" value={item.comment || ''} onChange={e => updateLineItem(i, 'comment', e.target.value)} placeholder="Details / context..." className={`${inputClass} mt-1 !text-[11px] !py-[4px] text-gray-400 dark:text-gray-500`} />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <input type="number" value={item.quantity} onChange={e => updateLineItem(i, 'quantity', e.target.value)} min="0" step="0.5" className={`${inputClass} text-right`} />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <input type="number" value={item.price} onChange={e => updateLineItem(i, 'price', e.target.value)} min="0" step="0.01" className={`${inputClass} text-right`} />
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <input type="number" value={item.vat} onChange={e => updateLineItem(i, 'vat', e.target.value)} min="0" max="100" step="0.5" className={`${inputClass} text-right`} />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {data.lineItems.length > 1 && (
                      <button onClick={() => removeLineItem(i)} className="p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex items-center">
                <button onClick={addLineItem} className="flex-1 flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] text-brand-600 dark:text-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-500/5 transition">
                  <Plus className="w-3.5 h-3.5" />
                  Add item
                </button>
                {savedItems.length > 0 && (
                  <select
                    onChange={e => { handleLoadSavedItem(e.target.value); e.target.value = '' }}
                    defaultValue=""
                    className="px-2 py-2 text-[12px] text-brand-600 dark:text-brand-400 bg-transparent border-l border-gray-100 dark:border-white/[0.04] cursor-pointer hover:bg-brand-50/50 dark:hover:bg-brand-500/5 transition outline-none"
                  >
                    <option value="" disabled>Load saved...</option>
                    {savedItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.description}{item.price ? ` — ${sym}${Number(item.price).toFixed(2)}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-4">
            <span className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Payment</span>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={data.beneficiary} onChange={e => handleChange('beneficiary', e.target.value)} placeholder="Beneficiary" className={inputClass} />
              <input type="text" value={data.iban} onChange={e => handleChange('iban', e.target.value)} placeholder="IBAN" className={inputClass} />
              <input type="text" value={data.bic} onChange={e => handleChange('bic', e.target.value)} placeholder="BIC / SWIFT" className={inputClass} />
              <input type="text" value={data.intermediaryBic} onChange={e => handleChange('intermediaryBic', e.target.value)} placeholder="Intermediary BIC" className={inputClass} />
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-4">
            <div className="w-56 space-y-1 text-[13px]">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-mono">{sym}{subtotal.toFixed(2)}</span>
              </div>
              {vatAmount > 0 && (
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>VAT</span>
                  <span className="font-mono">{sym}{vatAmount.toFixed(2)}</span>
                </div>
              )}
              {expensesTotal > 0 && (
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Expenses</span>
                  <span className="font-mono">{sym}{expensesTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1.5 border-t border-gray-200 dark:border-white/10 font-semibold text-gray-900 dark:text-white">
                <span>Total</span>
                <span className="font-mono text-brand-600 dark:text-brand-400">{sym}{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Optional sections toggle */}
          <button
            onClick={() => setShowOptional(!showOptional)}
            className="flex items-center gap-1.5 text-[13px] text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 mb-3 transition"
          >
            {showOptional ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            Expenses, notes, signature & style
          </button>

          {showOptional && (
            <div className="space-y-4 pb-8">
              {/* Reimbursable expenses */}
              <div>
                <span className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Reimbursable Expenses</span>
                <div className="bg-white dark:bg-white/[0.02] rounded-xl border border-gray-200/60 dark:border-white/[0.06] overflow-hidden">
                  {data.expenses.length > 0 && data.expenses.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 px-3.5 py-2 items-center border-b border-gray-50 dark:border-white/[0.02] last:border-0 group">
                      <div className="col-span-8">
                        <input type="text" value={item.description} onChange={e => updateExpenseItem(i, 'description', e.target.value)} placeholder="e.g. Train ticket" className={inputClass} />
                      </div>
                      <div className="col-span-3">
                        <input type="number" value={item.amount} onChange={e => updateExpenseItem(i, 'amount', e.target.value)} min="0" step="0.01" placeholder="0.00" className={`${inputClass} text-right`} />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button onClick={() => removeExpenseItem(i)} className="p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={addExpenseItem} className="w-full flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] text-brand-600 dark:text-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-500/5 transition">
                    <Plus className="w-3.5 h-3.5" />
                    Add expense
                  </button>
                </div>
              </div>

              {/* Notes */}
              <F label="Notes">
                <textarea value={data.notes} onChange={e => handleChange('notes', e.target.value)} rows={2} placeholder="Payment terms, thank you note..." className={`${inputClass} resize-none`} />
              </F>

              {/* Logo & Signature */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">Logo</span>
                  {data.logo ? (
                    <div className="flex items-center gap-3 p-2 bg-white dark:bg-white/[0.02] rounded-lg border border-gray-200/60 dark:border-white/[0.06]">
                      <img src={data.logo} alt="Logo" className="h-8 w-auto object-contain" />
                      <button onClick={() => handleChange('logo', '')} className="text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 px-3 py-2.5 text-[12px] text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition">
                      <Upload className="w-3.5 h-3.5" />
                      Upload (max 500KB)
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  )}
                </div>
                <SignatureCanvas value={data.signature} onChange={val => handleChange('signature', val)} />
              </div>

              {/* Style */}
              <div>
                <span className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Style</span>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {Object.values(INVOICE_TEMPLATES).map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleChange('template', t.id)}
                      className={`px-2.5 py-1 text-[12px] rounded-md border transition ${
                        data.template === t.id
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400'
                          : 'border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.03]'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input type="color" value={data.accentColor} onChange={e => handleChange('accentColor', e.target.value)} className="w-7 h-7 rounded cursor-pointer border border-gray-200 dark:border-white/10" />
                  <span className="text-[12px] text-gray-400 dark:text-gray-500">Accent color</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Preview (visual only) */}
        <div className="hidden lg:block w-[595px] flex-shrink-0 border-l border-gray-200/60 dark:border-white/5 bg-gray-50 dark:bg-[#0a0a0c]">
          <div className="sticky top-[92px] p-4">
            <div className="bg-white dark:bg-[#111113] rounded-lg shadow-sm border border-gray-200/40 dark:border-white/5 overflow-hidden" style={{ transform: 'scale(0.54)', transformOrigin: 'top left', width: '185%' }}>
              <InvoicePreview data={data} />
            </div>
          </div>
        </div>

        {/* PDF export source (always rendered offscreen, never display:none) */}
        <div className="fixed -left-[9999px] top-0" style={{ width: '210mm' }}>
          <div ref={pdfRef}>
            <InvoicePreview data={data} />
          </div>
        </div>
      </div>
    </Layout>
  )
}
