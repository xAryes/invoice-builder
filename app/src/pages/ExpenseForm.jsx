import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useExpenses } from '../hooks/useExpenses'
import { useProfiles } from '../hooks/useProfiles'
import { exportToPDF } from '../lib/pdfExport'
import { getDefaultCurrency } from '../lib/invoiceNumber'
import { INVOICE_TEMPLATES, DEFAULT_TEMPLATE } from '../lib/invoiceTemplates'
import { ExpensePreview, generateExpensePrintHTML } from '../components/ExpensePreview'
import { Layout } from '../components/Layout'
import { useToast } from '../components/ui'
import {
  Plus,
  Trash2,
  Download,
  Save,
  Printer,
  ChevronDown,
  ChevronRight,
  Check,
} from 'lucide-react'

const DOCUMENT_TYPES = [
  { id: 'salary', label: 'Salary: Staff Costs', suffix: '', category: null },
  { id: 'office', label: 'Office: IT & Equipment', suffix: '-OFF', category: 'Office' },
  { id: 'ga', label: 'General & Administrative', suffix: '-GA', category: 'Other' },
  { id: 'travel', label: 'Travel & Events', suffix: '-TE', category: 'Travel' },
]

const CATEGORIES = ['Travel', 'Software', 'Hardware', 'Office', 'Meals', 'Communication', 'Professional Services', 'Other']

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

const defaultExpenseItem = { date: '', description: '', category: 'Other', amount: 0 }

const generateReportNumber = (existingExpenses = []) => {
  const now = new Date()
  const year = now.getFullYear()
  const existingNumbers = existingExpenses.map(exp => exp.report_number || exp.reportNumber || '').filter(Boolean)
  const sequences = existingNumbers.map(num => { const m = num.match(/(\d+)$/); return m ? parseInt(m[1], 10) : 0 })
  const maxSeq = sequences.length > 0 ? Math.max(...sequences) : 0
  return `EXP-${year}-${String(maxSeq + 1).padStart(3, '0')}`
}

const F = ({ label, children, className = '' }) => (
  <div className={className}>
    {label && <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">{label}</label>}
    {children}
  </div>
)

const inputClass = "w-full px-2.5 py-[7px] text-[13px] bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 dark:focus:border-brand-500/40 outline-none text-gray-900 dark:text-white transition placeholder:text-gray-300 dark:placeholder:text-gray-600"

export const ExpenseForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const isNew = !id
  const pdfRef = useRef(null)

  const { expenses: allExpenses, createExpense, updateExpense, getExpense } = useExpenses()
  const { profiles, clients, saveClient, savedExpenses } = useProfiles()

  const today = new Date().toISOString().split('T')[0]
  const defaultCurrency = getDefaultCurrency()
  const defaultProfile = profiles.length > 0 ? profiles[0] : null

  const [data, setData] = useState({
    reportNumber: 'EXP-001',
    date: today,
    periodStart: '',
    periodEnd: '',
    currency: defaultCurrency,
    yourName: '',
    yourAddress: '',
    yourEmail: '',
    yourTaxId: '',
    beneficiary: '',
    iban: '',
    bic: '',
    clientName: '',
    clientAddress: '',
    clientEmail: '',
    clientTaxId: '',
    expenses: [{ ...defaultExpenseItem, date: today }],
    notes: '',
    template: DEFAULT_TEMPLATE,
    accentColor: '#4d65ff',
  })

  const [docType, setDocType] = useState(null)
  const [showOptional, setShowOptional] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [saved, setSaved] = useState(false)

  // Auto-load default profile
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
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultProfile, isNew])

  // Generate report number
  useEffect(() => {
    if (isNew) {
      const generated = generateReportNumber(allExpenses)
      setData(prev => {
        if (prev.reportNumber === 'EXP-001' || !prev.reportNumber) {
          return { ...prev, reportNumber: generated }
        }
        return prev
      })
    }
  }, [allExpenses, isNew])

  // Load existing
  useEffect(() => {
    if (!isNew) {
      const expense = getExpense(id)
      if (expense) {
        setData({
          reportNumber: expense.report_number || expense.reportNumber || 'EXP-001',
          date: expense.date || '',
          periodStart: expense.period_start || expense.periodStart || '',
          periodEnd: expense.period_end || expense.periodEnd || '',
          currency: expense.currency || 'EUR',
          yourName: expense.your_name || expense.yourName || '',
          yourAddress: expense.your_address || expense.yourAddress || '',
          yourEmail: expense.your_email || expense.yourEmail || '',
          yourTaxId: expense.your_tax_id || expense.yourTaxId || '',
          beneficiary: expense.beneficiary || '',
          iban: expense.iban || '',
          bic: expense.bic || '',
          clientName: expense.client_name || expense.clientName || '',
          clientAddress: expense.client_address || expense.clientAddress || '',
          clientEmail: expense.client_email || expense.clientEmail || '',
          clientTaxId: expense.client_tax_id || expense.clientTaxId || '',
          expenses: expense.expenses || [{ ...defaultExpenseItem }],
          notes: expense.notes || '',
          template: expense.template || DEFAULT_TEMPLATE,
          accentColor: expense.accent_color || expense.accentColor || '#4d65ff',
        })
        // Detect doc type from number suffix
        const num = expense.report_number || expense.reportNumber || ''
        if (num.endsWith('-OFF')) setDocType('office')
        else if (num.endsWith('-GA')) setDocType('ga')
        else if (num.endsWith('-TE')) setDocType('travel')
        if (expense.notes) setShowOptional(true)
      }
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew])

  const handleChange = (field, value) => setData(prev => ({ ...prev, [field]: value }))

  const handleDocTypeSelect = (type) => {
    const isSame = docType === type.id
    const newType = isSame ? null : type.id
    setDocType(newType)
    if (!isSame) {
      setData(prev => {
        const baseNum = prev.reportNumber.replace(/-(OFF|GA|TE)$/, '')
        const updates = { ...prev, reportNumber: baseNum + type.suffix, notes: type.label }
        // Set default category on first expense item
        if (type.category && prev.expenses.length > 0) {
          updates.expenses = prev.expenses.map((exp, i) =>
            i === 0 ? { ...exp, category: type.category } : exp
          )
        }
        return updates
      })
    } else {
      setData(prev => {
        const baseNum = prev.reportNumber.replace(/-(OFF|GA|TE)$/, '')
        return { ...prev, reportNumber: baseNum }
      })
    }
  }

  const handleLoadClient = (client) => {
    setData(prev => ({
      ...prev,
      clientName: client.client_name || client.clientName || '',
      clientAddress: client.client_address || client.clientAddress || '',
      clientEmail: client.client_email || client.clientEmail || '',
      clientTaxId: client.client_tax_id || client.clientTaxId || '',
    }))
  }

  const addExpenseItem = () => setData(prev => ({ ...prev, expenses: [...prev.expenses, { ...defaultExpenseItem, date: today }] }))
  const loadSavedExpense = (saved) => setData(prev => ({ ...prev, expenses: [...prev.expenses, { date: today, description: saved.description, category: saved.category, amount: saved.amount || 0 }] }))
  const removeExpenseItem = (i) => setData(prev => ({ ...prev, expenses: prev.expenses.filter((_, idx) => idx !== i) }))
  const updateExpenseItem = (i, field, value) => setData(prev => ({ ...prev, expenses: prev.expenses.map((item, idx) => idx === i ? { ...item, [field]: value } : item) }))

  const total = data.expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0)
  const sym = CURRENCY_SYMBOLS[data.currency] || data.currency

  const handleSave = () => {
    setSaving(true)
    try {
      const saveData = {
        report_number: data.reportNumber, date: data.date, period_start: data.periodStart, period_end: data.periodEnd,
        currency: data.currency,
        your_name: data.yourName, your_address: data.yourAddress, your_email: data.yourEmail, your_tax_id: data.yourTaxId,
        beneficiary: data.beneficiary, iban: data.iban, bic: data.bic,
        client_name: data.clientName, client_address: data.clientAddress, client_email: data.clientEmail, client_tax_id: data.clientTaxId,
        expenses: data.expenses, notes: data.notes, template: data.template, accent_color: data.accentColor,
      }
      if (isNew) {
        const created = createExpense(saveData)
        toast.success('Expense report saved')
        navigate(`/expense/${created.id}`, { replace: true })
      } else {
        updateExpense(id, saveData)
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

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      await new Promise(r => setTimeout(r, 200))
      if (pdfRef.current) {
        await exportToPDF(pdfRef.current, `${data.reportNumber || 'expense-report'}.pdf`)
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
    const html = generateExpensePrintHTML(data)
    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close() }
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
              {isNew ? 'New Expense Report' : data.reportNumber}
            </h1>
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
            <button onClick={handlePrint} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition">
              <Printer className="w-4 h-4" />
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

      <div className="flex max-w-7xl mx-auto">
        {/* Left: Form */}
        <div className="flex-1 min-w-0 px-4 pt-5 pb-4 sm:px-8 sm:pt-6 sm:pb-6">

          {/* Report meta */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <F label="Report #">
              <input type="text" value={data.reportNumber} onChange={e => handleChange('reportNumber', e.target.value)} className={inputClass} />
            </F>
            <F label="Date">
              <input type="date" value={data.date} onChange={e => handleChange('date', e.target.value)} className={inputClass} />
            </F>
            <F label="Currency">
              <select value={data.currency} onChange={e => handleChange('currency', e.target.value)} className={inputClass}>
                {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </F>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <F label="Period Start">
              <input type="date" value={data.periodStart} onChange={e => handleChange('periodStart', e.target.value)} className={inputClass} />
            </F>
            <F label="Period End">
              <input type="date" value={data.periodEnd} onChange={e => handleChange('periodEnd', e.target.value)} className={inputClass} />
            </F>
          </div>

          {/* From / To */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white dark:bg-white/[0.02] rounded-xl border border-gray-200/60 dark:border-white/[0.06] p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">From</span>
                {profiles.length > 1 && (
                  <select
                    onChange={e => {
                      const p = profiles.find(p => p.id === e.target.value)
                      if (p) setData(prev => ({ ...prev, yourName: p.your_name || p.yourName || '', yourAddress: p.your_address || p.yourAddress || '', yourEmail: p.your_email || p.yourEmail || '', yourTaxId: p.your_tax_id || p.yourTaxId || '', beneficiary: p.beneficiary || prev.beneficiary, iban: p.iban || prev.iban, bic: p.bic || prev.bic }))
                    }}
                    className="text-[11px] text-gray-400 dark:text-gray-500 bg-transparent border-0 p-0 cursor-pointer" defaultValue=""
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
            </div>

            <div className="bg-white dark:bg-white/[0.02] rounded-xl border border-gray-200/60 dark:border-white/[0.06] p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Bill To</span>
                {clients.length > 0 && (
                  <select onChange={e => { const c = clients.find(c => c.id === e.target.value); if (c) handleLoadClient(c) }} className="text-[11px] text-gray-400 dark:text-gray-500 bg-transparent border-0 p-0 cursor-pointer" defaultValue="">
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
                <button onClick={() => { saveClient({ client_name: data.clientName, client_address: data.clientAddress, client_email: data.clientEmail, client_tax_id: data.clientTaxId }); toast.success('Client saved') }} className="mt-2 text-[11px] text-brand-600 dark:text-brand-400 hover:underline">
                  Save client for next time
                </button>
              )}
            </div>
          </div>

          {/* Expense Items */}
          <div className="mb-4">
            <span className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Expenses</span>
            <div className="bg-white dark:bg-white/[0.02] rounded-xl border border-gray-200/60 dark:border-white/[0.06] overflow-hidden">
              <div className="hidden sm:grid grid-cols-12 gap-2 px-3.5 py-2 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/[0.04]">
                <div className="col-span-2">Date</div>
                <div className="col-span-4">Description</div>
                <div className="col-span-3">Category</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-1"></div>
              </div>
              {data.expenses.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 px-3.5 py-2 items-center border-b border-gray-50 dark:border-white/[0.02] last:border-0 group">
                  <div className="col-span-6 sm:col-span-2">
                    <input type="date" value={item.date} onChange={e => updateExpenseItem(i, 'date', e.target.value)} className={inputClass} />
                  </div>
                  <div className="col-span-6 sm:col-span-4">
                    <input type="text" value={item.description} onChange={e => updateExpenseItem(i, 'description', e.target.value)} placeholder="Description" className={inputClass} />
                  </div>
                  <div className="col-span-5 sm:col-span-3">
                    <select value={item.category} onChange={e => updateExpenseItem(i, 'category', e.target.value)} className={inputClass}>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <input type="number" value={item.amount} onChange={e => updateExpenseItem(i, 'amount', e.target.value)} min="0" step="0.01" className={`${inputClass} text-right`} />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {data.expenses.length > 1 && (
                      <button onClick={() => removeExpenseItem(i)} className="p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex items-center">
                <button onClick={addExpenseItem} className="flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] text-brand-600 dark:text-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-500/5 transition">
                  <Plus className="w-3.5 h-3.5" />
                  Add expense
                </button>
                {savedExpenses.length > 0 && (
                  <div className="relative ml-auto pr-2">
                    <select
                      onChange={e => { const s = savedExpenses.find(s => s.id === e.target.value); if (s) loadSavedExpense(s); e.target.value = '' }}
                      className="text-[12px] text-gray-400 dark:text-gray-500 bg-transparent border border-gray-200 dark:border-white/[0.08] rounded-md px-2 py-1.5 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition"
                      defaultValue=""
                    >
                      <option value="" disabled>Load saved...</option>
                      {savedExpenses.map(s => <option key={s.id} value={s.id}>{s.description} ({s.category})</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="mb-4">
            <span className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Payment</span>
            <div className="grid grid-cols-3 gap-3">
              <F><input type="text" value={data.beneficiary} onChange={e => handleChange('beneficiary', e.target.value)} placeholder="Beneficiary" className={inputClass} /></F>
              <F><input type="text" value={data.iban} onChange={e => handleChange('iban', e.target.value)} placeholder="IBAN" className={inputClass} /></F>
              <F><input type="text" value={data.bic} onChange={e => handleChange('bic', e.target.value)} placeholder="BIC / SWIFT" className={inputClass} /></F>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end mb-4">
            <div className="w-56 flex justify-between text-[15px] font-semibold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-white/10">
              <span>Total</span>
              <span className="font-mono text-brand-600 dark:text-brand-400">{sym}{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Optional */}
          <button onClick={() => setShowOptional(!showOptional)} className="flex items-center gap-1.5 text-[13px] text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 mb-3 transition">
            {showOptional ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            Notes & style
          </button>

          {showOptional && (
            <div className="space-y-4 pb-8">
              <F label="Notes">
                <textarea value={data.notes} onChange={e => handleChange('notes', e.target.value)} rows={2} placeholder="Additional notes..." className={`${inputClass} resize-none`} />
              </F>
              <div>
                <span className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Style</span>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {Object.values(INVOICE_TEMPLATES).map(t => (
                    <button key={t.id} onClick={() => handleChange('template', t.id)} className={`px-2.5 py-1 text-[12px] rounded-md border transition ${data.template === t.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400' : 'border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.03]'}`}>
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
              <ExpensePreview data={data} />
            </div>
          </div>
        </div>

        {/* PDF export source (always rendered offscreen, never display:none) */}
        <div className="fixed -left-[9999px] top-0" style={{ width: '210mm' }}>
          <div ref={pdfRef}>
            <ExpensePreview data={data} />
          </div>
        </div>
      </div>
    </Layout>
  )
}
