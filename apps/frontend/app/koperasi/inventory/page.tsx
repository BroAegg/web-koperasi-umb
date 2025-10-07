"use client";

import { useState, FormEvent } from "react";

// Tipe data produk (biar TypeScript happy & rapi)
type StockStatus = "In stock" | "Low stock" | "Out of stock";

interface Product {
  name: string;
  price: number;
  quantity: number;
  threshold: number;
  expiry: string; // simpan string tanggal untuk simpel
  status: StockStatus;
}

export default function InventoryPage() {
  // Data awal (dummy) supaya tabel langsung tampil
  const [products, setProducts] = useState<Product[]>([
    { name: "Gula",  price: 12000, quantity: 20, threshold: 5,  expiry: "2025-12-11", status: "In stock" },
    { name: "Beras", price: 11000, quantity: 4,  threshold: 10, expiry: "2025-12-11", status: "Low stock" },
    { name: "Kopi",  price: 15000, quantity: 0,  threshold: 5,  expiry: "2025-12-11", status: "Out of stock" },
  ]);

  // State modal tambah produk
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Product>({
    name: "",
    price: 0,
    quantity: 0,
    threshold: 0,
    expiry: "",
    status: "In stock",
  });

  const resetForm = () =>
    setForm({ name: "", price: 0, quantity: 0, threshold: 0, expiry: "", status: "In stock" });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Validasi sederhana
    if (!form.name.trim()) return alert("Nama produk wajib diisi");
    if (Number.isNaN(form.price) || form.price < 0) return alert("Harga tidak valid");
    if (Number.isNaN(form.quantity) || form.quantity < 0) return alert("Kuantitas tidak valid");
    if (Number.isNaN(form.threshold) || form.threshold < 0) return alert("Threshold tidak valid");
    if (!form.expiry) return alert("Tanggal kedaluwarsa wajib diisi");

    setProducts((prev) => [...prev, { ...form }]);
    setOpen(false);
    resetForm();
  };

  return (
    <div>
      {/* Judul halaman */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Inventory</h1>

      {/* Kartu tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Daftar Produk</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm"
            >
              + Tambah Produk
            </button>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
              Filters
            </button>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
              Download all
            </button>
          </div>
        </div>

        {/* Tabel lebih tegas & bersih (putih–biru) */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-gray-800 text-sm rounded-lg overflow-hidden">
            <thead className="bg-blue-100 border-b border-gray-300 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Nama Produk</th>
                <th className="px-4 py-3 text-left font-semibold">Harga Beli</th>
                <th className="px-4 py-3 text-left font-semibold">Kuantitas</th>
                <th className="px-4 py-3 text-left font-semibold">Threshold</th>
                <th className="px-4 py-3 text-left font-semibold">Kedaluwarsa</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={`${p.name}-${i}`} className="border-b border-gray-300 hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-2 font-medium">{p.name}</td>
                  <td className="px-4 py-2">Rp {Number(p.price).toLocaleString("id-ID")}</td>
                  <td className="px-4 py-2">{p.quantity}</td>
                  <td className="px-4 py-2">{p.threshold}</td>
                  <td className="px-4 py-2">
                    {/* tampilkan yyyy-mm-dd apa adanya; bisa diformat kalau mau */}
                    {p.expiry}
                  </td>
                  <td className="px-4 py-2">
                    {p.status === "In stock" && <span className="text-green-600 font-semibold">{p.status}</span>}
                    {p.status === "Low stock" && <span className="text-yellow-700 font-semibold">{p.status}</span>}
                    {p.status === "Out of stock" && <span className="text-red-600 font-semibold">{p.status}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Produk */}
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Tambah Produk Baru</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="text-sm">
                  <span className="block mb-1 text-gray-600">Nama Produk</span>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                </label>

                <label className="text-sm">
                  <span className="block mb-1 text-gray-600">Harga Beli</span>
                  <input
                    type="number"
                    min={0}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                    required
                  />
                </label>

                <label className="text-sm">
                  <span className="block mb-1 text-gray-600">Kuantitas</span>
                  <input
                    type="number"
                    min={0}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
                    required
                  />
                </label>

                <label className="text-sm">
                  <span className="block mb-1 text-gray-600">Threshold</span>
                  <input
                    type="number"
                    min={0}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={form.threshold}
                    onChange={(e) => setForm((f) => ({ ...f, threshold: Number(e.target.value) }))}
                    required
                  />
                </label>

                <label className="text-sm">
                  <span className="block mb-1 text-gray-600">Kedaluwarsa</span>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={form.expiry}
                    onChange={(e) => setForm((f) => ({ ...f, expiry: e.target.value }))}
                    required
                  />
                </label>

                <label className="text-sm">
                  <span className="block mb-1 text-gray-600">Status</span>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as StockStatus }))}
                  >
                    <option>In stock</option>
                    <option>Low stock</option>
                    <option>Out of stock</option>
                  </select>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
