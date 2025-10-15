"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Edit, 
  Power,
  X,
  Upload,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Dummy data produk
const dummyProducts = [
  { id: 1, name: "Beras Premium 5kg", category: "Sembako", price: 75000, stock: 150, status: "active", image: "/placeholder.jpg" },
  { id: 2, name: "Minyak Goreng 2L", category: "Sembako", price: 32000, stock: 200, status: "active", image: "/placeholder.jpg" },
  { id: 3, name: "Gula Pasir 1kg", category: "Sembako", price: 15000, stock: 180, status: "active", image: "/placeholder.jpg" },
  { id: 4, name: "Telur Ayam 1kg", category: "Makanan Segar", price: 28000, stock: 100, status: "active", image: "/placeholder.jpg" },
  { id: 5, name: "Susu UHT 1L", category: "Minuman", price: 18000, stock: 120, status: "active", image: "/placeholder.jpg" },
  { id: 6, name: "Kopi Bubuk 200g", category: "Minuman", price: 25000, stock: 80, status: "inactive", image: "/placeholder.jpg" },
  { id: 7, name: "Teh Celup 25 bags", category: "Minuman", price: 12000, stock: 150, status: "active", image: "/placeholder.jpg" },
  { id: 8, name: "Indomie Goreng 5pcs", category: "Makanan Instan", price: 14000, stock: 300, status: "active", image: "/placeholder.jpg" },
  { id: 9, name: "Sabun Mandi", category: "Kebersihan", price: 5000, stock: 200, status: "active", image: "/placeholder.jpg" },
  { id: 10, name: "Pasta Gigi", category: "Kebersihan", price: 8000, stock: 150, status: "active", image: "/placeholder.jpg" },
];

const categories = ["Semua", "Sembako", "Makanan Segar", "Minuman", "Makanan Instan", "Kebersihan"];

interface ProductForm {
  name: string;
  category: string;
  price: string;
  stock: string;
  description: string;
  image: File | null;
}

export default function SupplierProducts() {
  const [products, setProducts] = useState(dummyProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    category: "Sembako",
    price: "",
    stock: "",
    description: "",
    image: null,
  });

  // Filter produk
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price.toString(),
        stock: product.stock.toString(),
        description: product.description || "",
        image: null,
      });
      setImagePreview(product.image);
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        category: "Sembako",
        price: "",
        stock: "",
        description: "",
        image: null,
      });
      setImagePreview("");
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "Sembako",
      price: "",
      stock: "",
      description: "",
      image: null,
    });
    setImagePreview("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran gambar maksimal 2MB");
        return;
      }
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.stock) {
      alert("Mohon lengkapi semua field!");
      return;
    }

    if (editingProduct) {
      // Update produk
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? { 
              ...p, 
              name: formData.name,
              category: formData.category,
              price: parseFloat(formData.price), 
              stock: parseInt(formData.stock),
              image: imagePreview || p.image
            }
          : p
      ));
      alert("Produk berhasil diupdate!");
    } else {
      // Tambah produk baru
      const newProduct = {
        id: products.length + 1,
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        status: "active",
        image: imagePreview || "/placeholder.jpg",
      };
      setProducts([...products, newProduct]);
      alert("Produk berhasil ditambahkan!");
    }
    handleCloseModal();
  };

  const handleToggleStatus = (id: number) => {
    setProducts(products.map(p => 
      p.id === id 
        ? { ...p, status: p.status === "active" ? "inactive" : "active" }
        : p
    ));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Produk Saya</h1>
          <p className="text-slate-600 mt-1">Kelola produk yang Anda jual</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Produk
        </Button>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl shadow-md border-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl border-slate-300"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-slate-600" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="rounded-2xl shadow-md border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Produk</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Kategori</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Harga</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Stok</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center overflow-hidden">
                          <span className="text-xl">📦</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{product.name}</p>
                          <p className="text-sm text-slate-500">ID: {product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{product.category}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        product.stock > 100 ? "bg-green-100 text-green-700" :
                        product.stock > 50 ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {product.stock} unit
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        product.status === "active" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {product.status === "active" ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          onClick={() => handleOpenModal(product)}
                          size="sm"
                          variant="outline"
                          className="rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleToggleStatus(product.id)}
                          size="sm"
                          variant="outline"
                          className={`rounded-lg ${
                            product.status === "active" 
                              ? "text-red-600 hover:bg-red-50" 
                              : "text-green-600 hover:bg-green-50"
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)} dari {filteredProducts.length} produk
            </p>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  variant={currentPage === page ? "primary" : "outline"}
                  size="sm"
                  className={`rounded-lg ${currentPage === page ? "bg-blue-600" : ""}`}
                >
                  {page}
                </Button>
              ))}
              <Button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Tambah/Edit Produk */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl rounded-2xl shadow-xl border-0 max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
                </h2>
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nama Produk */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama produk"
                    className="rounded-xl"
                    required
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {categories.filter(c => c !== "Semua").map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Harga & Stok */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Harga (Rp) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0"
                      className="rounded-xl"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Stok <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                      className="rounded-xl"
                      required
                      min="0"
                    />
                  </div>
                </div>

                {/* Upload Gambar */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Gambar Produk (Max 2MB)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img src={imagePreview} alt="Preview" className="mx-auto h-32 object-cover rounded-lg" />
                        <Button
                          type="button"
                          onClick={() => {
                            setImagePreview("");
                            setFormData({ ...formData, image: null });
                          }}
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                        >
                          Hapus Gambar
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700 font-medium">
                            Pilih gambar
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-sm text-slate-500 mt-1">PNG, JPG hingga 2MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Deskripsi Produk
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deskripsi produk (opsional)"
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    onClick={handleCloseModal}
                    variant="outline"
                    className="rounded-xl"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                  >
                    {editingProduct ? "Simpan Perubahan" : "Tambah Produk"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
