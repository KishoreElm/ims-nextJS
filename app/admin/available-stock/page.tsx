"use client";

import AdminNavBar from "@/components/AdminNavBar";
import { useEffect, useState } from "react";

interface Item {
  id: string;
  name: string;
  unitType: "PCS" | "M" | "L" | "KG";
  availableStock: number;
  category: string;
}

export default function AvailableStockPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/admin/items", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNavBar />
      <div className=" min-h-screen bg-gray-50 flex-1">
        {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Available Stock
              </h1>
              <p className="text-gray-600">View and manage available stock for items</p>
            </div>
          </div>
        </div>
      </header>

        {/* Main content */}
        <main className="bg-white shadow rounded-lg p-6 mt-6 mx-4 sm:mx-6 lg:mx-8">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="min-w-full dividie-y border divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available Stock
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-x divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2  whitespace-nowrap text-sm text-gray-00">
                      {item.name}
                    </td>
                    <td className="px-4 py-2  whitespace-nowrap text-sm text-gray-900">
                      {item.category}
                    </td>
                    <td className="px-4 py-2  whitespace-nowrap text-sm text-gray-900">
                      {item.availableStock}
                    </td>
                    <td className="px-4 py-2  whitespace-nowrap text-sm text-gray-900">
                      {item.unitType}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
      </div>
    </div>
  );
}
