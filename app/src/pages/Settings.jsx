import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfiles } from '../hooks/useProfiles'
import { useAuth } from '../hooks/useAuth'
import { isSupabaseConfigured } from '../lib/supabase'
import { Layout } from '../components/Layout'
import { Button, Input, TextArea } from '../components/ui'
import {
  Trash2,
  User,
  Building,
  CreditCard,
  Mail,
  LogOut,
  Shield,
  Bell,
  Palette,
  FileText,
  Settings as SettingsIcon,
  Hash,
} from 'lucide-react'

const INVOICE_NUMBER_FORMATS = [
  { value: 'INV-{YYYYMMDD}-{SEQ}', label: 'INV-20260201-001', description: 'INV + date + sequence' },
  { value: 'INV-{YYYY}-{SEQ}', label: 'INV-2026-001', description: 'INV + year + sequence' },
  { value: '{YYYY}{MM}{SEQ}', label: '202602001', description: 'Year + month + sequence' },
  { value: 'INV{SEQ}', label: 'INV001', description: 'INV + sequence' },
  { value: '{PREFIX}-{SEQ}', label: 'Custom prefix + sequence', description: 'Custom prefix' },
]

const SettingsSection = ({ title, description, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700 mb-4">
    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
      <h3 className="text-base font-medium text-gray-900 dark:text-white">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
    </div>
    <div className="p-5">{children}</div>
  </div>
)

export const Settings = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const {
    profiles,
    clients,
    lineItems,
    deleteProfile,
    deleteClient,
    deleteLineItem,
  } = useProfiles()

  const [activeTab, setActiveTab] = useState('account')
  const [invoiceFormat, setInvoiceFormat] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('invoice_number_format') || 'INV-{YYYYMMDD}-{SEQ}'
    }
    return 'INV-{YYYYMMDD}-{SEQ}'
  })
  const [customPrefix, setCustomPrefix] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('invoice_custom_prefix') || 'INV'
    }
    return 'INV'
  })
  const [startingNumber, setStartingNumber] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('invoice_starting_number') || '1'
    }
    return '1'
  })

  // Custom branding settings
  const [customBranding, setCustomBranding] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('custom_branding')
      return saved ? JSON.parse(saved) : {
        enabled: false,
        accentColor: '#1a1a1a',
        tableHeaderBg: '#1a1a1a',
        tableHeaderText: '#ffffff',
        paymentBorder: '#1a1a1a',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }
    }
    return {
      enabled: false,
      accentColor: '#1a1a1a',
      tableHeaderBg: '#1a1a1a',
      tableHeaderText: '#ffffff',
      paymentBorder: '#1a1a1a',
      fontFamily: 'Arial, Helvetica, sans-serif',
    }
  })

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleSaveInvoiceSettings = () => {
    localStorage.setItem('invoice_number_format', invoiceFormat)
    localStorage.setItem('invoice_custom_prefix', customPrefix)
    localStorage.setItem('invoice_starting_number', startingNumber)
    alert('Invoice settings saved!')
  }

  const handleSaveBranding = () => {
    localStorage.setItem('custom_branding', JSON.stringify(customBranding))
    alert('Branding settings saved!')
  }

  const updateBranding = (key, value) => {
    setCustomBranding(prev => ({ ...prev, [key]: value }))
  }

  const FONT_OPTIONS = [
    { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
    { value: 'Georgia, "Times New Roman", serif', label: 'Georgia (Serif)' },
    { value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', label: 'System Default' },
    { value: '"Helvetica Neue", Helvetica, Arial, sans-serif', label: 'Helvetica Neue' },
    { value: '"Inter", -apple-system, sans-serif', label: 'Inter' },
    { value: '"Courier New", Courier, monospace', label: 'Courier (Monospace)' },
  ]

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'invoicing', label: 'Invoicing', icon: Hash },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'profiles', label: 'Profiles', icon: Building },
    { id: 'clients', label: 'Clients', icon: User },
    { id: 'items', label: 'Line Items', icon: FileText },
  ]

  return (
    <Layout>
      <div className="p-8">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
          </div>

          <div className="flex gap-6">
            {/* Sidebar */}
            <div className="w-48 flex-shrink-0">
              <nav className="space-y-1">
                {tabs.map(tab => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
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
              {activeTab === 'account' && (
                <>
                  <SettingsSection title="Account Information" description="Your account details">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold text-xl">
                          {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user?.email?.split('@')[0] || 'Demo User'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || 'demo@example.com'}</p>
                        </div>
                      </div>

                      {!isSupabaseConfigured() && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <p className="text-sm text-amber-800">
                            Running in demo mode. Data is stored locally in your browser.
                          </p>
                        </div>
                      )}
                    </div>
                  </SettingsSection>

                  <SettingsSection title="Sign Out" description="Sign out of your account">
                    <Button variant="secondary" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </SettingsSection>
                </>
              )}

              {activeTab === 'invoicing' && (
                <>
                  <SettingsSection
                    title="Invoice Number Format"
                    description="Choose how your invoice numbers are generated"
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        {INVOICE_NUMBER_FORMATS.map((format) => (
                          <label
                            key={format.value}
                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                              invoiceFormat === format.value
                                ? 'border-gray-900 dark:border-gray-100 bg-gray-50 dark:bg-gray-700'
                                : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="invoiceFormat"
                                value={format.value}
                                checked={invoiceFormat === format.value}
                                onChange={(e) => setInvoiceFormat(e.target.value)}
                                className="w-4 h-4 text-gray-900 dark:text-gray-100"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{format.label}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{format.description}</p>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>

                      {invoiceFormat === '{PREFIX}-{SEQ}' && (
                        <Input
                          label="Custom Prefix"
                          value={customPrefix}
                          onChange={(e) => setCustomPrefix(e.target.value)}
                          placeholder="e.g., INV, BILL, ORDER"
                        />
                      )}

                      <Input
                        label="Starting Number"
                        type="number"
                        value={startingNumber}
                        onChange={(e) => setStartingNumber(e.target.value)}
                        min="1"
                      />

                      <div className="pt-2">
                        <Button variant="dark" onClick={handleSaveInvoiceSettings}>
                          Save Settings
                        </Button>
                      </div>
                    </div>
                  </SettingsSection>

                  <SettingsSection
                    title="Default Settings"
                    description="Default values for new invoices"
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Default currency and payment terms are set per profile. Edit your profiles to change these.
                    </p>
                  </SettingsSection>
                </>
              )}

              {activeTab === 'branding' && (
                <>
                  <SettingsSection
                    title="Custom Branding"
                    description="Customize the colors and fonts of your invoices"
                  >
                    <div className="space-y-6">
                      {/* Enable custom branding */}
                      <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Enable Custom Branding</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Override template colors with your custom brand colors
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={customBranding.enabled}
                          onChange={(e) => updateBranding('enabled', e.target.checked)}
                          className="w-5 h-5 text-gray-900 rounded"
                        />
                      </label>

                      {customBranding.enabled && (
                        <>
                          {/* Color Settings */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Brand Colors</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">
                                  Accent Color
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={customBranding.accentColor}
                                    onChange={(e) => updateBranding('accentColor', e.target.value)}
                                    className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                                  />
                                  <Input
                                    value={customBranding.accentColor}
                                    onChange={(e) => updateBranding('accentColor', e.target.value)}
                                    className="flex-1"
                                    placeholder="#1a1a1a"
                                  />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Used for headings and borders</p>
                              </div>

                              <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">
                                  Table Header Background
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={customBranding.tableHeaderBg}
                                    onChange={(e) => updateBranding('tableHeaderBg', e.target.value)}
                                    className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                                  />
                                  <Input
                                    value={customBranding.tableHeaderBg}
                                    onChange={(e) => updateBranding('tableHeaderBg', e.target.value)}
                                    className="flex-1"
                                    placeholder="#1a1a1a"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">
                                  Table Header Text
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={customBranding.tableHeaderText}
                                    onChange={(e) => updateBranding('tableHeaderText', e.target.value)}
                                    className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                                  />
                                  <Input
                                    value={customBranding.tableHeaderText}
                                    onChange={(e) => updateBranding('tableHeaderText', e.target.value)}
                                    className="flex-1"
                                    placeholder="#ffffff"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">
                                  Payment Section Border
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={customBranding.paymentBorder}
                                    onChange={(e) => updateBranding('paymentBorder', e.target.value)}
                                    className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                                  />
                                  <Input
                                    value={customBranding.paymentBorder}
                                    onChange={(e) => updateBranding('paymentBorder', e.target.value)}
                                    className="flex-1"
                                    placeholder="#1a1a1a"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Font Settings */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Typography</h4>
                            <div>
                              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">
                                Font Family
                              </label>
                              <select
                                value={customBranding.fontFamily}
                                onChange={(e) => updateBranding('fontFamily', e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                              >
                                {FONT_OPTIONS.map(font => (
                                  <option key={font.value} value={font.value}>
                                    {font.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Preview */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Preview</h4>
                            <div
                              className="p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                              style={{ fontFamily: customBranding.fontFamily }}
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div
                                  className="w-8 h-8 rounded"
                                  style={{ backgroundColor: customBranding.accentColor }}
                                />
                                <span
                                  className="text-lg font-semibold"
                                  style={{ color: customBranding.accentColor }}
                                >
                                  Invoice #INV-001
                                </span>
                              </div>
                              <div
                                className="text-xs py-2 px-3 rounded mb-2"
                                style={{
                                  backgroundColor: customBranding.tableHeaderBg,
                                  color: customBranding.tableHeaderText,
                                }}
                              >
                                Description | Qty | Price | Total
                              </div>
                              <div
                                className="h-1 rounded mb-2"
                                style={{ backgroundColor: customBranding.paymentBorder }}
                              />
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Sample text in your selected font
                              </p>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="pt-2">
                        <Button variant="dark" onClick={handleSaveBranding}>
                          Save Branding Settings
                        </Button>
                      </div>
                    </div>
                  </SettingsSection>
                </>
              )}

              {activeTab === 'profiles' && (
                <SettingsSection
                  title="Saved Profiles"
                  description="Your saved business profiles for invoices"
                >
                  {profiles.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Building className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No saved profiles yet. Create one while editing an invoice.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {profiles.map((profile) => (
                        <div
                          key={profile.id}
                          className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg group"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {profile.your_name || profile.yourName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                              {profile.your_email || profile.yourEmail || 'No email'}
                            </p>
                            {profile.iban && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                IBAN: {profile.iban}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => deleteProfile(profile.id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md opacity-0 group-hover:opacity-100 transition"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </SettingsSection>
              )}

              {activeTab === 'clients' && (
                <SettingsSection
                  title="Saved Clients"
                  description="Clients you've saved for quick access"
                >
                  {clients.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No saved clients yet. Save a client while editing an invoice.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {clients.map((client) => (
                        <div
                          key={client.id}
                          className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg group"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {client.client_name || client.clientName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                              {client.client_email || client.clientEmail || 'No email'}
                            </p>
                            {(client.client_tax_id || client.clientTaxId) && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Tax ID: {client.client_tax_id || client.clientTaxId}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => deleteClient(client.id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md opacity-0 group-hover:opacity-100 transition"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </SettingsSection>
              )}

              {activeTab === 'items' && (
                <SettingsSection
                  title="Saved Line Items"
                  description="Reusable line items for your invoices"
                >
                  {lineItems.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No saved line items yet. Save one while editing an invoice.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lineItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg group"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.description}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                              {item.quantity} x {(item.price || 0).toFixed(2)} (VAT {item.vat}%)
                            </p>
                            {item.comment && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{item.comment}</p>
                            )}
                          </div>
                          <button
                            onClick={() => deleteLineItem(item.id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md opacity-0 group-hover:opacity-100 transition"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </SettingsSection>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
