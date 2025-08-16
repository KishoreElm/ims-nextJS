"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import AdminNavBar from "@/components/AdminNavBar";

// Interface definitions (no changes)
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
  serialNumbers: string[];
  serialInput: string;
}

const initialPurchaseItem: PurchaseItemForm = {
  itemId: "",
  quantity: "",
  unitType: "PCS",
  amount: "",
  taxRate: 18,
  serialNumbers: [],
  serialInput: "",
};

export default function PurchaseEntry() {
  const { user } = useAuth();
  const router = useRouter();

  // State Declarations
  const [items, setItems] = useState<Item[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItemForm[]>([
    initialPurchaseItem,
  ]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [vendor, setVendor] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [poNumber, setPoNumber] = useState("");
  // const [ticketNumber, setTicketNumber] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [itemsResponse, purchasesResponse] = await Promise.all([
        fetch("/api/admin/items", { headers }),
        fetch("/api/admin/purchases", { headers }),
      ]);

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        setItems(itemsData);
      }
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
  }, []); // useCallback wraps fetchData

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/dashboard");
    } else if (user?.role === "ADMIN") {
      fetchData();
    }
  }, [user, router, fetchData]);

  // Refactored handler for all item form changes
  const handleItemChange = (
    index: number,
    field: keyof PurchaseItemForm,
    value: string | number
  ) => {
    setPurchaseItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        if (field === "itemId" && typeof value === "string") {
          const selectedItem = items.find((itm) => itm.id === value);
          return {
            ...item,
            itemId: value,
            unitType: selectedItem?.unitType || "PCS",
          };
        }

        return { ...item, [field]: value };
      })
    );
  };

  
  const handleRemoveItem = (index: number) => {
    setPurchaseItems((prev) => prev.filter((_, i) => i !== index));
  };
  
  const handleAddItem = () => {
    setPurchaseItems((prev) => [...prev, initialPurchaseItem]);
  };
  const handleAddSerialNumber = (index: number) => {
    const item = purchaseItems[index];
    const serialNumber = item.serialInput.trim();
    if (!serialNumber) return;

    const isDuplicate = item.serialNumbers.some(
      (sn) => sn.toLowerCase() === serialNumber.toLowerCase()
    );

    if (isDuplicate) {
      toast.error("Duplicate serial number");
      handleItemChange(index, "serialInput", "");
      return;
    }

    setPurchaseItems((prev) =>
      prev.map((itm, i) =>
        i === index
          ? {
              ...itm,
              serialNumbers: [...itm.serialNumbers, serialNumber],
              serialInput: "",
            }
          : itm
      )
    );
  };

  const handleRemoveSerialNumber = (itemIndex: number, serialIndex: number) => {
    setPurchaseItems((prev) =>
      prev.map((item, i) => {
        if (i !== itemIndex) return item;
        return {
          ...item,
          serialNumbers: item.serialNumbers.filter(
            (_, sIndex) => sIndex !== serialIndex
          ),
        };
      })
    );
  };

  const resetForm = () => {
    setPurchaseItems([initialPurchaseItem]);
    setDate(new Date().toISOString().split("T")[0]);
    setVendor("");
    setBillNumber("");
    setPoNumber("");
    // setTicketNumber("");
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
            itemId: item.itemId,
            quantity: parseFloat(item.quantity) || 0,
            unitType: item.unitType,
            amount: parseFloat(item.amount) || 0,
            taxRate: item.taxRate,
            serialNumbers: item.serialNumbers, // Corrected from serialNumber
          })),
          date,
          vendor,
          billNumber,
          poNumber,
          // ticketNumber,
        }),
      });

      if (response.ok) {
        toast.success("Purchase recorded successfully");
        resetForm();
        fetchData(); // Refetch data to update the list
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to record purchase");
      }
    } catch (error) {
      console.error("Error recording purchase:", error);
      toast.error("An unexpected error occurred");
    }
  };

  if (!user || user.role !== "ADMIN") {
    // Render null or a loading spinner while redirecting
    return null;
  }

  // JSX with simplified onChange handlers
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNavBar/>
    <div className="min-h-screen bg-gray-100 flex-1">
      <header className="bg-[#F3E2D4] shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Purchase Entry</h1>
          <p className="text-gray-600">Record new purchases</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit}>
          <div className="bg-white shadow rounded-lg mb-8 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Record New Purchase
            </h3>

            {/* Vendor and document numbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <TextField
                label="Vendor"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Bill Number"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="PO Number"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                fullWidth
              />
              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fullWidth
              />
            </div>

            {/* Purchase items */}
            {purchaseItems.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="mb-6 p-4 border rounded-lg relative "
              >
                <div className="w-[97%] grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                  {/* Item Select */}
                  <select
                    className="w-full p-2 border rounded"
                    value={item.itemId}
                    onChange={(e) =>
                      handleItemChange(itemIndex, "itemId", e.target.value)
                    }
                    required
                  >
                    <option value="">Select Item</option>
                    {items.map((itm) => (
                      <option key={itm.id} value={itm.id}>
                        {itm.name}
                      </option>
                    ))}
                  </select>

                  {/* Quantity */}
                  <TextField
                    label="Quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(itemIndex, "quantity", e.target.value)
                    }
                    required
                    fullWidth
                  />

                  {/* Unit */}
                  <select
                    className="w-full p-2 border rounded"
                    value={item.unitType}
                    onChange={(e) =>
                      handleItemChange(itemIndex, "unitType", e.target.value)
                    }
                    required
                  >
                    <option value="PCS">Pieces</option>
                    <option value="M">Meters</option>
                    <option value="L">Liters</option>
                    <option value="KG">Kilograms</option>
                  </select>

                  {/* Amount */}
                  <TextField
                    label="Amount (₹)"
                    type="number"
                    value={item.amount}
                    onChange={(e) =>
                      handleItemChange(itemIndex, "amount", e.target.value)
                    }
                    required
                    fullWidth
                  />

                  {/* Tax Rate */}
                  <select
                    className="w-full p-2 border rounded"
                    value={item.taxRate}
                    onChange={(e) =>
                      handleItemChange(
                        itemIndex,
                        "taxRate",
                        Number(e.target.value)
                      )
                    }
                  >
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>

                  {/* GST Total */}
                  <div className="pt-4 border rounded bg-gray-100 text-center font-semibold">
                    ₹
                    {(
                      (parseFloat(item.amount) || 0) *
                      (1 + (item.taxRate || 0) / 100)
                    ).toFixed(2)}
                  </div>
                  {/* Remove Item Button */}
                  {purchaseItems.length > 1 && (
                   
                      <button
                        type="button"
                        className=" absolute top-9 right-4 text-red-500"
                        onClick={() => handleRemoveItem(itemIndex)}
                      >
                        <X size={18} />
                      </button>
                    
                  )}
             
                </div>

                {/* Serial number input */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">
                    Serial Numbers
                  </label>
                  <div className="flex items-center gap-2">
                    <TextField
                      placeholder="Add serial number and press Enter"
                      value={item.serialInput}
                      onChange={(e) =>
                        handleItemChange(
                          itemIndex,
                          "serialInput",
                          e.target.value
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSerialNumber(itemIndex);
                        }
                      }}
                      fullWidth
                    />
                  </div>
                  <Paper className="mt-2 p-2 min-h-[50px] rounded">
                    {item.serialNumbers.length > 0 ? (
                      item.serialNumbers.map((serial, serialIndex) => (
                        <Chip
                          key={serialIndex}
                          label={serial}
                          onDelete={() =>
                            handleRemoveSerialNumber(itemIndex, serialIndex)
                          }
                          className="m-1"
                        />
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">
                        No serial numbers added.
                      </span>
                    )}
                  </Paper>
                </div>

              
              </div>
            ))}

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6">
              <button
                type="button"
                className="flex items-center text-[#17313E] hover:text-[#415E72]"
                onClick={handleAddItem}
              >
                <Plus size={16} className="mr-1" /> Add Another Item
              </button>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2  text-gray-800 border rounded-md bg-gray-200 hover:bg-gray-300"
                  onClick={resetForm}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-4 py-2  text-white rounded-md  bg-[#17313E] hover:bg-[#415E72]"
                >
                  Record Purchase
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Recent purchases table remains the same */}
      </main>
    </div>
    </div>
  );
}
