import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useInvoices } from '../hooks/useInvoices'
import { useProfiles } from '../hooks/useProfiles'
import { useRecurringInvoices } from '../hooks/useRecurringInvoices'
import { useInvoiceHistory } from '../hooks/useInvoiceHistory'
import { Button, Input, TextArea, Select, Section, StatusBadge } from '../components/ui'
import { SavedItemsBox } from '../components/SavedItemsBox'
import { InvoicePreview, generatePrintHTML } from '../components/InvoicePreview'
import { SignatureCanvas } from '../components/SignatureCanvas'
import { InvoiceHistoryPanel } from '../components/InvoiceHistory'
import { GuidedSidebar } from '../components/GuidedInvoice'
import { exportToPDF } from '../lib/pdfExport'
import { openEmailClient } from '../lib/emailInvoice'
import { INVOICE_TEMPLATES, DEFAULT_TEMPLATE } from '../lib/invoiceTemplates'
import { ArrowLeft, Download, Save, Plus, Trash2, X, Copy, Upload, Image, Printer, Mail, RefreshCw, Palette, History } from 'lucide-react'

const defaultLineItem = { description: '', comment: '', quantity: 1, price: 0, vat: 0 }

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
]

const FREQUENCY_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
]

export const InvoiceEditor = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const isRecurringMode = searchParams.get('recurring') === 'true'
  const isGuidedMode = searchParams.get('guided') === 'true'

  const { getInvoice, createInvoice, updateInvoice } = useInvoices()
  const { createRecurring } = useRecurringInvoices()
  const { addHistoryEntry, actions } = useInvoiceHistory()
  const {
    profiles,
    clients,
    lineItems: savedLineItems,
    saveProfile,
    deleteProfile,
    saveClient,
    deleteClient,
    saveLineItem,
    deleteLineItem,
  } = useProfiles()

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showFullPreview, setShowFullPreview] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [originalStatus, setOriginalStatus] = useState('draft')
  const [currentSection, setCurrentSection] = useState('invoice')
  const previewRef = useRef(null)

  const [openSections, setOpenSections] = useState({
    invoice: true,
    template: false,
    yourInfo: true,
    clientInfo: true,
    lineItems: true,
    payment: true,
    notes: false,
    signature: false,
  })

  // Invoice data state
  const [invoiceNumber, setInvoiceNumber] = useState('INV-001')
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [status, setStatus] = useState('draft')
  const [projectName, setProjectName] = useState('')
  const [notes, setNotes] = useState('')

  const [yourName, setYourName] = useState('')
  const [yourAddress, setYourAddress] = useState('')
  const [yourEmail, setYourEmail] = useState('')
  const [yourTaxId, setYourTaxId] = useState('')

  const [clientName, setClientName] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientTaxId, setClientTaxId] = useState('')

  const [lineItems, setLineItems] = useState([{ ...defaultLineItem }])

  const [beneficiary, setBeneficiary] = useState('')
  const [iban, setIban] = useState('')
  const [bic, setBic] = useState('')
  const [intermediaryBic, setIntermediaryBic] = useState('')
  const [logo, setLogo] = useState('')
  const [signature, setSignature] = useState('')
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE)

  // Recurring invoice options
  const [frequency, setFrequency] = useState('monthly')
  const [paymentTerms, setPaymentTerms] = useState(30)

  // Load existing invoice
  useEffect(() => {
    if (!isNew) {
      loadInvoice()
    }
  }, [id])

  const loadInvoice = async () => {
    try {
      const invoice = await getInvoice(id)
      if (invoice) {
        setInvoiceNumber(invoice.invoice_number || invoice.invoiceNumber || 'INV-001')
        setIssueDate(invoice.issue_date || invoice.issueDate || '')
        setDueDate(invoice.due_date || invoice.dueDate || '')
        setCurrency(invoice.currency || 'EUR')
        const invoiceStatus = invoice.status || 'draft'
        setStatus(invoiceStatus)
        setOriginalStatus(invoiceStatus)
        setProjectName(invoice.project_name || invoice.projectName || '')
        setNotes(invoice.notes || '')
        setYourName(invoice.your_name || invoice.yourName || '')
        setYourAddress(invoice.your_address || invoice.yourAddress || '')
        setYourEmail(invoice.your_email || invoice.yourEmail || '')
        setYourTaxId(invoice.your_tax_id || invoice.yourTaxId || '')
        setClientName(invoice.client_name || invoice.clientName || '')
        setClientAddress(invoice.client_address || invoice.clientAddress || '')
        setClientEmail(invoice.client_email || invoice.clientEmail || '')
        setClientTaxId(invoice.client_tax_id || invoice.clientTaxId || '')
        setLineItems(invoice.line_items || invoice.lineItems || [{ ...defaultLineItem }])
        setBeneficiary(invoice.beneficiary || '')
        setIban(invoice.iban || '')
        setBic(invoice.bic || '')
        setIntermediaryBic(invoice.intermediary_bic || invoice.intermediaryBic || '')
        setLogo(invoice.logo || '')
        setSignature(invoice.signature || '')
        setTemplate(invoice.template || DEFAULT_TEMPLATE)
      }
    } catch (error) {
      console.error('Error loading invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
    if (!openSections[section]) {
      setCurrentSection(section)
    }
  }

  const handleGuidedComplete = async () => {
    await handleSave()
    localStorage.setItem('onboarding_completed', 'done')
    navigate('/dashboard')
  }

  const getInvoiceData = () => ({
    invoiceNumber,
    issueDate,
    dueDate,
    currency,
    status,
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
    lineItems,
    beneficiary,
    iban,
    bic,
    intermediaryBic,
    logo,
    signature,
    template,
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = {
        invoice_number: invoiceNumber,
        issue_date: issueDate,
        due_date: dueDate,
        currency,
        status,
        project_name: projectName,
        notes,
        your_name: yourName,
        your_address: yourAddress,
        your_email: yourEmail,
        your_tax_id: yourTaxId,
        client_name: clientName,
        client_address: clientAddress,
        client_email: clientEmail,
        client_tax_id: clientTaxId,
        line_items: lineItems,
        beneficiary,
        iban,
        bic,
        intermediary_bic: intermediaryBic,
        logo,
        signature,
        template,
      }

      if (isNew) {
        const created = await createInvoice(data)
        // Track creation in history
        addHistoryEntry(created.id, actions.CREATED, { invoiceNumber })
        navigate(`/invoice/${created.id}`, { replace: true })
      } else {
        await updateInvoice(id, data)
        // Track update in history
        if (status !== originalStatus) {
          addHistoryEntry(id, actions.STATUS_CHANGED, {
            invoiceNumber,
            oldStatus: originalStatus,
            newStatus: status,
          })
          setOriginalStatus(status)
        } else {
          addHistoryEntry(id, actions.UPDATED, { invoiceNumber })
        }
      }
    } catch (error) {
      console.error('Error saving invoice:', error)
      alert('Failed to save invoice')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAsRecurring = async () => {
    setSaving(true)
    try {
      const templateData = {
        currency,
        project_name: projectName,
        notes,
        your_name: yourName,
        your_address: yourAddress,
        your_email: yourEmail,
        your_tax_id: yourTaxId,
        client_name: clientName,
        client_address: clientAddress,
        client_email: clientEmail,
        client_tax_id: clientTaxId,
        line_items: lineItems,
        beneficiary,
        iban,
        bic,
        intermediary_bic: intermediaryBic,
        logo,
        signature,
        template,
        frequency,
        payment_terms: paymentTerms,
      }

      await createRecurring(templateData)
      navigate('/recurring')
    } catch (error) {
      console.error('Error saving recurring invoice:', error)
      alert('Failed to save recurring invoice')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async () => {
    if (previewRef.current) {
      setExporting(true)
      try {
        await exportToPDF(previewRef.current, `${invoiceNumber || 'invoice'}.pdf`)
        // Track export in history
        if (!isNew && id) {
          addHistoryEntry(id, actions.EXPORTED_PDF, { invoiceNumber })
        }
      } catch (error) {
        console.error('Error exporting PDF:', error)
        // Fallback to print dialog
        const printWindow = window.open('', '_blank')
        printWindow.document.write(generatePrintHTML(getInvoiceData()))
        printWindow.document.close()
      } finally {
        setExporting(false)
      }
    } else {
      // Fallback to print dialog
      const printWindow = window.open('', '_blank')
      printWindow.document.write(generatePrintHTML(getInvoiceData()))
      printWindow.document.close()
      // Track export in history
      if (!isNew && id) {
        addHistoryEntry(id, actions.EXPORTED_PDF, { invoiceNumber })
      }
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(generatePrintHTML(getInvoiceData()))
    printWindow.document.close()
  }

  const handleEmail = () => {
    openEmailClient(getInvoiceData())
    // Track email in history
    if (!isNew && id) {
      addHistoryEntry(id, actions.EMAILED, { invoiceNumber, clientEmail })
    }
  }

  // Profile handlers
  const handleSaveProfile = async () => {
    if (!yourName) return alert('Please enter your name first')
    await saveProfile({
      your_name: yourName,
      your_address: yourAddress,
      your_email: yourEmail,
      your_tax_id: yourTaxId,
      beneficiary,
      iban,
      bic,
      intermediary_bic: intermediaryBic,
    })
  }

  const handleLoadProfile = (profile) => {
    setYourName(profile.your_name || profile.yourName || '')
    setYourAddress(profile.your_address || profile.yourAddress || '')
    setYourEmail(profile.your_email || profile.yourEmail || '')
    setYourTaxId(profile.your_tax_id || profile.yourTaxId || '')
    setBeneficiary(profile.beneficiary || '')
    setIban(profile.iban || '')
    setBic(profile.bic || '')
    setIntermediaryBic(profile.intermediary_bic || profile.intermediaryBic || '')
  }

  // Client handlers
  const handleSaveClient = async () => {
    if (!clientName) return alert('Please enter client name first')
    await saveClient({
      client_name: clientName,
      client_address: clientAddress,
      client_email: clientEmail,
      client_tax_id: clientTaxId,
    })
  }

  const handleLoadClient = (client) => {
    setClientName(client.client_name || client.clientName || '')
    setClientAddress(client.client_address || client.clientAddress || '')
    setClientEmail(client.client_email || client.clientEmail || '')
    setClientTaxId(client.client_tax_id || client.clientTaxId || '')
  }

  // Line item handlers
  const addLineItem = () => {
    setLineItems([...lineItems, { ...defaultLineItem }])
  }

  const removeLineItem = (index) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const updateLineItem = (index, field, value) => {
    const updated = [...lineItems]
    updated[index][field] = value
    setLineItems(updated)
  }

  const handleSaveLineItem = async (item) => {
    if (!item.description) return alert('Please enter a description first')
    await saveLineItem({
      description: item.description,
      comment: item.comment,
      quantity: item.quantity,
      price: item.price,
      vat: item.vat,
    })
  }

  const handleLoadLineItem = (item) => {
    setLineItems([...lineItems, {
      description: item.description || '',
      comment: item.comment || '',
      quantity: item.quantity || 1,
      price: item.price || 0,
      vat: item.vat || 0,
    }])
  }

  // Logo handlers
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    if (file.size > 500 * 1024) {
      alert('Image must be less than 500KB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setLogo(event.target?.result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setLogo('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full" />
      </div>
    )
  }

  if (showFullPreview) {
    return (
      <div className="fixed inset-0 bg-gray-900 overflow-auto">
        <div className="sticky top-0 bg-gray-900 p-4 flex justify-between items-center z-10">
          <h2 className="text-white font-semibold">Invoice Preview</h2>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleEmail}>
              <Mail className="w-4 h-4" />
              Email
            </Button>
            <Button variant="secondary" onClick={handlePrint}>
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button onClick={handleExport} loading={exporting}>
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <button
              onClick={() => setShowFullPreview(false)}
              className="text-white hover:text-gray-300 p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div ref={previewRef}>
          <InvoicePreview data={getInvoiceData()} fullScreen />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Guided Sidebar for onboarding */}
      {isGuidedMode && (
        <GuidedSidebar
          currentSection={currentSection}
          invoiceData={getInvoiceData()}
          onComplete={handleGuidedComplete}
        />
      )}

      {/* Editor Panel */}
      <div className={`${isGuidedMode ? 'flex-1' : 'w-1/2'} overflow-auto scrollbar-thin p-6`}>
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            {!isGuidedMode && (
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isGuidedMode ? '✨ Create Your First Invoice' : isNew ? 'New Invoice' : `Edit ${invoiceNumber}`}
            </h1>
          </div>

          <Section
            title={isRecurringMode ? 'Recurring Invoice Template' : 'Invoice Details'}
            isOpen={openSections.invoice}
            onToggle={() => toggleSection('invoice')}
          >
            <div className="grid grid-cols-2 gap-4 pt-4">
              {isRecurringMode && (
                <>
                  <div className="col-span-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-3 mb-2">
                    <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300">
                      <RefreshCw className="w-4 h-4" />
                      <span className="text-sm font-medium">Recurring Invoice Mode</span>
                    </div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      This will create a template for automatic invoicing.
                    </p>
                  </div>
                  <Select
                    label="Frequency"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    options={FREQUENCY_OPTIONS}
                  />
                  <Select
                    label="Payment Terms (days)"
                    value={String(paymentTerms)}
                    onChange={(e) => setPaymentTerms(parseInt(e.target.value))}
                    options={[
                      { value: '7', label: 'Net 7' },
                      { value: '14', label: 'Net 14' },
                      { value: '30', label: 'Net 30' },
                      { value: '45', label: 'Net 45' },
                      { value: '60', label: 'Net 60' },
                    ]}
                  />
                </>
              )}
              {!isRecurringMode && (
                <>
                  <Input
                    label="Invoice Number"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                  <Select
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={STATUS_OPTIONS}
                  />
                </>
              )}
              <Input
                label="Project / Description"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Website Redesign"
                className="col-span-2"
              />
              <Select
                label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                options={[
                  { value: 'EUR', label: 'EUR (€)' },
                  { value: 'USD', label: 'USD ($)' },
                  { value: 'GBP', label: 'GBP (£)' },
                  { value: 'CHF', label: 'CHF' },
                ]}
              />
              {!isRecurringMode && (
                <>
                  <Input
                    label="Issue Date"
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                  />
                  <Input
                    label="Due Date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </>
              )}
            </div>
          </Section>

          <Section
            title="Invoice Template"
            isOpen={openSections.template}
            onToggle={() => toggleSection('template')}
          >
            <div className="pt-4">
              <p className="text-sm text-gray-500 mb-4">Choose a template style for your invoice</p>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(INVOICE_TEMPLATES).map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setTemplate(tmpl.id)}
                    className={`relative p-3 rounded-lg border-2 text-left transition-all ${
                      template === tmpl.id
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: tmpl.styles.accentColor }}
                      />
                      <span className="font-medium text-sm">{tmpl.name}</span>
                    </div>
                    <p className="text-xs text-gray-500">{tmpl.description}</p>
                    {template === tmpl.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          <Section
            title="Your Information"
            isOpen={openSections.yourInfo}
            onToggle={() => toggleSection('yourInfo')}
          >
            <div className="pt-4">
              <SavedItemsBox
                items={profiles}
                onLoad={handleLoadProfile}
                onDelete={deleteProfile}
                displayKey="your_name"
              />

              {/* Logo Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                </label>
                {logo ? (
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={logo}
                        alt="Company logo"
                        className="h-16 w-auto object-contain border border-gray-200 rounded-lg p-2 bg-white"
                      />
                      <button
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <label className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                      <Upload className="w-4 h-4" />
                      Change
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition">
                    <Image className="w-5 h-5" />
                    <span className="text-sm">Upload logo (max 500KB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Name / Company"
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                  className="col-span-2"
                />
                <TextArea
                  label="Address"
                  value={yourAddress}
                  onChange={(e) => setYourAddress(e.target.value)}
                />
                <div className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    value={yourEmail}
                    onChange={(e) => setYourEmail(e.target.value)}
                  />
                  <Input
                    label="Tax ID / VAT"
                    value={yourTaxId}
                    onChange={(e) => setYourTaxId(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={handleSaveProfile}
                className="mt-4 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <Save className="w-4 h-4" />
                Save as Profile
              </button>
            </div>
          </Section>

          <Section
            title="Client Information"
            isOpen={openSections.clientInfo}
            onToggle={() => toggleSection('clientInfo')}
          >
            <div className="pt-4">
              <SavedItemsBox
                items={clients}
                onLoad={handleLoadClient}
                onDelete={deleteClient}
                displayKey="client_name"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Name / Company"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="col-span-2"
                />
                <TextArea
                  label="Address"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                />
                <div className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                  <Input
                    label="Tax ID / VAT"
                    value={clientTaxId}
                    onChange={(e) => setClientTaxId(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={handleSaveClient}
                className="mt-4 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <Save className="w-4 h-4" />
                Save Client
              </button>
            </div>
          </Section>

          <Section
            title="Line Items"
            isOpen={openSections.lineItems}
            onToggle={() => toggleSection('lineItems')}
          >
            <div className="pt-4">
              <SavedItemsBox
                items={savedLineItems}
                onLoad={handleLoadLineItem}
                onDelete={deleteLineItem}
                displayKey="description"
                secondaryKey="price"
              />
              {lineItems.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 mb-3 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-medium text-gray-500">Item {index + 1}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleSaveLineItem(item)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Save item"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      {lineItems.length > 1 && (
                        <button
                          onClick={() => removeLineItem(index)}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <Input
                    label="Description"
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    className="mb-2"
                  />
                  <TextArea
                    label="Comment (optional)"
                    value={item.comment || ''}
                    onChange={(e) => updateLineItem(index, 'comment', e.target.value)}
                    rows={2}
                    placeholder="Additional details..."
                  />
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <Input
                      label="Quantity"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                      label="Price"
                      type="number"
                      value={item.price}
                      onChange={(e) => updateLineItem(index, 'price', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                      label="VAT %"
                      type="number"
                      value={item.vat}
                      onChange={(e) => updateLineItem(index, 'vat', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={addLineItem}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Line Item
              </button>
            </div>
          </Section>

          <Section
            title="Payment Details"
            isOpen={openSections.payment}
            onToggle={() => toggleSection('payment')}
          >
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Input
                label="Beneficiary Name"
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
                className="col-span-2"
              />
              <Input
                label="IBAN"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                className="col-span-2"
              />
              <Input
                label="BIC / SWIFT"
                value={bic}
                onChange={(e) => setBic(e.target.value)}
              />
              <Input
                label="Intermediary BIC"
                value={intermediaryBic}
                onChange={(e) => setIntermediaryBic(e.target.value)}
              />
            </div>
          </Section>

          <Section
            title="Notes"
            isOpen={openSections.notes}
            onToggle={() => toggleSection('notes')}
          >
            <div className="pt-4">
              <TextArea
                label="Additional Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="e.g. Payment terms, late fees, thank you message..."
              />
              <div className="mt-2 flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setNotes(notes + (notes ? '\n' : '') + 'Payment is due within 30 days of invoice date.')}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 bg-gray-100 rounded"
                >
                  + Net 30
                </button>
                <button
                  type="button"
                  onClick={() => setNotes(notes + (notes ? '\n' : '') + 'A late payment fee of 1.5% per month will apply to overdue invoices.')}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 bg-gray-100 rounded"
                >
                  + Late fee
                </button>
                <button
                  type="button"
                  onClick={() => setNotes(notes + (notes ? '\n' : '') + 'Thank you for your business!')}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 bg-gray-100 rounded"
                >
                  + Thank you
                </button>
              </div>
            </div>
          </Section>

          <Section
            title="Signature"
            isOpen={openSections.signature}
            onToggle={() => toggleSection('signature')}
          >
            <div className="pt-4">
              <SignatureCanvas
                value={signature}
                onChange={setSignature}
                label="Your Signature"
              />
              <p className="text-xs text-gray-400 mt-3">
                Add your signature to appear on the invoice. You can draw or upload an image.
              </p>
            </div>
          </Section>
        </div>
      </div>

      {/* Preview Panel */}
      <div className={`${isGuidedMode ? 'w-2/5' : showHistory ? 'w-1/3' : 'w-1/2'} bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col transition-all`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700 dark:text-gray-200">Live Preview</span>
            {!isNew && !isRecurringMode && !isGuidedMode && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-1.5 rounded-md transition-colors ${
                  showHistory ? 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                title="Toggle activity log"
              >
                <History className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {isRecurringMode ? (
              <Button variant="dark" onClick={handleSaveAsRecurring} loading={saving}>
                <RefreshCw className="w-4 h-4" />
                Save Recurring
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={handleSave} loading={saving}>
                  <Save className="w-4 h-4" />
                  Save
                </Button>
                <Button variant="secondary" onClick={handleEmail}>
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
                <Button variant="secondary" onClick={handlePrint}>
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
                <Button onClick={handleExport} loading={exporting}>
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-auto scrollbar-thin p-6 bg-gray-100 dark:bg-gray-900">
          <div ref={previewRef} className="bg-white shadow-lg rounded-lg overflow-hidden">
            <InvoicePreview data={getInvoiceData()} />
          </div>
        </div>
      </div>

      {/* History Panel */}
      {showHistory && !isNew && (
        <div className="w-1/6 min-w-[280px] border-l border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
            <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">Activity Log</span>
            <button
              onClick={() => setShowHistory(false)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <InvoiceHistoryPanel invoiceId={id} className="border-0 p-0" />
          </div>
        </div>
      )}

    </div>
  )
}
