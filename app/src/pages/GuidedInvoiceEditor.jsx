import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useInvoices } from '../hooks/useInvoices'
import { useProfiles } from '../hooks/useProfiles'
import { INVOICE_TEMPLATES, DEFAULT_TEMPLATE } from '../lib/invoiceTemplates'
import {
  FileText,
  Building2,
  User,
  CreditCard,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Plus,
  Trash2,
  Image,
  X,
  Settings,
  Pencil,
  Wallet,
  Clock,
  DollarSign,
  Bitcoin,
  Upload,
  ImageIcon,
} from 'lucide-react'

const defaultLineItem = { description: '', quantity: 1, price: 0, vat: 0 }

// Signature Pad Component
const SignaturePad = ({ signature, onSignatureChange }) => {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Set up canvas for high DPI
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Set drawing styles
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // If there's an existing signature, draw it
    if (signature) {
      const img = new window.Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height)
      }
      img.src = signature
    }
  }, [])

  const getCoordinates = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  const startDrawing = (e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { x, y } = getCoordinates(e)

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
    setHasDrawn(true)
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { x, y } = getCoordinates(e)

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)

    // Save the signature as data URL
    const canvas = canvasRef.current
    const dataUrl = canvas.toDataURL('image/png')
    onSignatureChange(dataUrl)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)
    setHasDrawn(false)
    onSignatureChange('')
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">Signature</label>
        {(hasDrawn || signature) && (
          <button
            onClick={clearSignature}
            className="text-xs text-red-400 hover:text-red-300 transition"
          >
            Clear
          </button>
        )}
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-24 bg-gray-800 rounded-xl border border-gray-700 cursor-crosshair touch-none"
          style={{ touchAction: 'none' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasDrawn && !signature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm text-gray-500">Draw your signature here</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Logo Upload Component with drag & drop
const LogoUpload = ({ logo, onLogoChange }) => {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onLogoChange(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    handleFile(file)
  }

  const handleRemoveLogo = (e) => {
    e.stopPropagation()
    onLogoChange('')
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-300 mb-1.5">Company Logo</label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'bg-emerald-500/10 border-emerald-500'
            : 'bg-gray-800 border-gray-700 hover:border-gray-600'
        } border-2 border-dashed rounded-xl overflow-hidden`}
      >
        {logo ? (
          <div className="relative p-4 flex items-center justify-center">
            <img src={logo} alt="Logo preview" className="max-h-20 w-auto object-contain" />
            <button
              onClick={handleRemoveLogo}
              className="absolute top-2 right-2 p-1.5 bg-gray-900/80 rounded-lg hover:bg-red-500/80 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center justify-center gap-2">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isDragging ? 'bg-emerald-500/20' : 'bg-gray-700'
            } transition-colors`}>
              <Upload className={`w-6 h-6 ${isDragging ? 'text-emerald-400' : 'text-gray-500'}`} />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-300">
                {isDragging ? 'Drop your logo here' : 'Drag & drop your logo'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                or click to browse (PNG, JPG, SVG)
              </p>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  )
}

// Section configuration
const SECTIONS = [
  { id: 'company', label: 'Your company', icon: Building2, number: 1 },
  { id: 'client', label: 'Your client', icon: User, number: 2 },
  { id: 'details', label: 'Invoice details', icon: FileText, number: 3 },
  { id: 'payment', label: 'Receive in', icon: Wallet, number: 4 },
]

const CURRENCIES = [
  { value: 'EUR', label: 'EUR', symbol: '€' },
  { value: 'USD', label: 'USD', symbol: '$' },
  { value: 'GBP', label: 'GBP', symbol: '£' },
  { value: 'BTC', label: 'BTC', symbol: '₿' },
  { value: 'ETH', label: 'ETH', symbol: 'Ξ' },
  { value: 'USDC', label: 'USDC', symbol: '$' },
]

const PAYMENT_TERMS = [
  { value: 7, label: 'Net 7' },
  { value: 14, label: 'Net 14' },
  { value: 30, label: 'Net 30' },
  { value: 60, label: 'Net 60' },
]

const CRYPTO_NETWORKS = [
  { value: 'ethereum', label: 'Ethereum', icon: '⟠', color: 'from-blue-400 to-purple-500' },
  { value: 'polygon', label: 'Polygon', icon: '⬡', color: 'from-purple-500 to-purple-600' },
  { value: 'arbitrum', label: 'Arbitrum', icon: '◆', color: 'from-blue-500 to-blue-600' },
  { value: 'base', label: 'Base', icon: '●', color: 'from-blue-400 to-blue-500' },
  { value: 'bitcoin', label: 'Bitcoin', icon: '₿', color: 'from-orange-400 to-orange-500' },
]

// Floating label badge that appears on hover - styled like Refine
const SectionBadge = ({ number, label, isActive, position = 'left' }) => (
  <motion.div
    initial={{ opacity: 0, x: position === 'left' ? -10 : 10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: position === 'left' ? -10 : 10 }}
    className={`absolute z-20 flex items-center gap-2.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl shadow-2xl ${
      position === 'left' ? '-left-2' : '-right-2'
    }`}
    style={{ top: '50%', transform: 'translateY(-50%)' }}
  >
    <span className={`w-6 h-6 ${isActive ? 'bg-emerald-500' : 'bg-gray-700'} rounded-lg flex items-center justify-center text-xs font-bold transition-colors`}>
      {number}
    </span>
    <span className="text-white/90">{label}</span>
  </motion.div>
)

// Section wrapper with hover state - Refine-style bracket corners
const SectionWrapper = ({
  section,
  isActive,
  onActivate,
  children,
  className = '',
  badgePosition = 'left',
  sectionRef
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const showHighlight = isHovered || isActive

  return (
    <div
      ref={sectionRef}
      className={`relative transition-all duration-300 cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onActivate(section.id)}
    >
      {/* Corner brackets - only show on hover/active */}
      <AnimatePresence>
        {showHighlight && (
          <>
            {/* Top-left corner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute -top-2 -left-2 w-5 h-5 border-l-2 border-t-2 rounded-tl-sm ${
                isActive ? 'border-emerald-500' : 'border-emerald-300'
              }`}
            />
            {/* Top-right corner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute -top-2 -right-2 w-5 h-5 border-r-2 border-t-2 rounded-tr-sm ${
                isActive ? 'border-emerald-500' : 'border-emerald-300'
              }`}
            />
            {/* Bottom-left corner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute -bottom-2 -left-2 w-5 h-5 border-l-2 border-b-2 rounded-bl-sm ${
                isActive ? 'border-emerald-500' : 'border-emerald-300'
              }`}
            />
            {/* Bottom-right corner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute -bottom-2 -right-2 w-5 h-5 border-r-2 border-b-2 rounded-br-sm ${
                isActive ? 'border-emerald-500' : 'border-emerald-300'
              }`}
            />
          </>
        )}
      </AnimatePresence>

      {/* Background highlight */}
      <motion.div
        initial={false}
        animate={{
          backgroundColor: isActive ? 'rgba(59, 130, 246, 0.05)' : isHovered ? 'rgba(59, 130, 246, 0.02)' : 'transparent'
        }}
        className="absolute inset-0 rounded-lg -z-10"
      />

      {/* Floating badge */}
      <AnimatePresence>
        {showHighlight && (
          <SectionBadge
            number={section.number}
            label={section.label}
            isActive={isActive}
            position={badgePosition}
          />
        )}
      </AnimatePresence>

      {children}
    </div>
  )
}

// Editable text field that appears inline
const InlineEdit = ({ value, onChange, placeholder, className = '', multiline = false }) => {
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => e.key === 'Escape' && setIsEditing(false)}
          placeholder={placeholder}
          className={`bg-transparent border-b-2 border-emerald-500 outline-none resize-none ${className}`}
          rows={3}
        />
      )
    }
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setIsEditing(false)}
        onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
        placeholder={placeholder}
        className={`bg-transparent border-b-2 border-emerald-500 outline-none ${className}`}
      />
    )
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`cursor-text hover:bg-emerald-100/50 rounded px-1 -mx-1 transition-colors ${className} ${!value ? 'text-gray-400 italic' : ''}`}
    >
      {value || placeholder}
    </span>
  )
}

// Side panel form
const SidePanel = ({
  activeSection,
  setActiveSection,
  data,
  setData,
  profiles,
  clients,
  onLoadProfile,
  onLoadClient,
  currencySymbol,
  onClose
}) => {
  const sectionConfig = SECTIONS.find(s => s.id === activeSection)
  const Icon = sectionConfig?.icon || FileText

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 bottom-0 w-[420px] bg-gray-900 shadow-2xl z-30 flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center">
              <Icon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">{sectionConfig?.label}</h2>
              <p className="text-xs text-gray-400">Step {sectionConfig?.number} of {SECTIONS.length}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            {/* Company Section */}
            {activeSection === 'company' && (
              <>
                <p className="text-sm text-gray-400">Enter your business information that will appear on the invoice.</p>

                {/* Logo Upload */}
                <LogoUpload
                  logo={data.logo}
                  onLogoChange={(logo) => setData({ ...data, logo })}
                />

                {profiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase">Quick select</p>
                    {profiles.slice(0, 2).map(profile => (
                      <button
                        key={profile.id}
                        onClick={() => onLoadProfile(profile)}
                        className="w-full flex items-center gap-3 p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition text-left border border-gray-700"
                      >
                        <Building2 className="w-5 h-5 text-gray-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{profile.your_name}</p>
                          <p className="text-xs text-gray-400 truncate">{profile.your_email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 rounded-xl border border-gray-700">
                      <input
                        type="email"
                        value={data.yourEmail}
                        onChange={(e) => setData({ ...data, yourEmail: e.target.value })}
                        placeholder="hello@company.com"
                        className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-500"
                      />
                      <Pencil className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Company</label>
                    <input
                      type="text"
                      value={data.yourName}
                      onChange={(e) => setData({ ...data, yourName: e.target.value })}
                      placeholder="Company name"
                      className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 outline-none text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Address</label>
                    <input
                      type="text"
                      value={data.yourAddress?.split('\n')[0] || ''}
                      onChange={(e) => {
                        const lines = data.yourAddress?.split('\n') || ['', '', '']
                        lines[0] = e.target.value
                        setData({ ...data, yourAddress: lines.join('\n') })
                      }}
                      placeholder="Street address"
                      className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 outline-none text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">City</label>
                    <input
                      type="text"
                      value={data.yourAddress?.split('\n')[1] || ''}
                      onChange={(e) => {
                        const lines = data.yourAddress?.split('\n') || ['', '', '']
                        lines[1] = e.target.value
                        setData({ ...data, yourAddress: lines.join('\n') })
                      }}
                      placeholder="City, Postal Code"
                      className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 outline-none text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Country</label>
                    <input
                      type="text"
                      value={data.yourAddress?.split('\n')[2] || ''}
                      onChange={(e) => {
                        const lines = data.yourAddress?.split('\n') || ['', '', '']
                        lines[2] = e.target.value
                        setData({ ...data, yourAddress: lines.join('\n') })
                      }}
                      placeholder="Country"
                      className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 outline-none text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Tax ID</label>
                    <input
                      type="text"
                      value={data.yourTaxId}
                      onChange={(e) => setData({ ...data, yourTaxId: e.target.value })}
                      placeholder="VAT number (optional)"
                      className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 outline-none text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Client Section */}
            {activeSection === 'client' && (
              <>
                <p className="text-sm text-gray-400">Who are you billing?</p>

                {clients.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase">Recent clients</p>
                    {clients.slice(0, 3).map(client => (
                      <button
                        key={client.id}
                        onClick={() => onLoadClient(client)}
                        className="w-full flex items-center gap-3 p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition text-left border border-gray-700"
                      >
                        <User className="w-5 h-5 text-gray-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{client.client_name}</p>
                          <p className="text-xs text-gray-400 truncate">{client.client_email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Client Name</label>
                    <input
                      type="text"
                      value={data.clientName}
                      onChange={(e) => setData({ ...data, clientName: e.target.value })}
                      placeholder="Company or person name"
                      className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 outline-none text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={data.clientEmail}
                      onChange={(e) => setData({ ...data, clientEmail: e.target.value })}
                      placeholder="client@company.com"
                      className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 outline-none text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Address</label>
                    <textarea
                      value={data.clientAddress}
                      onChange={(e) => setData({ ...data, clientAddress: e.target.value })}
                      placeholder="Client's billing address"
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 outline-none text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Invoice Details Section */}
            {activeSection === 'details' && (
              <>
                <p className="text-sm text-gray-400">Configure your invoice settings and add line items.</p>

                {/* Invoice Type Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Invoice type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setData({ ...data, invoiceType: 'fixed' })}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition ${
                        data.invoiceType !== 'hourly'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                      }`}
                    >
                      Fixed Price
                    </button>
                    <button
                      onClick={() => setData({ ...data, invoiceType: 'hourly' })}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition ${
                        data.invoiceType === 'hourly'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                      }`}
                    >
                      Hourly
                    </button>
                  </div>
                </div>

                {/* Date, Term, Currency Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Start date</label>
                    <input
                      type="date"
                      value={data.issueDate}
                      onChange={(e) => setData({ ...data, issueDate: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-800 rounded-lg border border-gray-700 outline-none text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Term</label>
                    <select
                      value={data.paymentTerm}
                      onChange={(e) => setData({ ...data, paymentTerm: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-gray-800 rounded-lg border border-gray-700 outline-none text-sm text-white"
                    >
                      {PAYMENT_TERMS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Currency</label>
                    <select
                      value={data.currency}
                      onChange={(e) => setData({ ...data, currency: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-800 rounded-lg border border-gray-700 outline-none text-sm text-white"
                    >
                      {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Bill Monthly Toggle */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-300">Bill monthly</span>
                  <button
                    onClick={() => setData({ ...data, billMonthly: !data.billMonthly })}
                    className={`w-11 h-6 rounded-full transition-colors ${data.billMonthly ? 'bg-emerald-600' : 'bg-gray-700'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${data.billMonthly ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                {/* Line Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 uppercase">Description</span>
                    <span className="text-xs font-medium text-gray-500 uppercase">Price</span>
                  </div>

                  {data.lineItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...data.lineItems]
                            updated[index].description = e.target.value
                            setData({ ...data, lineItems: updated })
                          }}
                          placeholder="Select service"
                          className="w-full px-3 py-2.5 bg-gray-800 rounded-lg border border-gray-700 outline-none text-sm text-white placeholder-gray-500"
                        />
                      </div>
                      <div className="w-24 flex items-center gap-1">
                        <span className="text-gray-500 text-sm">{currencySymbol}</span>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => {
                            const updated = [...data.lineItems]
                            updated[index].price = parseFloat(e.target.value) || 0
                            setData({ ...data, lineItems: updated })
                          }}
                          className="w-full px-2 py-2.5 bg-gray-800 rounded-lg border border-gray-700 outline-none text-sm text-white text-right"
                        />
                      </div>
                      {data.lineItems.length > 1 && (
                        <button
                          onClick={() => {
                            setData({ ...data, lineItems: data.lineItems.filter((_, i) => i !== index) })
                          }}
                          className="p-1.5 text-gray-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={() => setData({ ...data, lineItems: [...data.lineItems, { ...defaultLineItem }] })}
                    className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add item
                  </button>
                </div>

                {/* Totals */}
                <div className="space-y-2 pt-4 border-t border-gray-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-white">{currencySymbol}{data.lineItems.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <button className="text-gray-500 hover:text-gray-400 flex items-center gap-1">
                      None <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-2">
                    <span className="text-white">Total</span>
                    <span className="text-emerald-400">{currencySymbol}{data.lineItems.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}

            {/* Payment Section */}
            {activeSection === 'payment' && (
              <>
                <p className="text-sm text-gray-400">Choose how you want to receive payment.</p>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Payment method</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setData({ ...data, paymentMethod: 'bank' })}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition ${
                        data.paymentMethod !== 'crypto'
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                      }`}
                    >
                      <DollarSign className={`w-5 h-5 ${data.paymentMethod !== 'crypto' ? 'text-emerald-400' : 'text-gray-500'}`} />
                      <div className="text-left">
                        <p className={`text-sm font-medium ${data.paymentMethod !== 'crypto' ? 'text-white' : 'text-gray-300'}`}>Bank Transfer</p>
                        <p className="text-xs text-gray-500">IBAN / SWIFT</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setData({ ...data, paymentMethod: 'crypto' })}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition ${
                        data.paymentMethod === 'crypto'
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                      }`}
                    >
                      <Bitcoin className={`w-5 h-5 ${data.paymentMethod === 'crypto' ? 'text-emerald-400' : 'text-gray-500'}`} />
                      <div className="text-left">
                        <p className={`text-sm font-medium ${data.paymentMethod === 'crypto' ? 'text-white' : 'text-gray-300'}`}>Cryptocurrency</p>
                        <p className="text-xs text-gray-500">Multiple networks supported</p>
                      </div>
                    </button>
                  </div>
                </div>

                {data.paymentMethod === 'crypto' ? (
                  <>
                    {/* Crypto Network Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Network</label>
                      <div className="grid grid-cols-2 gap-2">
                        {CRYPTO_NETWORKS.map(network => (
                          <button
                            key={network.value}
                            onClick={() => setData({ ...data, cryptoNetwork: network.value })}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition ${
                              data.cryptoNetwork === network.value
                                ? 'border-emerald-500 bg-emerald-500/10'
                                : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${network.color} flex items-center justify-center`}>
                              <span className="text-white text-sm font-bold">{network.icon}</span>
                            </div>
                            <span className={`text-sm font-medium ${data.cryptoNetwork === network.value ? 'text-white' : 'text-gray-400'}`}>{network.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Wallet Address</label>
                      <input
                        type="text"
                        value={data.walletAddress || ''}
                        onChange={(e) => setData({ ...data, walletAddress: e.target.value })}
                        placeholder="0x..."
                        className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 outline-none text-sm font-mono text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Beneficiary Name</label>
                      <input
                        type="text"
                        value={data.beneficiary}
                        onChange={(e) => setData({ ...data, beneficiary: e.target.value })}
                        placeholder="Account holder name"
                        className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 outline-none text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">IBAN</label>
                      <input
                        type="text"
                        value={data.iban}
                        onChange={(e) => setData({ ...data, iban: e.target.value })}
                        placeholder="DE89 3704 0044 0532 0130 00"
                        className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 outline-none text-sm font-mono text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">BIC / SWIFT</label>
                      <input
                        type="text"
                        value={data.bic}
                        onChange={(e) => setData({ ...data, bic: e.target.value })}
                        placeholder="COBADEFFXXX"
                        className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 outline-none text-sm font-mono text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>
                  </>
                )}

                {/* Signature Pad */}
                <div className="pt-4 border-t border-gray-700">
                  <SignaturePad
                    signature={data.signature}
                    onSignatureChange={(signature) => setData({ ...data, signature })}
                  />
                  <p className="text-xs text-gray-500 mt-2">Your signature will appear on the invoice</p>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="p-6 border-t border-gray-800">
        {(() => {
          const currentIndex = SECTIONS.findIndex(s => s.id === activeSection)
          const prevSection = currentIndex > 0 ? SECTIONS[currentIndex - 1] : null
          const nextSection = currentIndex < SECTIONS.length - 1 ? SECTIONS[currentIndex + 1] : null

          return (
            <>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => prevSection && setActiveSection(prevSection.id)}
                  disabled={!prevSection}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                    prevSection
                      ? 'text-gray-300 hover:bg-gray-800'
                      : 'text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  {prevSection ? prevSection.label : 'Back'}
                </button>
                <button
                  onClick={() => nextSection && setActiveSection(nextSection.id)}
                  disabled={!nextSection}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                    nextSection
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {nextSection ? nextSection.label : 'Done'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {SECTIONS.map((section, idx) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentIndex
                        ? 'w-6 bg-emerald-500'
                        : idx < currentIndex
                          ? 'bg-emerald-600/50'
                          : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </>
          )
        })()}
      </div>
    </motion.div>
  )
}

export const GuidedInvoiceEditor = () => {
  const navigate = useNavigate()
  const { createInvoice } = useInvoices()
  const { profiles, clients } = useProfiles()

  const [activeSection, setActiveSection] = useState('company')
  const [showPanel, setShowPanel] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Refs for smooth scrolling to sections
  const sectionRefs = useRef({})
  const scrollToSection = (sectionId) => {
    const ref = sectionRefs.current[sectionId]
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // Scroll to section when active section changes
  useEffect(() => {
    scrollToSection(activeSection)
  }, [activeSection])

  // All invoice data in one state object
  const [data, setData] = useState({
    invoiceNumber: `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-001`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    paymentTerm: 30,
    currency: 'USD',
    invoiceType: 'fixed',
    billMonthly: false,
    logo: '',
    yourName: '',
    yourAddress: '',
    yourEmail: '',
    yourTaxId: '',
    clientName: '',
    clientAddress: '',
    clientEmail: '',
    clientTaxId: '',
    lineItems: [{ ...defaultLineItem }],
    beneficiary: '',
    iban: '',
    bic: '',
    notes: '',
    paymentMethod: 'bank',
    cryptoNetwork: 'ethereum',
    walletAddress: '',
    signature: '',
  })

  // Auto-calculate due date
  useEffect(() => {
    if (data.issueDate && data.paymentTerm) {
      const issue = new Date(data.issueDate)
      issue.setDate(issue.getDate() + data.paymentTerm)
      setData(d => ({ ...d, dueDate: issue.toISOString().split('T')[0] }))
    }
  }, [data.issueDate, data.paymentTerm])

  // Load profile automatically
  useEffect(() => {
    if (profiles.length > 0 && !data.yourName) {
      handleLoadProfile(profiles[0])
    }
  }, [profiles])

  const handleLoadProfile = (profile) => {
    setData(d => ({
      ...d,
      yourName: profile.your_name || '',
      yourAddress: profile.your_address || '',
      yourEmail: profile.your_email || '',
      yourTaxId: profile.your_tax_id || '',
      beneficiary: profile.beneficiary || '',
      iban: profile.iban || '',
      bic: profile.bic || '',
    }))
  }

  const handleLoadClient = (client) => {
    setData(d => ({
      ...d,
      clientName: client.client_name || '',
      clientAddress: client.client_address || '',
      clientEmail: client.client_email || '',
      clientTaxId: client.client_tax_id || '',
    }))
  }

  const handleActivateSection = (sectionId) => {
    setActiveSection(sectionId)
    setShowPanel(true)
  }

  const handleCreate = async () => {
    setSaving(true)
    try {
      await createInvoice({
        invoice_number: data.invoiceNumber,
        issue_date: data.issueDate,
        due_date: data.dueDate,
        currency: data.currency,
        status: 'draft',
        notes: data.notes,
        your_name: data.yourName,
        your_address: data.yourAddress,
        your_email: data.yourEmail,
        your_tax_id: data.yourTaxId,
        client_name: data.clientName,
        client_address: data.clientAddress,
        client_email: data.clientEmail,
        client_tax_id: data.clientTaxId,
        line_items: data.lineItems.filter(i => i.description),
        beneficiary: data.beneficiary,
        iban: data.iban,
        bic: data.bic,
        logo: data.logo,
      })
      setShowSuccess(true)
      localStorage.setItem('onboarding_completed', 'done')
      setTimeout(() => navigate('/dashboard'), 2500)
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('Failed to create invoice')
    } finally {
      setSaving(false)
    }
  }

  const currencySymbol = CURRENCIES.find(c => c.value === data.currency)?.symbol || '$'
  const total = data.lineItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Invoice Generator</p>
              <p className="text-xs text-gray-500">Create and send invoices</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreate}
            disabled={saving || !data.yourName || !data.clientName}
            className="px-5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Create Invoice
              </>
            )}
          </motion.button>
        </div>
      </header>

      {/* Main Content - Full Page Invoice Preview */}
      <main className={`pt-16 transition-all duration-300 ${showPanel ? 'pr-[420px]' : ''}`}>
        <div className="max-w-3xl mx-auto py-12 px-6">
          {/* Invoice Document */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Invoice Header */}
            <div className="p-8 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">INVOICE NUMBER</p>
                  <div className="h-6 w-28 bg-emerald-100 rounded flex items-center justify-center">
                    <span className="text-xs text-emerald-600 font-medium">{data.invoiceNumber}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {data.logo ? (
                    <img src={data.logo} alt="Logo" className="h-12 w-auto" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">DUE DATE</p>
                    <div className="h-5 w-24 bg-emerald-100 rounded mt-1 flex items-center justify-center">
                      <span className="text-xs text-emerald-600 font-medium">
                        {data.dueDate ? new Date(data.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* From / To Sections */}
            <div className="p-8 grid grid-cols-2 gap-8">
              {/* FROM Section */}
              <SectionWrapper
                section={SECTIONS[0]}
                isActive={activeSection === 'company'}
                onActivate={handleActivateSection}
                className="p-4"
                sectionRef={el => sectionRefs.current['company'] = el}
              >
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">FROM</p>
                <p className="font-semibold text-gray-900">{data.yourName || 'Your Company'}</p>
                {data.yourAddress && (
                  <p className="text-sm text-gray-500 mt-1 whitespace-pre-line">{data.yourAddress}</p>
                )}
                {data.yourEmail && (
                  <p className="text-sm text-gray-500 mt-1">{data.yourEmail}</p>
                )}
              </SectionWrapper>

              {/* TO Section */}
              <SectionWrapper
                section={SECTIONS[1]}
                isActive={activeSection === 'client'}
                onActivate={handleActivateSection}
                className="p-4"
                badgePosition="right"
                sectionRef={el => sectionRefs.current['client'] = el}
              >
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">TO</p>
                <p className="font-semibold text-gray-900">{data.clientName || 'Client Name'}</p>
                {data.clientAddress && (
                  <p className="text-sm text-gray-500 mt-1 whitespace-pre-line">{data.clientAddress}</p>
                )}
                {data.clientEmail && (
                  <p className="text-sm text-gray-500 mt-1">{data.clientEmail}</p>
                )}
              </SectionWrapper>
            </div>

            {/* Invoice Details Section */}
            <SectionWrapper
              section={SECTIONS[2]}
              isActive={activeSection === 'details'}
              onActivate={handleActivateSection}
              className="mx-8 mb-8 p-4"
              sectionRef={el => sectionRefs.current['details'] = el}
            >
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">INVOICE DETAILS</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <p className="text-xs text-gray-400 uppercase">START DATE</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {data.issueDate ? new Date(data.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <p className="text-xs text-gray-400 uppercase">TERM</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {PAYMENT_TERMS.find(t => t.value === data.paymentTerm)?.label || '-'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <p className="text-xs text-gray-400 uppercase">BILLED IN</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{data.currency}</p>
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 uppercase tracking-wider px-4 py-3 bg-gray-50 rounded-t-lg border border-gray-100">
                    <span className="col-span-6">DESCRIPTION</span>
                    <span className="col-span-2 text-right">QTY</span>
                    <span className="col-span-2 text-right">RATE</span>
                    <span className="col-span-2 text-right">AMOUNT</span>
                  </div>
                  <div className="border-x border-b border-gray-100 rounded-b-lg divide-y divide-gray-100">
                    {data.lineItems.filter(i => i.description).length > 0 ? (
                      data.lineItems.filter(i => i.description).map((item, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 items-center text-sm px-4 py-3">
                          <span className="col-span-6 font-medium text-gray-900">{item.description}</span>
                          <span className="col-span-2 text-right text-gray-500">{item.quantity}</span>
                          <span className="col-span-2 text-right text-gray-500">{currencySymbol}{item.price}</span>
                          <span className="col-span-2 text-right font-semibold text-gray-900">
                            {currencySymbol}{(item.quantity * item.price).toFixed(2)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm text-gray-400">No items added yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-gray-900">{currencySymbol}{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Discount</span>
                      <span className="text-gray-400">None</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                      <span className="text-gray-900">Total</span>
                      <span className="text-emerald-600">{currencySymbol}{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </SectionWrapper>

            {/* Payment Section */}
            <SectionWrapper
              section={SECTIONS[3]}
              isActive={activeSection === 'payment'}
              onActivate={handleActivateSection}
              className="mx-8 mb-8 p-4"
              sectionRef={el => sectionRefs.current['payment'] = el}
            >
              <div className="flex gap-6">
                <div className="flex-1">
                  {(data.beneficiary || data.iban || data.walletAddress) ? (
                    <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                      <p className="text-xs font-semibold text-emerald-700 uppercase mb-3">Payment Details</p>
                      <div className="text-sm text-emerald-600/80 space-y-1">
                        {data.paymentMethod === 'crypto' ? (
                          <>
                            <p><span className="text-emerald-400">Network:</span> {CRYPTO_NETWORKS.find(n => n.value === data.cryptoNetwork)?.label}</p>
                            <p className="font-mono text-xs"><span className="text-emerald-400">Address:</span> {data.walletAddress}</p>
                          </>
                        ) : (
                          <>
                            {data.beneficiary && <p><span className="text-emerald-400">Beneficiary:</span> {data.beneficiary}</p>}
                            {data.iban && <p className="font-mono"><span className="text-emerald-400">IBAN:</span> {data.iban}</p>}
                            {data.bic && <p className="font-mono"><span className="text-emerald-400">BIC:</span> {data.bic}</p>}
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 border-dashed">
                      <p className="text-sm text-gray-400 text-center">Click to add payment details</p>
                    </div>
                  )}
                </div>

                {/* Signature Display */}
                {data.signature && (
                  <div className="w-40">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Authorized Signature</p>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <img src={data.signature} alt="Signature" className="w-full h-12 object-contain" />
                    </div>
                    {data.yourName && (
                      <p className="text-xs text-gray-500 mt-1 text-center">{data.yourName}</p>
                    )}
                  </div>
                )}
              </div>
            </SectionWrapper>
          </div>
        </div>
      </main>

      {/* Side Panel */}
      <AnimatePresence>
        {showPanel && (
          <SidePanel
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            data={data}
            setData={setData}
            profiles={profiles}
            clients={clients}
            onLoadProfile={handleLoadProfile}
            onLoadClient={handleLoadClient}
            currencySymbol={currencySymbol}
            onClose={() => setShowPanel(false)}
          />
        )}
      </AnimatePresence>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30"
              >
                <Check className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Invoice Created!</h2>
              <p className="text-gray-500 mb-6">
                Your invoice for <span className="font-medium text-gray-900">{currencySymbol}{total.toFixed(2)}</span> is ready.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                Redirecting to dashboard...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GuidedInvoiceEditor
