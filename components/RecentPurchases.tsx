"use client";

import { useEffect, useState } from "react";

type Purchase = {
  id: string;
  vendor: string;
  billNumber: string | null;
  quantity: number;
  unitType: string;
  amount: number;
  date: string;
  poNumber?: string | null;
};

export default function RecentPurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [vendors, setVendors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [vendor, setVendor] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");

  // Sorting
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Editing
  const [editing, setEditing] = useState<Purchase | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch Purchases + Vendors
  useEffect(() => {
    fetchPurchases();
  }, [page, sortField, sortOrder]);

  useEffect(() => {
    fetchVendors();
  }, []);

  async function fetchVendors() {
    try {
      const res = await fetch("/api/admin/vendors");
      const data = await res.json();
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Vendor Load Error:", err);
    }
  }

  async function fetchPurchases() {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", "10");

      if (vendor) params.set("vendor", vendor);
      if (startMonth && endMonth) {
        params.set("startMonth", startMonth);
        params.set("endMonth", endMonth);
      }

      params.set("sortField", sortField);
      params.set("sortOrder", sortOrder);

      const res = await fetch(`/api/admin/recent-purchases?${params.toString()}`);
      const data = await res.json();

      setPurchases(data.data || []);
      setTotalPages(data.pagination.totalPages || 1);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function submitEdit(p: Purchase) {
    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`/api/admin/recent-purchases/${p.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(p),
      });

      const updated = await res.json();

      setPurchases(prev => prev.map(x => (x.id === updated.id ? updated : x)));
      setEditing(null);

    } catch (err) {
      console.error("Edit Save Error:", err);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Recent Purchases</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

        {/* Vendor Search */}
        <div>
          <label className="text-sm">Vendor</label>
          <select
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
          >
            <option value="">All Vendors</option>
            {vendors.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        {/* Start Month */}
        <div>
          <label className="text-sm">Start Month</label>
          <input
            type="month"
            className="mt-1 p-2 border rounded w-full"
            value={startMonth}
            onChange={(e) => setStartMonth(e.target.value)}
          />
        </div>

        {/* End Month */}
        <div>
          <label className="text-sm">End Month</label>
          <input
            type="month"
            className="mt-1 p-2 border rounded w-full"
            value={endMonth}
            onChange={(e) => setEndMonth(e.target.value)}
          />
        </div>

        <button
          onClick={() => { setPage(1); fetchPurchases(); }}
          className="mt-6 bg-blue-600 text-white rounded p-2"
        >
          Apply
        </button>
      </div>

      {/* Sorting */}
      <div className="flex gap-4 mb-4">
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="date">Date</option>
          <option value="vendor">Vendor</option>
          <option value="amount">Amount</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          className="border p-2 rounded"
        >
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center py-4">Loading...</p>
        ) : (
          <table className="min-w-full divide-y">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">Vendor</th>
                <th className="px-6 py-3 text-left">Bill No</th>
                <th className="px-6 py-3 text-left">Qty</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {purchases.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4">{p.vendor}</td>
                  <td className="px-6 py-4">{p.billNumber}</td>
                  <td className="px-6 py-4">{p.quantity} {p.unitType}</td>
                  <td className="px-6 py-4">₹{p.amount}</td>
                  <td className="px-6 py-4">{new Date(p.date).toLocaleDateString()}</td>

                  <td className="px-6 py-4">
                    <button
                      className="text-blue-600 underline"
                      onClick={() => setEditing(p)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}

              {purchases.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                    No Purchases Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-5">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span>Page {page} / {totalPages}</span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Purchase</h3>

            <div className="space-y-3">

              <div>
                <label>Vendor</label>
                <input
                  className="w-full p-2 border rounded"
                  value={editing.vendor}
                  onChange={(e) =>
                    setEditing({ ...editing, vendor: e.target.value })
                  }
                />
              </div>

              <div>
                <label>Bill Number</label>
                <input
                  className="w-full p-2 border rounded"
                  value={editing.billNumber ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, billNumber: e.target.value })
                  }
                />
              </div>

              <div>
                <label>Quantity</label>
                <input
                  className="w-full p-2 border rounded"
                  type="number"
                  value={editing.quantity}
                  onChange={(e) =>
                    setEditing({ ...editing, quantity: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <label>Unit Type</label>
                <input
                  className="w-full p-2 border rounded"
                  value={editing.unitType}
                  onChange={(e) =>
                    setEditing({ ...editing, unitType: e.target.value })
                  }
                />
              </div>

              <div>
                <label>Amount</label>
                <input
                  className="w-full p-2 border rounded"
                  type="number"
                  value={editing.amount}
                  onChange={(e) =>
                    setEditing({ ...editing, amount: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <label>Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={editing.date.slice(0, 10)}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      date: new Date(e.target.value).toISOString(),
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  disabled={saving}
                  onClick={() => editing && submitEdit(editing)}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
