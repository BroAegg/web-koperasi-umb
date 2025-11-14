"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Minus,
  Search,
  Package,
  AlertCircle,
  CheckCircle2,
  History,
  Loader2,
  ArrowRight,
} from "lucide-react";

interface Supplier {
  id: string;
  businessName: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  stock: number;
  unit: string;
  supplier: Supplier;
}

interface AdjustmentHistory {
  id: string;
  quantity: number;
  movementType: string;
  note: string | null;
  createdAt: string;
  product: {
    id: string;
    name: string;
    stock: number;
    supplier: Supplier;
  };
}

export default function ManualStockAdjustmentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [quantity, setQuantity] = useState<number>(0);
  const [adjustmentType, setAdjustmentType] = useState<"add" | "reduce">("add");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  
  // History
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<AdjustmentHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Search products
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`/api/admin/products/search?search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      if (data.success) {
        setProducts(data.data.products || []);
      } else {
        alert(data.error || "Gagal mencari produk");
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Gagal mencari produk");
    } finally {
      setIsSearching(false);
    }
  };

  // Select product
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setProducts([]);
    setSearchQuery("");
    setQuantity(0);
    setReason("");
    setNotes("");
    loadHistory(product.id);
  };

  // Load adjustment history
  const loadHistory = async (productId: string) => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/admin/stock/adjust?productId=${productId}&limit=10`);
      const data = await res.json();
      
      if (data.success) {
        setHistory(data.data.adjustments || []);
      }
    } catch (error) {
      console.error("Load history error:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Submit adjustment
  const handleSubmit = async () => {
    if (!selectedProduct) {
      alert("Pilih produk terlebih dahulu");
      return;
    }

    if (quantity === 0) {
      alert("Jumlah tidak boleh 0");
      return;
    }

    if (!reason.trim()) {
      alert("Alasan harus diisi");
      return;
    }

    // Confirm
    const action = adjustmentType === "add" ? "menambah" : "mengurangi";
    const confirmMsg = `Yakin ${action} ${Math.abs(quantity)} ${selectedProduct.unit} untuk produk "${selectedProduct.name}"?\n\nStok saat ini: ${selectedProduct.stock}\nStok baru: ${selectedProduct.stock + (adjustmentType === "add" ? quantity : -quantity)}`;
    
    if (!confirm(confirmMsg)) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/stock/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity: adjustmentType === "add" ? quantity : -quantity,
          reason,
          notes,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(data.message);
        // Update selected product stock
        setSelectedProduct({
          ...selectedProduct,
          stock: data.data.product.newStock,
        });
        // Reset form
        setQuantity(0);
        setReason("");
        setNotes("");
        // Reload history
        loadHistory(selectedProduct.id);
      } else {
        alert(data.error || "Gagal menyesuaikan stok");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const projectedStock = selectedProduct 
    ? selectedProduct.stock + (adjustmentType === "add" ? quantity : -quantity)
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Penyesuaian Stok Manual</h1>
        <p className="text-gray-600">
          Tambah atau kurangi stok untuk produk penitip yang datang langsung atau koreksi stok
        </p>
      </div>

      {/* Search Product */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Cari Produk Penitip
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Cari nama produk atau nama penitip..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Cari
            </Button>
          </div>

          {/* Search Results */}
          {products.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{products.length} produk ditemukan:</p>
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600">
                        Penitip: {product.supplier.businessName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Stok saat ini: <span className="font-medium">{product.stock} {product.unit}</span>
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Product & Adjustment Form */}
      {selectedProduct && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Penyesuaian Stok
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Info */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{selectedProduct.name}</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-600">Penitip:</span>{" "}
                    <span className="font-medium">{selectedProduct.supplier.businessName}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Stok Sekarang:</span>{" "}
                    <span className="font-medium text-blue-600">{selectedProduct.stock} {selectedProduct.unit}</span>
                  </p>
                </div>
              </div>

              {/* Adjustment Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Jenis Penyesuaian</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={adjustmentType === "add" ? "default" : "outline"}
                    onClick={() => setAdjustmentType("add")}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Stok
                  </Button>
                  <Button
                    type="button"
                    variant={adjustmentType === "reduce" ? "default" : "outline"}
                    onClick={() => setAdjustmentType("reduce")}
                    className="flex items-center gap-2"
                  >
                    <Minus className="w-4 h-4" />
                    Kurangi Stok
                  </Button>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Jumlah ({selectedProduct.unit})
                </label>
                <Input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.abs(parseInt(e.target.value) || 0))}
                  placeholder="Masukkan jumlah"
                />
              </div>

              {/* Projected Stock */}
              <div className={`p-3 rounded-lg ${projectedStock < 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                <p className="text-sm text-gray-600">Stok Setelah Penyesuaian:</p>
                <p className={`text-2xl font-bold ${projectedStock < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {projectedStock} {selectedProduct.unit}
                  {projectedStock < 0 && (
                    <span className="text-sm ml-2 text-red-500">(Tidak valid!)</span>
                  )}
                </p>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Alasan <span className="text-red-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Pilih alasan</option>
                  {adjustmentType === "add" ? (
                    <>
                      <option value="Penitip datang bawa barang">Penitip datang bawa barang</option>
                      <option value="Koreksi stok kurang">Koreksi stok kurang</option>
                      <option value="Barang ditemukan">Barang ditemukan</option>
                      <option value="Lainnya">Lainnya</option>
                    </>
                  ) : (
                    <>
                      <option value="Barang rusak">Barang rusak</option>
                      <option value="Barang kadaluarsa">Barang kadaluarsa</option>
                      <option value="Koreksi stok lebih">Koreksi stok lebih</option>
                      <option value="Barang hilang">Barang hilang</option>
                      <option value="Lainnya">Lainnya</option>
                    </>
                  )}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">Catatan Tambahan</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan detail (opsional)..."
                  className="w-full p-2 border rounded-lg h-20"
                />
              </div>

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || quantity === 0 || !reason || projectedStock < 0}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Terapkan Penyesuaian
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Riwayat Penyesuaian
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Belum ada riwayat penyesuaian</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div key={item.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {item.note?.includes("addition") || item.note?.includes("tambah") ? (
                            <Plus className="w-4 h-4 text-green-500" />
                          ) : (
                            <Minus className="w-4 h-4 text-red-500" />
                          )}
                          <span className="font-medium">{item.quantity} {selectedProduct.unit}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleString("id-ID")}
                        </span>
                      </div>
                      {item.note && (
                        <p className="text-sm text-gray-600">{item.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
