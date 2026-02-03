import { useState } from 'react'
import { useProfiles } from '../hooks/useProfiles'
import { Layout } from '../components/Layout'
import { Button, Input, TextArea } from '../components/ui'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Mail,
  MapPin,
  X,
  Building,
} from 'lucide-react'

export const Clients = () => {
  const { clients, saveClient, updateClient, deleteClient, loading } = useProfiles()
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_address: '',
    client_tax_id: '',
  })

  const filteredClients = clients.filter(client => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      (client.client_name || '').toLowerCase().includes(query) ||
      (client.client_email || '').toLowerCase().includes(query)
    )
  })

  const openModal = (client = null) => {
    if (client) {
      setEditingClient(client)
      setFormData({
        client_name: client.client_name || '',
        client_email: client.client_email || '',
        client_address: client.client_address || '',
        client_tax_id: client.client_tax_id || '',
      })
    } else {
      setEditingClient(null)
      setFormData({
        client_name: '',
        client_email: '',
        client_address: '',
        client_tax_id: '',
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingClient(null)
    setFormData({
      client_name: '',
      client_email: '',
      client_address: '',
      client_tax_id: '',
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.client_name.trim()) return

    setSaving(true)
    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData)
      } else {
        await saveClient(formData)
      }
      closeModal()
    } catch (error) {
      console.error('Error saving client:', error)
      alert('Failed to save client')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this client?')) return
    try {
      await deleteClient(id)
    } catch (error) {
      console.error('Error deleting client:', error)
    }
  }

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Clients</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your client contacts</p>
          </div>
          <Button variant="dark" onClick={() => openModal()}>
            <Plus className="w-4 h-4" />
            Add Client
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200/60 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clients</p>
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Users className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{clients.length}</p>
          </div>
        </div>

        {/* Client List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700">
          {/* Search */}
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition"
              />
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-gray-200 dark:border-gray-600 border-t-gray-900 dark:border-t-gray-100 rounded-full mx-auto" />
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">Loading...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                {searchQuery ? 'No matching clients' : 'No clients yet'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-xs mx-auto">
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Add your first client to get started'}
              </p>
              {!searchQuery && (
                <Button variant="dark" onClick={() => openModal()}>
                  <Plus className="w-4 h-4" />
                  Add Client
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-700">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="p-5 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <Building className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {client.client_name}
                        </h3>
                        {client.client_email && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <Mail className="w-3.5 h-3.5" />
                            {client.client_email}
                          </div>
                        )}
                        {client.client_address && (
                          <div className="flex items-start gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">{client.client_address.split('\n')[0]}</span>
                          </div>
                        )}
                        {client.client_tax_id && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Tax ID: {client.client_tax_id}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openModal(client)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingClient ? 'Edit Client' : 'Add Client'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <Input
                label="Name / Company"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                required
                autoFocus
              />
              <Input
                label="Email"
                type="email"
                value={formData.client_email}
                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
              />
              <TextArea
                label="Address"
                value={formData.client_address}
                onChange={(e) => setFormData({ ...formData, client_address: e.target.value })}
                rows={3}
              />
              <Input
                label="Tax ID / VAT"
                value={formData.client_tax_id}
                onChange={(e) => setFormData({ ...formData, client_tax_id: e.target.value })}
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="dark"
                  loading={saving}
                  className="flex-1"
                >
                  {editingClient ? 'Save Changes' : 'Add Client'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
