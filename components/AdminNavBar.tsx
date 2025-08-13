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

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '🏠' },
  { label: 'Issue', href: '/admin/issue', icon: '🚚' },
  { label: 'Items', href: '/admin/items', icon: '📦' },
  { label: 'Purchases', href: '/admin/purchases', icon: '🛒' },
  { label: 'Reports', href: '/admin/reports', icon: '📊' },
  { label: 'Users', href: '/admin/users', icon: '👥' },
  { label: 'Available Stock', href: '/admin/available-stock', icon: '📈' },
]

export default function AdminNavBar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={`sticky pt-10 top-0 left-0 bg-gray-700 text-white max-h-screen ${
        collapsed ? 'w-20' : 'w-64'
      } transition-all duration-300`}
    >
      <div className="p-4 flex justify-between items-center">
        {!collapsed && <span className="text-xl font-bold">Admin Panel</span>}
        <button className="text-xl" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '➡️' : '⬅️'}
        </button>
      </div>
      <nav>
        <ul>
          {navItems.map(item => (
            <li key={item.href} className="p-4 hover:bg-gray-700">
              <Link href={item.href}>
                <div className="flex items-center cursor-pointer">
                  <span className="text-xl">{item.icon}</span>
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