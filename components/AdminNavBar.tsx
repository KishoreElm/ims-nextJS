// 'use client'

// import Link from 'next/link'
// import { useState } from 'react'

// const navItems = [
//   { label: 'Dashboard', href: '/admin/dashboard', icon: '🏠' },
//   { label: 'Issue', href: '/admin/issue', icon: '🚚' },
//   { label: 'Items', href: '/admin/items', icon: '📦' },
//   { label: 'Purchases', href: '/admin/purchases', icon: '🛒' },
//   { label: 'Reports', href: '/admin/reports', icon: '📊' },
//   { label: 'Users', href: '/admin/users', icon: '👥' },
//   { label: 'Available Stock', href: '/admin/available-stock', icon: '📈' },
// ]

// export default function AdminNavBar() {
//   const [collapsed, setCollapsed] = useState(false)

//   return (
//     <div className={`bg-gray-800 text-white min-h-screen ${collapsed ? 'w-20' : 'w-64'} transition-all duration-300`}>
//       <div className="p-4 flex justify-between items-center">
//         {!collapsed && <span className="text-lg font-bold">Admin Panel</span>}
//         <button onClick={() => setCollapsed(!collapsed)}>
//           {collapsed ? '➡️' : '⬅️'}
//         </button>
//       </div>
//       <nav>
//         <ul>
//           {navItems.map(item => (
//             <li key={item.href} className="p-4 hover:bg-gray-700">
//               <Link href={item.href}>
//                 <div className="flex items-center cursor-pointer">
//                   <span className="text-xl">{item.icon}</span>
//                   {!collapsed && <span className="ml-4">{item.label}</span>}
//                 </div>
//               </Link>
//             </li>
//           ))}
//         </ul>
//       </nav>
//     </div>
//   )
// }


'use client'

import Link from 'next/link'
import { useState } from 'react'
import { 
  Users, 
  Package, 
  ShoppingCart, 
  FileText, 
  TrendingUp,
  Home,
  Truck,
  ArrowBigLeft,
  ArrowBigRight
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: Home ,color:'text-blue-500'},
  { label: 'Users', href: '/admin/users', icon: Users ,color:'text-yellow-500'},
  { label: 'Items', href: '/admin/items', icon: Package ,color:'text-red-500'},
  { label: 'Purchases', href: '/admin/purchases', icon: ShoppingCart ,color:'text-purple-500'},
  { label: 'Issue', href: '/admin/issue', icon: Truck ,color:'text-green-500'},
  { label: 'Available Stock', href: '/admin/available-stock', icon: TrendingUp ,color:'text-indigo-500'},
  { label: 'Reports', href: '/admin/reports', icon:  FileText ,color:'text-pink-500'},
]

export default function AdminNavBar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={`sticky top-0 left-0 pt-10  bg-[#17313E] text-white max-h-screen ${
        collapsed ? 'w-15' : 'w-64'
      } transition-all duration-300`}
    >
      <div className="p-4 flex justify-between items-center">
        {!collapsed && <span className="text-xl font-bold">Admin Panel</span>}
        <button className="text-xl bg-blue-500 rounded-[20px] p-3" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ArrowBigLeft /> : <ArrowBigRight />}
        </button>
      </div>
      <nav>
        <ul>
          {navItems.map(item => (
            <li key={item.href} className="p-2 ">
              <Link href={item.href}>
                <div className="flex  p-3  border border-[#415E72] rounded-full bg-transparent shadow-sm hover:bg-[#415E72]">
                  <span className="text-xl pl-2 ">
                    {typeof item.icon === 'string' ? item.icon : <item.icon />}
                  </span>
                  {!collapsed && <span className="ml-4">{item.label}</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}