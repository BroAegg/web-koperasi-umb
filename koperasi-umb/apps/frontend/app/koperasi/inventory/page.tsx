"use client";

import { useState, ChangeEvent } from "react";

/* ======================== TYPES ======================== */
interface Product {
  id: number;
  name: string;
  buyPrice: number; // harga pokok
  sellPrice: number; // harga jual
  profitPerItem: number;
  stock: number;
  soldToday: number;
}

interface Transaction {
  id: number;
  productName: string;
  type: "IN" | "OUT";
  quantity: number;
  date: string;
  profit: number;
}

/* ======================== FORMAT RUPIAH ======================== */
const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

/* ======================== MAIN PAGE ======================== */
export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: "Gula", buyPrice: 10000, sellPrice: 12000, profitPerItem: 2000, stock: 50, soldToday: 5 },
    { id: 2, name: "Beras", buyPrice: 9000, sellPrice: 11000, profitPerItem: 2000, stock: 30, soldToday: 2 },
    { id: 3, name: "Kopi", buyPrice: 8000, sellPrice: 15000, profitPerItem: 7000, stock: 10, soldToday: 0 },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, productName: "Gula", type: "OUT", quantity: 5, date: "2025-10-08", profit: 10000 },
    { id: 2, productName: "Beras", type: "IN", quantity: 10, date: "2025-10-07", profit: 0 },
  ]);

  const [openModal, setOpenModal] = useState<null | { type: "IN" | "OUT"; productId: number }>(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [qty, setQty] = useState<number>(0);
  const [newProduct, setNewProduct] = useState({
    name: "",
    buyPrice: 0,
    sellPrice: 0,
    profitPerItem: 0,
    stock: 0,
  });

  /* ======================== FORMAT INPUT RUPIAH ======================== */
  const handleCurrencyInput = (e: ChangeEvent<HTMLInputElement>, field: keyof typeof newProduct) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const num = parseInt(raw || "0");
    setNewProduct((prev) => ({ ...prev, [field]: num }));
    e.target.value = rupiah(num);
  };

  /* ======================== TRANSAKSI BARANG ======================== */
  const handleTransaction = () => {
    if (!openModal) return;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== openModal.productId) return p;
        const updatedStock = openModal.type === "IN" ? p.stock + qty : p.stock - qty;
        const updatedSold = openModal.type === "OUT" ? p.soldToday + qty : p.soldToday;

        // Simpan transaksi
        setTransactions((prevTx) => [
          {
            id: prevTx.length + 1,
            productName: p.name,
            type: openModal.type,
            quantity: qty,
            date: new Date().toISOString().split("T")[0],
            profit: openModal.type === "OUT" ? qty * p.profitPerItem : 0,
          },
          ...prevTx,
        ]);

        return { ...p, stock: Math.max(updatedStock, 0), soldToday: updatedSold };
      })
    );
    setQty(0);
    setOpenModal(null);
  };

  /* ======================== TAMBAH PRODUK ======================== */
  const handleAddProduct = () => {
    if (!newProduct.name.trim()) return alert("Nama produk wajib diisi!");
    const id = Math.max(...products.map((p) => p.id)) + 1;
    setProducts([...products, { id, soldToday: 0, ...newProduct }]);
    setNewProduct({ name: "", buyPrice: 0, sellPrice: 0, profitPerItem: 0, stock: 0 });
    setOpenAdd(false);
  };

  /* ======================== HITUNG TOTAL ======================== */
  const totalKonsinyasi = products.reduce((a, b) => a + b.buyPrice * b.stock, 0);
  const totalOmzet = products.reduce((a, b) => a + b.sellPrice * b.stock, 0);
  const totalKeuntungan = products.reduce((a, b) => a + b.profitPerItem * b.stock, 0);

  /* ======================== RENDER ======================== */
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Manajemen Inventory</h1>

      {/* ===== 3 KOTAK: KONSINYASI, OMZET, KEUNTUNGAN ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Harga Pokok (Konsinyasi)" value={rupiah(totalKonsinyasi)} color="text-indigo-600" icon="💰" />
        <StatCard label="Omzet Barang Terjual" value={rupiah(totalOmzet)} color="text-orange-500" icon="📦" />
        <StatCard label="Keuntungan" value={rupiah(totalKeuntungan)} color="text-green-700" icon="📈" />
      </div>

      {/* ===== TABEL PRODUK ===== */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Daftar Barang</h2>
          <button
            onClick={() => setOpenAdd(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm"
          >
            + Tambah Produk
          </button>
        </div>

        <table className="min-w-full border border-gray-300 text-sm text-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-blue-100 border-b border-gray-300 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Produk</th>
              <th className="px-4 py-3 text-left font-semibold">Harga Pokok</th>
              <th className="px-4 py-3 text-left font-semibold">Harga Jual</th>
              <th className="px-4 py-3 text-left font-semibold">Keuntungan / pcs</th>
              <th className="px-4 py-3 text-left font-semibold">Stok</th>
              <th className="px-4 py-3 text-left font-semibold">Terjual Hari Ini</th>
              <th className="px-4 py-3 text-left font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-300 hover:bg-blue-50 transition-colors">
                <td className="px-4 py-2 font-medium">{p.name}</td>
                <td className="px-4 py-2">{rupiah(p.buyPrice)}</td>
                <td className="px-4 py-2">{rupiah(p.sellPrice)}</td>
                <td className="px-4 py-2 text-green-700">{rupiah(p.profitPerItem)}</td>
                <td className={`px-4 py-2 font-semibold ${p.stock <= 5 ? "text-red-600" : "text-gray-800"}`}>
                  {p.stock}
                </td>
                <td className="px-4 py-2">{p.soldToday}</td>
                <td className="px-4 py-2 text-center space-x-2">
                  <button
                    onClick={() => setOpenModal({ type: "IN", productId: p.id })}
                    className="px-3 py-1 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                  >
                    + Masuk
                  </button>
                  <button
                    onClick={() => setOpenModal({ type: "OUT", productId: p.id })}
                    className="px-3 py-1 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    - Keluar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== RIWAYAT TRANSAKSI ===== */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Riwayat Transaksi</h2>
        <table className="min-w-full border border-gray-300 text-sm text-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-blue-100 border-b border-gray-300 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Tanggal</th>
              <th className="px-4 py-3 text-left font-semibold">Produk</th>
              <th className="px-4 py-3 text-left font-semibold">Tipe</th>
              <th className="px-4 py-3 text-left font-semibold">Jumlah</th>
              <th className="px-4 py-3 text-left font-semibold">Keuntungan</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((t) => (
                <tr key={t.id} className="border-b border-gray-300 hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-2">{t.date}</td>
                  <td className="px-4 py-2 font-medium">{t.productName}</td>
                  <td className={`px-4 py-2 font-semibold ${t.type === "IN" ? "text-green-600" : "text-red-600"}`}>
                    {t.type === "IN" ? "Masuk" : "Keluar"}
                  </td>
                  <td className="px-4 py-2">{t.quantity}</td>
                  <td className="px-4 py-2 text-green-700">{rupiah(t.profit)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  Belum ada transaksi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== MODALS ===== */}
      {openModal && (
        <ModalTransaksi
          openModal={openModal}
          setOpenModal={setOpenModal}
          products={products}
          qty={qty}
          setQty={setQty}
          handleTransaction={handleTransaction}
        />
      )}
      {openAdd && (
        <ModalTambahProduk
          openAdd={openAdd}
          setOpenAdd={setOpenAdd}
          newProduct={newProduct}
          setNewProduct={setNewProduct}
          handleAddProduct={handleAddProduct}
          handleCurrencyInput={handleCurrencyInput}
          rupiah={rupiah}
        />
      )}
    </div>
  );
}

/* ======================== COMPONENTS ======================== */

// KARTU STATISTIK
function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5 text-center flex flex-col items-center justify-center">
      {icon && <div className="text-3xl mb-2">{icon}</div>}
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

// MODAL TAMBAH PRODUK
function ModalTambahProduk({ openAdd, setOpenAdd, newProduct, handleAddProduct, handleCurrencyInput, rupiah, setNewProduct }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl border border-gray-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Tambah Produk Baru</h3>
          <button onClick={() => setOpenAdd(false)} className="text-gray-500 hover:text-gray-700 text-lg font-bold">✕</button>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleAddProduct();
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NAMA PRODUK */}
            <label className="text-sm font-medium text-gray-800">
              Nama Produk
              <input
                type="text"
                className="mt-1 w-full border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                value={newProduct.name}
                onChange={(e) => setNewProduct((f: any) => ({ ...f, name: e.target.value }))}
                required
              />
            </label>

            {/* HARGA POKOK */}
            <label className="text-sm font-medium text-gray-800">
              Harga Pokok
              <input
                type="text"
                inputMode="numeric"
                className="mt-1 w-full border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                defaultValue={rupiah(newProduct.buyPrice)}
                onInput={(e) => handleCurrencyInput(e as any, "buyPrice")}
                required
              />
            </label>

            {/* HARGA JUAL */}
            <label className="text-sm font-medium text-gray-800">
              Harga Jual
              <input
                type="text"
                inputMode="numeric"
                className="mt-1 w-full border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                defaultValue={rupiah(newProduct.sellPrice)}
                onInput={(e) => handleCurrencyInput(e as any, "sellPrice")}
                required
              />
            </label>

            {/* KEUNTUNGAN / PCS */}
            <label className="text-sm font-medium text-gray-800">
              Keuntungan / pcs
              <input
                type="text"
                inputMode="numeric"
                className="mt-1 w-full border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                defaultValue={rupiah(newProduct.profitPerItem)}
                onInput={(e) => handleCurrencyInput(e as any, "profitPerItem")}
                required
              />
            </label>

            {/* STOK */}
            <label className="text-sm font-medium text-gray-800">
              Stok Awal
              <input
                type="number"
                min={0}
                className="mt-1 w-full border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                value={newProduct.stock === 0 ? "" : newProduct.stock}
                onChange={(e) => setNewProduct((f: any) => ({ ...f, stock: Number(e.target.value.replace(/^0+/, "")) }))}
                required
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setOpenAdd(false)}
              className="border border-gray-400 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// MODAL TRANSAKSI
function ModalTransaksi({ openModal, setOpenModal, products, qty, setQty, handleTransaction }: any) {
  const product = products.find((p: any) => p.id === openModal.productId);
  if (!product) return null;
  const isIn = openModal.type === "IN";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-300">
        <h3 className={`text-xl font-semibold mb-4 ${isIn ? "text-green-700" : "text-red-700"}`}>
          {isIn ? "Barang Masuk" : "Barang Keluar"}
        </h3>

        <div className="space-y-3 text-sm">
          <p>
            <span className="font-semibold text-gray-800">Produk:</span> {product.name}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Stok Saat Ini:</span> {product.stock} pcs
          </p>
          <p className="text-gray-600 italic">
            {isIn ? "Masukkan jumlah stok yang masuk." : "Masukkan jumlah barang yang keluar atau terjual."}
          </p>

          <input
            type="number"
            className={`w-full border ${
              isIn ? "border-green-500 focus:ring-green-400" : "border-red-500 focus:ring-red-400"
            } rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2`}
            placeholder="Masukkan jumlah"
            value={qty === 0 ? "" : qty}
            onChange={(e) => setQty(Number(e.target.value.replace(/^0+/, "")))}
          />

          <div className="pt-2">
            <p className="text-gray-700 text-sm">
              <span className="font-medium">Estimasi Keuntungan: </span>
              {isIn ? "Tidak ada (barang masuk)" : rupiah(product.profitPerItem * qty || 0)}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-6">
          <button
            onClick={() => setOpenModal(null)}
            className="border border-gray-400 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-100 transition"
          >
            Batal
          </button>
          <button
            onClick={handleTransaction}
            className={`px-4 py-2 rounded-lg text-white font-medium ${
              isIn ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
