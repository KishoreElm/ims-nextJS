'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { Plus, Package, User, AlertCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Item {
  id: string
  name: string
  unitType: 'PCS' | 'M' | 'L' | 'KG'
  availableStock: number
}

interface User {
  id: string
  name: string
  email: string
  isApproved: boolean
}

interface IssueItem {
  id: string
  quantity: number
  date: string
  ticket?: string
  issuedBy?: string
  issuedTo?: string
  serialNumber?: string
  description: string
  item: {
    name: string
    unitType: string
  }
  user: {
    name: string
  }
}

export default function IssueStock() {
  const { user } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [issueHistory, setIssueHistory] = useState<IssueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  // Add new form state for multiple items and ticket
  const [ticket, setTicket] = useState("")
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [issuedBy, setIssuedBy] = useState(user?.name || "")
  const [issuedTo, setIssuedTo] = useState("")
  const [issueItems, setIssueItems] = useState([
    { itemId: '', quantity: '', serialNumber: '', description: '' }
  ])

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [user, router])

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch items
      const itemsResponse = await fetch('/api/admin/items', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json()
        setItems(itemsData)
      }

      // Fetch approved users
      const usersResponse = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        const approvedUsers = usersData.filter((u: User) => u.isApproved)
        setUsers(approvedUsers)
      }

      // Fetch issue history
      const historyResponse = await fetch('/api/admin/issue-history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        setIssueHistory(historyData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  // Add/Remove item handlers
  const handleAddIssueItem = () => {
    setIssueItems(prev => [...prev, { itemId: '', quantity: '', serialNumber: '', description: '' }])
  }
  const handleRemoveIssueItem = (idx: number) => {
    setIssueItems(prev => prev.filter((_, i) => i !== idx))
  }
  const handleIssueItemChange = (idx: number, field: string, value: string) => {
    setIssueItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  // Update handleSubmit for multiple items
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/issue', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ticket,
          date: issueDate,
          issuedBy,
          issuedTo,
          items: issueItems.map(item => ({
            ...item,
            quantity: parseFloat(item.quantity)
          }))
        })
      })
      
      if (response.ok) {
        toast.success('Items issued successfully')
        setShowAddModal(false)
        setTicket("")
        setIssueDate(new Date().toISOString().split('T')[0])
        setIssuedBy(user?.name || "")
        setIssuedTo("")
        setIssueItems([{ itemId: '', quantity: '', serialNumber: '', description: '' }])
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to issue items')
      }
    } catch (error) {
      console.error('Error issuing items:', error)
      toast.error('Failed to issue items')
    }
  }

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Issue Stock
              </h1>
              <p className="text-gray-600">Issue items to users</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Issue Item
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : null}
      </main>

      {/* Issue Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[900px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Issue Items
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ticket
                    </label>
                    <input
                      type="text"
                      className="input-field mt-1 w-full"
                      value={ticket}
                      onChange={e => setTicket(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      className="input-field mt-1 w-full"
                      value={issueDate}
                      onChange={e => setIssueDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Issued By
                    </label>
                    <input
                      type="text"
                      className="input-field mt-1 w-full"
                      value={user?.name || ''}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Issued To
                    </label>
                    <select
                      className="input-field mt-1 w-full"
                      value={issuedTo}
                      onChange={e => setIssuedTo(e.target.value)}
                      required
                    >
                      <option value="">Select a user</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {issueItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end border-b pb-2 mb-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Item
                      </label>
                      <select
                        className="input-field mt-1 w-full"
                        value={item.itemId}
                        onChange={e => handleIssueItemChange(idx, 'itemId', e.target.value)}
                        required
                      >
                        <option value="">Select an item</option>
                        {items.map(itm => (
                          <option key={itm.id} value={itm.id}>
                            {itm.name} (Available: {itm.availableStock} {itm.unitType})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Quantity
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="input-field mt-1 w-full"
                        value={item.quantity}
                        onChange={e => handleIssueItemChange(idx, 'quantity', e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Serial Number
                      </label>
                      <input
                        type="text"
                        className="input-field mt-1 w-full"
                        value={item.serialNumber}
                        onChange={e => handleIssueItemChange(idx, 'serialNumber', e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <input
                        type="text"
                        className="input-field mt-1 w-full"
                        value={item.description}
                        onChange={e => handleIssueItemChange(idx, 'description', e.target.value)}
                      />
                    </div>
                    {issueItems.length > 1 && (
                      <button
                        type="button"
                        className="ml-2 mb-2 text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveIssueItem(idx)}
                        title="Remove item"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-secondary flex items-center"
                  onClick={handleAddIssueItem}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Item
                </button>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setTicket(""); setIssueDate(new Date().toISOString().split('T')[0]); setIssuedBy(user?.name || ""); setIssuedTo(""); setIssueItems([{ itemId: '', quantity: '', serialNumber: '', description: '' }]); }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Issue Items
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Recent Issues Table */}
      <div className="bg-white shadow rounded-lg mt-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Issued Items
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serial Number
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issued By
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issued To
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {issueHistory.map((issue, idx) => (
                  <tr key={issue.id + '-' + idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {issue.ticket || '-'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {new Date(issue.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {issue.item?.name || '-'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {issue.quantity}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {issue.serialNumber || '-'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {issue.issuedBy || '-'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {issue.user.name || '-'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {issue.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}