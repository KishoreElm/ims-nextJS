"use client";

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Available Stock</h1>
        <div className="bg-white shadow rounded-lg p-6">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="min-w-full dividie-y border divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Stock</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-x divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2  whitespace-nowrap text-sm text-gray-00">{item.name}</td>
                    <td className="px-4 py-2  whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                    <td className="px-4 py-2  whitespace-nowrap text-sm text-gray-900">{item.availableStock }</td>
                    <td className="px-4 py-2  whitespace-nowrap text-sm text-gray-900">{item.unitType}</td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
