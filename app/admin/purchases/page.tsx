"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { Plus, Package, Calendar, X } from "lucide-react";
import toast from "react-hot-toast";

interface Item {
  id: string;
  name: string;
  unitType: "PCS" | "M" | "L" | "KG";
}

interface Purchase {
  id: string;
  quantity: number;
  unitType: "PCS" | "M" | "L" | "KG";
  amount: number;
  date: string;
  item: {
    name: string;
  };
  user: {
    name: string;
  };
}

interface PurchaseItemForm {
  itemId: string;
  quantity: string;
  unitType: "PCS" | "M" | "L" | "KG";
  amount: string;
  taxRate: number;
  serialNumber?: string;
}

export default function PurchaseEntry() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  // Multiple items per purchase
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItemForm[]>([
    {
      itemId: "",
      quantity: "",
      unitType: "PCS",
      amount: "",
      taxRate: 18,
      serialNumber: "",
    },
  ]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [vendor, setVendor] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      // Fetch items
      const itemsResponse = await fetch("/api/admin/items", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        setItems(itemsData);
      }
      // Fetch purchases
      const purchasesResponse = await fetch("/api/admin/purchases", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (purchasesResponse.ok) {
        const purchasesData = await purchasesResponse.json();
        setPurchases(purchasesData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof PurchaseItemForm,
    value: string
  ) => {
    setPurchaseItems((prev) => {
      const updated = [...prev];
      if (field === "itemId") {
        const selectedItem = items.find((item) => item.id === value);
        updated[index] = {
          ...updated[index],
          itemId: value,
          unitType: selectedItem?.unitType || "PCS",
        };
      } else if (field === "taxRate") {
        updated[index] = {
          ...updated[index],
          taxRate: Number(value),
        };
      } else {
        updated[index] = {
          ...updated[index],
          [field]: value,
        };
      }
      return updated;
    });
  };

  const handleAddItem = () => {
    setPurchaseItems((prev) => [
      ...prev,
      {
        itemId: "",
        quantity: "",
        unitType: "PCS",
        amount: "",
        taxRate: 18,
        serialNumber: "",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setPurchaseItems((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setPurchaseItems([
      {
        itemId: "",
        quantity: "",
        unitType: "PCS",
        amount: "",
        taxRate: 18,
        serialNumber: "",
      },
    ]);
    setDate(new Date().toISOString().split("T")[0]);
    setVendor("");
    setBillNumber("");
    setPoNumber("");
    setTicketNumber("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/purchases", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: purchaseItems.map((item) => ({
            ...item,
            quantity: parseFloat(item.quantity),
            amount: parseFloat(item.amount),
            taxRate: item.taxRate,
            serialNumber: item.serialNumber,
          })),
          date,
          vendor,
          billNumber,
          poNumber,
          ticketNumber,
        }),
      });
      if (response.ok) {
        toast.success("Purchase recorded successfully");
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to record purchase");
      }
    } catch (error) {
      console.error("Error recording purchase:", error);
      toast.error("Failed to record purchase");
    }
  };

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Purchase Entry
              </h1>
              <p className="text-gray-600">Record new purchases</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Purchase Entry Form */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Record New Purchase
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New purchase-level fields */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Vendor
                  </label>
                  <input
                    type="text"
                    className="input-field mt-1 w-full"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Bill Number
                  </label>
                  <input
                    type="text"
                    className="input-field mt-1 w-full"
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    PO Number
                  </label>
                  <input
                    type="text"
                    className="input-field mt-1 w-full"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Ticket Number
                  </label>
                  <input
                    type="text"
                    className="input-field mt-1 w-full"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                  />
                </div>
              </div>
              {purchaseItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex space-x-2 items-end border-b pb-2 mb-2"
                >
                  <div className="flex-1 ">
                    <label className="block text-sm font-medium text-gray-700">
                      Item
                    </label>
                    <select
                      required
                      className="input-field mt-1 w-full"
                      value={item.itemId}
                      onChange={(e) =>
                        handleItemChange(idx, "itemId", e.target.value)
                      }
                    >
                      <option value="">Select an item</option>
                      {items.map((itm) => (
                        <option key={itm.id} value={itm.id}>
                          {itm.name}
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
                      required
                      className="input-field mt-1 w-full"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(idx, "quantity", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Serial Number
                    </label>
                    <input
                      type="text"
                      className="input-field mt-1 w-full"
                      value={item.serialNumber || ""}
                      onChange={(e) =>
                        handleItemChange(idx, "serialNumber", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Unit Type
                    </label>
                    <select
                      className="input-field mt-1 w-full"
                      value={item.unitType}
                      onChange={(e) =>
                        handleItemChange(idx, "unitType", e.target.value)
                      }
                    >
                      <option value="PCS">Pieces</option>
                      <option value="M">Meters</option>
                      <option value="L">Liters</option>
                      <option value="KG">Kilograms</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="input-field mt-1 w-full"
                      value={item.amount}
                      onChange={(e) =>
                        handleItemChange(idx, "amount", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Tax Rate
                    </label>
                    <select
                      className="input-field mt-1 w-full"
                      value={item.taxRate}
                      onChange={(e) =>
                        handleItemChange(idx, "taxRate", e.target.value)
                      }
                    >
                      <option value={18}>18%</option>
                      <option value={28}>28%</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium ">
                      Grand Total (₹)
                    </label>
                    <input
                      type="text"
                      className="input-field mt-1 w-full  cursor-not-allowed"
                      value={(() => {
                        const amt = parseFloat(item.amount) || 0;
                        const tax = (amt * (item.taxRate || 0)) / 100;
                        return (amt + tax).toFixed(2);
                      })()}
                      readOnly
                      tabIndex={-1}
                    />
                  </div>

                  {purchaseItems.length > 1 && (
                    <button
                      type="button"
                      className="ml-2 mb-2 text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveItem(idx)}
                      title="Remove item"
                    >
                      <X className="w-7 h-7" />
                    </button>
                  )}
                </div>
              ))}
              <div>
                <button
                  type="button"
                  className="btn-secondary flex items-center"
                  onClick={handleAddItem}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Item
                </button>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    className="input-field mt-1 w-full"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
              {/* Total Amount */}
              <div className="text-right font-semibold text-lg text-gray-800">
                {(() => {
                  const total = purchaseItems.reduce(
                    (sum, item) => sum + (parseFloat(item.amount) || 0),
                    0
                  );
                  const totalTax = purchaseItems.reduce(
                    (sum, item) =>
                      sum +
                      ((parseFloat(item.amount) || 0) * (item.taxRate || 0)) /
                        100,
                    0
                  );
                  const grandTotal = total + totalTax;
                  return (
                    <div className="flex justify-end gap-2">
                      <div className="text-sm  border border-black-500 pb-2 p-2 rounded-md bg-gray-200">
                        Total Amount: ₹{total.toFixed(2)}
                      </div>
                      <div className="text-sm  border border-black-500 pb-2 p-2 rounded-md bg-gray-200">
                        Tax: ₹{totalTax.toFixed(2)}
                      </div>
                      <div className="text-sm  border border-black-500 pb-2 p-2 rounded-md bg-gray-200">
                        Grand Total: ₹{grandTotal.toFixed(2)}
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Reset
                </button>
                <button type="submit" className="btn-primary">
                  Record Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
        {/* End of Purchase Entry Form */}
        {/* Recent Purchases Table */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Purchases
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
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recorded By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {purchases.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {purchase.item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {purchase.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {purchase.unitType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{purchase.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(purchase.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {purchase.user.name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
