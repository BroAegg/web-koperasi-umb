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
  ChevronRight,
  Package
} from "lucide-react";
import { StatusBadge, EmptyState, LoadingSpinner, Pagination } from "@/components/supplier";
import { 
  PRODUCT_STATUS, 
  PRODUCT_CATEGORIES, 
  formatCurrency, 
  EMPTY_STATES,
  validateImageFile 
} from "@/lib/supplier-constants";

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

// Use centralized categories
const categories = ["Semua", ...PRODUCT_CATEGORIES];

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
      const validation = validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error);
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

  return (
    <div className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produk Saya</h1>
          <p className="text-gray-600">Kelola produk yang Anda jual</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Produk
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-gray-600 flex-shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
      <Card>
        <CardContent className="p-0">
          {filteredProducts.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Package}
                title={searchTerm || selectedCategory !== "Semua" ? EMPTY_STATES.search.title : EMPTY_STATES.products.title}
                description={searchTerm || selectedCategory !== "Semua" ? EMPTY_STATES.search.description : EMPTY_STATES.products.description}
                actionLabel={!(searchTerm || selectedCategory !== "Semua") ? EMPTY_STATES.products.action : undefined}
                onAction={!(searchTerm || selectedCategory !== "Semua") ? () => handleOpenModal() : undefined}
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Produk</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Kategori</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Harga</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stok</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                              <span className="text-lg">📦</span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                              <p className="text-xs text-gray-500">ID: {product.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700 text-sm">{product.category}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900 text-sm">{formatCurrency(product.price)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            product.stock > 100 ? "bg-green-100 text-green-700" :
                            product.stock > 50 ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge 
                            {...PRODUCT_STATUS[product.status as keyof typeof PRODUCT_STATUS]}
                            size="sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              onClick={() => handleOpenModal(product)}
                              size="sm"
                              variant="outline"
                              className="rounded-lg p-2"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleToggleStatus(product.id)}
                              size="sm"
                              variant="outline"
                              className={`rounded-lg p-2 ${
                                product.status === "active" 
                                  ? "text-red-600 hover:bg-red-50 border-red-200" 
                                  : "text-green-600 hover:bg-green-50 border-green-200"
                              }`}
                              title={product.status === "active" ? "Nonaktifkan" : "Aktifkan"}
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
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredProducts.length}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal Tambah/Edit Produk */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl rounded-xl shadow-2xl border-0 max-h-[90vh] overflow-y-auto">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
                </h2>
                <button 
                  onClick={handleCloseModal} 
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nama Produk */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama produk"
                    className="rounded-lg"
                    required
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {categories.filter(c => c !== "Semua").map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Harga & Stok */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Harga (Rp) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0"
                      className="rounded-lg"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stok <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                      className="rounded-lg"
                      required
                      min="0"
                    />
                  </div>
                </div>

                {/* Upload Gambar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gambar Produk (Max 5MB)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img src={imagePreview} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded-lg" />
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
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
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
                        <p className="text-sm text-gray-500 mt-1">PNG, JPG, WebP hingga 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Produk
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deskripsi produk (opsional)"
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={handleCloseModal}
                    variant="outline"
                    className="rounded-lg order-2 sm:order-1"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 rounded-lg order-1 sm:order-2"
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
    </div>
  );
}
