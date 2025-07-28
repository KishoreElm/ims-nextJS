'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { Plus, Package, User, AlertCircle } from 'lucide-react'
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

  const [formData, setFormData] = useState({
    itemId: '',
    userId: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0]
  })

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
          ...formData,
          quantity: parseFloat(formData.quantity)
        })
      })
      
      if (response.ok) {
        toast.success('Item issued successfully')
        setShowAddModal(false)
        resetForm()
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to issue item')
      }
    } catch (error) {
      console.error('Error issuing item:', error)
      toast.error('Failed to issue item')
    }
  }

  const resetForm = () => {
    setFormData({
      itemId: '',
      userId: '',
      quantity: '',
      date: new Date().toISOString().split('T')[0]
    })
  }

  const getSelectedItem = () => {
    return items.find(item => item.id === formData.itemId)
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
        ) : (
          <div className="space-y-6">
            {/* Issue History */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Recent Issues
                </h3>
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Issued To
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {issueHistory.map((issue) => (
                        <tr key={issue.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {issue.item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {issue.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {issue.item.unitType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {issue.user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(issue.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Issue Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Issue Item
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Item
                  </label>
                  <select
                    required
                    className="input-field mt-1"
                    value={formData.itemId}
                    onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                  >
                    <option value="">Select an item</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} (Available: {item.availableStock} {item.unitType})
                      </option>
                    ))}
                  </select>
                </div>
                
                {getSelectedItem() && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                      <div className="ml-3">
                        <p className="text-sm text-yellow-800">
                          Available: {getSelectedItem()?.availableStock} {getSelectedItem()?.unitType}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Issue To
                  </label>
                  <select
                    required
                    className="input-field mt-1"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="input-field mt-1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    required
                    className="input-field mt-1"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      resetForm()
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Issue Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 