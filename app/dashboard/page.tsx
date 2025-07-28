'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogOut, Package, Calendar, User } from 'lucide-react'
import MonthlyPurchases from '@/components/MonthlyPurchases'

interface IssuedItem {
  id: string
  quantity: number
  date: string
  item: {
    name: string
    unitType: string
    description?: string
  }
}

export default function UserDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [issuedItems, setIssuedItems] = useState<IssuedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      router.push('/admin/dashboard')
    }
  }, [user, router])

  useEffect(() => {
    if (user) {
      fetchIssuedItems()
    }
  }, [user])

  const fetchIssuedItems = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/issued-items', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setIssuedItems(data)
      }
    } catch (error) {
      console.error('Error fetching issued items:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role === 'ADMIN') {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                User Dashboard
              </h1>
              <p className="text-gray-600">Welcome back, {user.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Items Issued to You
            </h3>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : issuedItems.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No items issued</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You haven't been issued any items yet.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Issue Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {issuedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.item.name}
                            </div>
                            {item.item.description && (
                              <div className="text-sm text-gray-500">
                                {item.item.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.item.unitType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Purchase Data */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Monthly Purchase Analytics</h2>
          <MonthlyPurchases />
        </div>
      </main>
    </div>
  )
} 