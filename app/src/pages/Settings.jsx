import { useState } from 'react'
import { useProfiles } from '../hooks/useProfiles'
import { Layout } from '../components/Layout'
import { useToast } from '../components/ui'
import {
  Trash2,
  User,
  Building,
  Palette,
  Hash,
  Plus,
  Pencil,
  X,
  Repeat,
  Package,
  Download,
  Upload,
  HardDrive,
} from 'lucide-react'

const inputClass = "w-full px-2.5 py-[7px] text-[13px] bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 dark:focus:border-brand-500/40 outline-none text-gray-900 dark:text-white transition placeholder:text-gray-300 dark:placeholder:text-gray-600"

const INVOICE_NUMBER_FORMATS = [
  { value: 'INV-{YYYYMMDD}-{SEQ}', label: 'INV-20260201-001', description: 'INV + date + sequence' },
  { value: 'INV-{YYYY}-{SEQ}', label: 'INV-2026-001', description: 'INV + year + sequence' },
  { value: '{YYYY}{MM}{SEQ}', label: '202602001', description: 'Year + month + sequence' },
  { value: 'INV{SEQ}', label: 'INV001', description: 'INV + sequence' },
  { value: '{PREFIX}-{SEQ}', label: 'Custom prefix + sequence', description: 'Custom prefix' },
]

const FONT_OPTIONS = [
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { value: 'Georgia, "Times New Roman", serif', label: 'Georgia (Serif)' },
  { value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', label: 'System Default' },
  { value: '"Helvetica Neue", Helvetica, Arial, sans-serif', label: 'Helvetica Neue' },
  { value: '"Inter", -apple-system, sans-serif', label: 'Inter' },
  { value: '"Courier New", Courier, monospace', label: 'Courier (Monospace)' },
]

const Section = ({ title, description, children }) => (
  <div className="bg-white dark:bg-white/[0.02] rounded-xl border border-gray-200/60 dark:border-white/[0.06] mb-4">
    <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.04]">
      <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white">{title}</h3>
      {description && <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>}
    </div>
    <div className="p-5">{children}</div>
  </div>
)

const F = ({ label, children }) => (
  <div>
    {label && <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">{label}</label>}
    {children}
  </div>
)

export const Settings = () => {
  const toast = useToast()
  const { profiles, clients, lineItems: savedItems, saveProfile, updateProfile, saveClient, updateClient, deleteClient, saveLineItem, deleteLineItem, savedExpenses, saveSavedExpense, deleteSavedExpense, refreshData } = useProfiles()

  const [activeTab, setActiveTab] = useState('profile')

  const myProfile = profiles.length > 0 ? profiles[0] : null
  const [profileData, setProfileData] = useState(() => ({
    yourName: myProfile?.your_name || myProfile?.yourName || '',
    yourAddress: myProfile?.your_address || myProfile?.yourAddress || '',
    yourEmail: myProfile?.your_email || myProfile?.yourEmail || '',
    yourTaxId: myProfile?.your_tax_id || myProfile?.yourTaxId || '',
    beneficiary: myProfile?.beneficiary || '',
    iban: myProfile?.iban || '',
    bic: myProfile?.bic || '',
    intermediaryBic: myProfile?.intermediary_bic || myProfile?.intermediaryBic || '',
    ethAddress: myProfile?.eth_address || myProfile?.ethAddress || '',
  }))

  const [defaultCurrency, setDefaultCurrency] = useState(() => localStorage.getItem('default_currency') || 'EUR')
  const [defaultVatRate, setDefaultVatRate] = useState(() => localStorage.getItem('default_vat_rate') || '0')
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState(() => localStorage.getItem('default_payment_terms') || '30')
  const [invoiceFormat, setInvoiceFormat] = useState(() => localStorage.getItem('invoice_number_format') || 'INV-{YYYYMMDD}-{SEQ}')
  const [customPrefix, setCustomPrefix] = useState(() => localStorage.getItem('invoice_custom_prefix') || 'INV')
  const [startingNumber, setStartingNumber] = useState(() => localStorage.getItem('invoice_starting_number') || '1')

  // Client form state
  const [editingClient, setEditingClient] = useState(null) // null = closed, 'new' = adding, clientId = editing
  const [clientForm, setClientForm] = useState({ name: '', address: '', email: '', taxId: '', defaultVat: '' })

  const resetClientForm = () => { setClientForm({ name: '', address: '', email: '', taxId: '', defaultVat: '' }); setEditingClient(null) }
  const startAddClient = () => { resetClientForm(); setEditingClient('new') }
  const startEditClient = (client) => {
    setClientForm({
      name: client.client_name || client.clientName || '',
      address: client.client_address || client.clientAddress || '',
      email: client.client_email || client.clientEmail || '',
      taxId: client.client_tax_id || client.clientTaxId || '',
      defaultVat: client.default_vat != null ? String(client.default_vat) : '',
    })
    setEditingClient(client.id)
  }
  const handleSaveClient = () => {
    if (!clientForm.name.trim()) { toast.error('Client name is required'); return }
    const data = { client_name: clientForm.name, client_address: clientForm.address, client_email: clientForm.email, client_tax_id: clientForm.taxId, default_vat: clientForm.defaultVat !== '' ? Number(clientForm.defaultVat) : null }
    if (editingClient === 'new') {
      saveClient(data)
      toast.success('Client added')
    } else {
      updateClient(editingClient, data)
      toast.success('Client updated')
    }
    resetClientForm()
  }

  // Saved line item form state
  const [itemForm, setItemForm] = useState({ description: '', comment: '', quantity: '1', price: '', vat: '' })
  const [showItemForm, setShowItemForm] = useState(false)

  const handleSaveItem = () => {
    if (!itemForm.description.trim()) { toast.error('Description is required'); return }
    saveLineItem({ description: itemForm.description, comment: itemForm.comment, quantity: Number(itemForm.quantity) || 1, price: Number(itemForm.price) || 0, vat: itemForm.vat !== '' ? Number(itemForm.vat) : null })
    toast.success('Item saved')
    setItemForm({ description: '', comment: '', quantity: '1', price: '', vat: '' })
    setShowItemForm(false)
  }

  // Saved expense form state
  const [expenseForm, setExpenseForm] = useState({ description: '', category: 'Other', amount: '' })
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  const EXPENSE_CATEGORIES = ['Travel', 'Software', 'Hardware', 'Office', 'Meals', 'Communication', 'Professional Services', 'Other']

  const handleSaveSavedExpense = () => {
    if (!expenseForm.description.trim()) { toast.error('Description is required'); return }
    saveSavedExpense({ description: expenseForm.description, category: expenseForm.category, amount: Number(expenseForm.amount) || 0 })
    toast.success('Recurring expense saved')
    setExpenseForm({ description: '', category: 'Other', amount: '' })
    setShowExpenseForm(false)
  }

  const [customBranding, setCustomBranding] = useState(() => {
    try {
      const saved = localStorage.getItem('custom_branding')
      return saved ? JSON.parse(saved) : {
        enabled: false, accentColor: '#1a1a1a', tableHeaderBg: '#1a1a1a',
        tableHeaderText: '#ffffff', paymentBorder: '#1a1a1a',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }
    } catch {
      return { enabled: false, accentColor: '#1a1a1a', tableHeaderBg: '#1a1a1a', tableHeaderText: '#ffffff', paymentBorder: '#1a1a1a', fontFamily: 'Arial, Helvetica, sans-serif' }
    }
  })

  const handleSaveProfile = () => {
    const data = {
      your_name: profileData.yourName, your_address: profileData.yourAddress,
      your_email: profileData.yourEmail, your_tax_id: profileData.yourTaxId,
      beneficiary: profileData.beneficiary, iban: profileData.iban,
      bic: profileData.bic, intermediary_bic: profileData.intermediaryBic,
      eth_address: profileData.ethAddress,
    }
    if (myProfile) { updateProfile(myProfile.id, data) } else { saveProfile(data) }
    toast.success('Profile saved')
  }

  const handleSaveInvoiceSettings = () => {
    localStorage.setItem('invoice_number_format', invoiceFormat)
    localStorage.setItem('invoice_custom_prefix', customPrefix)
    localStorage.setItem('invoice_starting_number', startingNumber)
    localStorage.setItem('default_currency', defaultCurrency)
    localStorage.setItem('default_vat_rate', defaultVatRate)
    localStorage.setItem('default_payment_terms', defaultPaymentTerms)
    toast.success('Invoice settings saved')
  }

  const handleSaveBranding = () => {
    localStorage.setItem('custom_branding', JSON.stringify(customBranding))
    toast.success('Branding saved')
  }

  const updateBranding = (key, value) => setCustomBranding(prev => ({ ...prev, [key]: value }))

  // Data export/import
  const ALL_KEYS = [
    'invoice_builder_profiles', 'invoice_builder_clients', 'invoice_builder_line_items',
    'invoice_builder_saved_expenses', 'invoice_builder_invoices', 'invoice_builder_expenses',
    'default_currency', 'default_vat_rate', 'default_payment_terms',
    'invoice_number_format', 'invoice_custom_prefix', 'invoice_starting_number',
    'custom_branding', 'theme',
  ]

  const handleExport = () => {
    const data = {}
    ALL_KEYS.forEach(key => {
      const val = localStorage.getItem(key)
      if (val !== null) data[key] = val
    })
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-builder-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Backup exported')
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result)
          let count = 0
          Object.entries(data).forEach(([key, val]) => {
            if (ALL_KEYS.includes(key)) {
              localStorage.setItem(key, val)
              count++
            }
          })
          refreshData()
          toast.success(`Restored ${count} settings — reloading...`)
          setTimeout(() => window.location.reload(), 800)
        } catch {
          toast.error('Invalid backup file')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'invoicing', label: 'Invoicing', icon: Hash },
    { id: 'items', label: 'Items', icon: Package },
    { id: 'clients', label: 'Clients', icon: Building },
    { id: 'recurring', label: 'Recurring', icon: Repeat },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'data', label: 'Data', icon: HardDrive },
  ]

  return (
    <Layout>
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Settings</h1>

        <div className="flex gap-6">
          {/* Sidebar tabs */}
          <div className="w-40 flex-shrink-0">
            <nav className="space-y-0.5">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'profile' && (
              <>
                <Section title="Payment Details" description="Auto-filled on every new invoice and expense report">
                  <div className="grid grid-cols-2 gap-3">
                    <F label="Beneficiary"><input type="text" value={profileData.beneficiary} onChange={e => setProfileData(p => ({ ...p, beneficiary: e.target.value }))} placeholder="Account holder name" className={inputClass} /></F>
                    <F label="IBAN"><input type="text" value={profileData.iban} onChange={e => setProfileData(p => ({ ...p, iban: e.target.value }))} placeholder="e.g. FR76 1234 5678 9012 3456 7890 123" className={inputClass} /></F>
                    <F label="BIC / SWIFT"><input type="text" value={profileData.bic} onChange={e => setProfileData(p => ({ ...p, bic: e.target.value }))} placeholder="e.g. BNPAFRPP" className={inputClass} /></F>
                    <F label="Intermediary BIC"><input type="text" value={profileData.intermediaryBic} onChange={e => setProfileData(p => ({ ...p, intermediaryBic: e.target.value }))} placeholder="Optional" className={inputClass} /></F>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/[0.04]">
                    <F label="ETH Address (ERC-20)"><input type="text" value={profileData.ethAddress} onChange={e => setProfileData(p => ({ ...p, ethAddress: e.target.value }))} placeholder="0x..." className={`${inputClass} font-mono`} /></F>
                  </div>
                </Section>

                <Section title="Identity" description="Your business details, auto-applied to all new documents">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <F label="Name / Company"><input type="text" value={profileData.yourName} onChange={e => setProfileData(p => ({ ...p, yourName: e.target.value }))} placeholder="Your Name" className={inputClass} /></F>
                      <F label="Email"><input type="text" value={profileData.yourEmail} onChange={e => setProfileData(p => ({ ...p, yourEmail: e.target.value }))} placeholder="you@example.com" className={inputClass} /></F>
                    </div>
                    <F label="Address"><textarea value={profileData.yourAddress} onChange={e => setProfileData(p => ({ ...p, yourAddress: e.target.value }))} rows={2} placeholder="Street, City, Country" className={`${inputClass} resize-none`} /></F>
                    <F label="Tax ID / VAT Number"><input type="text" value={profileData.yourTaxId} onChange={e => setProfileData(p => ({ ...p, yourTaxId: e.target.value }))} placeholder="e.g. FR12345678901" className={inputClass} /></F>
                  </div>
                </Section>

                <button onClick={handleSaveProfile} className="px-4 py-2 text-[13px] font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition">
                  Save Profile
                </button>
              </>
            )}

            {activeTab === 'invoicing' && (
              <>
                <Section title="Invoice Number Format" description="Choose how your invoice numbers are generated">
                  <div className="space-y-2 mb-4">
                    {INVOICE_NUMBER_FORMATS.map(format => (
                      <label
                        key={format.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                          invoiceFormat === format.value
                            ? 'border-brand-500/40 bg-brand-50/50 dark:bg-brand-500/5'
                            : 'border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                        }`}
                      >
                        <input type="radio" name="invoiceFormat" value={format.value} checked={invoiceFormat === format.value} onChange={e => setInvoiceFormat(e.target.value)} className="w-3.5 h-3.5 text-brand-600" />
                        <div>
                          <p className="text-[13px] font-medium text-gray-900 dark:text-white">{format.label}</p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500">{format.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {invoiceFormat === '{PREFIX}-{SEQ}' && (
                    <F label="Custom Prefix"><input type="text" value={customPrefix} onChange={e => setCustomPrefix(e.target.value)} placeholder="e.g. INV, BILL" className={`${inputClass} mb-3`} /></F>
                  )}
                  <F label="Starting Number"><input type="number" value={startingNumber} onChange={e => setStartingNumber(e.target.value)} min="1" className={inputClass} /></F>
                </Section>

                <Section title="Default Settings" description="Applied to new invoices automatically">
                  <div className="space-y-3">
                    <F label="Default Currency">
                      <select value={defaultCurrency} onChange={e => setDefaultCurrency(e.target.value)} className={inputClass}>
                        {['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'AUD', 'JPY', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'CNY', 'INR', 'BRL', 'MXN'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </F>
                    <div className="grid grid-cols-2 gap-3">
                      <F label="Default VAT Rate (%)">
                        <input type="number" value={defaultVatRate} onChange={e => setDefaultVatRate(e.target.value)} min="0" max="100" step="0.5" placeholder="0" className={inputClass} />
                      </F>
                      <F label="Payment Terms (days)">
                        <input type="number" value={defaultPaymentTerms} onChange={e => setDefaultPaymentTerms(e.target.value)} min="0" placeholder="30" className={inputClass} />
                      </F>
                    </div>
                  </div>
                </Section>

                <button onClick={handleSaveInvoiceSettings} className="px-4 py-2 text-[13px] font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition">
                  Save Settings
                </button>
              </>
            )}

            {activeTab === 'items' && (
              <Section title="Saved Line Items" description="Reusable services and items for quick loading into invoices">
                {showItemForm ? (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-white/[0.02] rounded-lg border border-gray-200 dark:border-white/[0.06]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[12px] font-medium text-gray-600 dark:text-gray-300">New Item</span>
                      <button onClick={() => setShowItemForm(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="space-y-2">
                      <F label="Description"><input type="text" value={itemForm.description} onChange={e => setItemForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Consulting — Senior Developer" className={inputClass} /></F>
                      <F label="Details / Context"><input type="text" value={itemForm.comment} onChange={e => setItemForm(p => ({ ...p, comment: e.target.value }))} placeholder="Optional sub-line details" className={inputClass} /></F>
                      <div className="grid grid-cols-3 gap-2">
                        <F label="Qty"><input type="number" value={itemForm.quantity} onChange={e => setItemForm(p => ({ ...p, quantity: e.target.value }))} min="0" step="0.5" className={inputClass} /></F>
                        <F label="Price"><input type="number" value={itemForm.price} onChange={e => setItemForm(p => ({ ...p, price: e.target.value }))} min="0" step="0.01" placeholder="0.00" className={inputClass} /></F>
                        <F label="VAT %"><input type="number" value={itemForm.vat} onChange={e => setItemForm(p => ({ ...p, vat: e.target.value }))} min="0" max="100" step="0.5" placeholder="Default" className={inputClass} /></F>
                      </div>
                      <button onClick={handleSaveItem} className="px-3 py-1.5 text-[13px] font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition">
                        Save Item
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowItemForm(true)} className="flex items-center gap-1.5 mb-4 text-[13px] text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition">
                    <Plus className="w-3.5 h-3.5" />
                    Add item
                  </button>
                )}

                {savedItems.length === 0 && !showItemForm ? (
                  <div className="text-center py-8">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Package className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-[13px] text-gray-400 dark:text-gray-500">No saved items yet.</p>
                    <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">Save common services to quickly add them to invoices.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.02] rounded-lg border border-gray-100 dark:border-white/[0.04] group">
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-gray-900 dark:text-white">{item.description}</p>
                          {item.comment && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{item.comment}</p>}
                          <div className="flex items-center gap-3 mt-0.5 text-[12px] text-gray-400 dark:text-gray-500">
                            <span>Qty: {item.quantity ?? 1}</span>
                            <span>Price: {Number(item.price || 0).toFixed(2)}</span>
                            {item.vat != null && <span>VAT: {item.vat}%</span>}
                          </div>
                        </div>
                        <button onClick={() => { deleteLineItem(item.id); toast.success('Item deleted') }} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md opacity-0 group-hover:opacity-100 transition">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            )}

            {activeTab === 'clients' && (
              <>
                <Section title="Saved Clients" description="Clients for quick selection in invoices and expense reports">
                  {/* Add / Edit form */}
                  {editingClient !== null ? (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-white/[0.02] rounded-lg border border-gray-200 dark:border-white/[0.06]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[12px] font-medium text-gray-600 dark:text-gray-300">{editingClient === 'new' ? 'New Client' : 'Edit Client'}</span>
                        <button onClick={resetClientForm} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <F label="Name"><input type="text" value={clientForm.name} onChange={e => setClientForm(p => ({ ...p, name: e.target.value }))} placeholder="Client name" className={inputClass} /></F>
                          <F label="Email"><input type="email" value={clientForm.email} onChange={e => setClientForm(p => ({ ...p, email: e.target.value }))} placeholder="client@example.com" className={inputClass} /></F>
                        </div>
                        <F label="Address"><textarea value={clientForm.address} onChange={e => setClientForm(p => ({ ...p, address: e.target.value }))} rows={2} placeholder="Street, City, Country" className={`${inputClass} resize-none`} /></F>
                        <div className="grid grid-cols-2 gap-2">
                          <F label="Tax ID"><input type="text" value={clientForm.taxId} onChange={e => setClientForm(p => ({ ...p, taxId: e.target.value }))} placeholder="e.g. FR12345678901" className={inputClass} /></F>
                          <F label="Default VAT %"><input type="number" value={clientForm.defaultVat} onChange={e => setClientForm(p => ({ ...p, defaultVat: e.target.value }))} min="0" max="100" step="0.5" placeholder="Auto" className={inputClass} /></F>
                        </div>
                        <button onClick={handleSaveClient} className="px-3 py-1.5 text-[13px] font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition">
                          {editingClient === 'new' ? 'Add Client' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={startAddClient} className="flex items-center gap-1.5 mb-4 text-[13px] text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition">
                      <Plus className="w-3.5 h-3.5" />
                      Add client
                    </button>
                  )}

                  {clients.length === 0 && editingClient === null ? (
                    <div className="text-center py-8">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <User className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                      </div>
                      <p className="text-[13px] text-gray-400 dark:text-gray-500">No saved clients yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {clients.map(client => (
                        <div key={client.id} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-white/[0.02] rounded-lg border border-gray-100 dark:border-white/[0.04] group">
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-medium text-gray-900 dark:text-white">{client.client_name || client.clientName}</p>
                            <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">{client.client_email || client.clientEmail || 'No email'}</p>
                            {(client.client_address || client.clientAddress) && (
                              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{client.client_address || client.clientAddress}</p>
                            )}
                            {(client.client_tax_id || client.clientTaxId) && (
                              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Tax ID: {client.client_tax_id || client.clientTaxId}</p>
                            )}
                            {client.default_vat != null && (
                              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">VAT: {client.default_vat}%</p>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => startEditClient(client)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/5 rounded-md">
                              <Pencil className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                            <button onClick={() => { deleteClient(client.id); toast.success('Client deleted') }} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md">
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              </>
            )}

            {activeTab === 'recurring' && (
              <Section title="Recurring Expenses" description="Saved expense templates for quick loading into expense reports">
                {showExpenseForm ? (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-white/[0.02] rounded-lg border border-gray-200 dark:border-white/[0.06]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[12px] font-medium text-gray-600 dark:text-gray-300">New Recurring Expense</span>
                      <button onClick={() => setShowExpenseForm(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="space-y-2">
                      <F label="Description"><input type="text" value={expenseForm.description} onChange={e => setExpenseForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Gym membership" className={inputClass} /></F>
                      <div className="grid grid-cols-2 gap-2">
                        <F label="Category">
                          <select value={expenseForm.category} onChange={e => setExpenseForm(p => ({ ...p, category: e.target.value }))} className={inputClass}>
                            {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                        </F>
                        <F label="Default Amount"><input type="number" value={expenseForm.amount} onChange={e => setExpenseForm(p => ({ ...p, amount: e.target.value }))} min="0" step="0.01" placeholder="0.00" className={inputClass} /></F>
                      </div>
                      <button onClick={handleSaveSavedExpense} className="px-3 py-1.5 text-[13px] font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition">
                        Save Template
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowExpenseForm(true)} className="flex items-center gap-1.5 mb-4 text-[13px] text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition">
                    <Plus className="w-3.5 h-3.5" />
                    Add recurring expense
                  </button>
                )}

                {savedExpenses.length === 0 && !showExpenseForm ? (
                  <div className="text-center py-8">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Repeat className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-[13px] text-gray-400 dark:text-gray-500">No recurring expenses yet.</p>
                    <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">Save templates to quickly add common expenses to reports.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedExpenses.map(expense => (
                      <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.02] rounded-lg border border-gray-100 dark:border-white/[0.04] group">
                        <div>
                          <p className="text-[13px] font-medium text-gray-900 dark:text-white">{expense.description}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400">{expense.category}</span>
                            {expense.amount > 0 && <span className="text-[12px] text-gray-400 dark:text-gray-500">{expense.amount.toFixed(2)}</span>}
                          </div>
                        </div>
                        <button onClick={() => { deleteSavedExpense(expense.id); toast.success('Template deleted') }} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md opacity-0 group-hover:opacity-100 transition">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            )}

            {activeTab === 'branding' && (
              <>
                <Section title="Custom Branding" description="Override template colors with your brand">
                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.02] rounded-lg border border-gray-100 dark:border-white/[0.04] cursor-pointer mb-4">
                    <div>
                      <p className="text-[13px] font-medium text-gray-900 dark:text-white">Enable Custom Branding</p>
                      <p className="text-[12px] text-gray-400 dark:text-gray-500">Override template colors with your brand colors</p>
                    </div>
                    <input type="checkbox" checked={customBranding.enabled} onChange={e => updateBranding('enabled', e.target.checked)} className="w-4 h-4 text-brand-600 rounded" />
                  </label>

                  {customBranding.enabled && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: 'accentColor', label: 'Accent Color' },
                          { key: 'tableHeaderBg', label: 'Table Header BG' },
                          { key: 'tableHeaderText', label: 'Table Header Text' },
                          { key: 'paymentBorder', label: 'Payment Border' },
                        ].map(({ key, label }) => (
                          <div key={key}>
                            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">{label}</label>
                            <div className="flex items-center gap-2">
                              <input type="color" value={customBranding[key]} onChange={e => updateBranding(key, e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-gray-200 dark:border-white/10" />
                              <input type="text" value={customBranding[key]} onChange={e => updateBranding(key, e.target.value)} className={inputClass} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <F label="Font">
                        <select value={customBranding.fontFamily} onChange={e => updateBranding('fontFamily', e.target.value)} className={inputClass}>
                          {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                      </F>
                    </div>
                  )}
                </Section>

                <button onClick={handleSaveBranding} className="px-4 py-2 text-[13px] font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition">
                  Save Branding
                </button>
              </>
            )}

            {activeTab === 'data' && (
              <>
                <Section title="Export Backup" description="Download all your data as a JSON file">
                  <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-4">
                    Exports your profiles, clients, invoices, expenses, saved items, and all settings into a single file.
                  </p>
                  <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition">
                    <Download size={14} />
                    Export Backup
                  </button>
                </Section>

                <Section title="Import Backup" description="Restore data from a previously exported file">
                  <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-2">
                    This will overwrite your current data with the contents of the backup file.
                  </p>
                  <p className="text-[12px] text-amber-600 dark:text-amber-400 mb-4">
                    The page will reload after import to apply all changes.
                  </p>
                  <button onClick={handleImport} className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-white/[0.08] rounded-lg hover:bg-gray-200 dark:hover:bg-white/[0.1] transition">
                    <Upload size={14} />
                    Import Backup
                  </button>
                </Section>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
