"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Edit, 
  Power,
  Package,
  AlertCircle,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  X,
  Upload
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  sellPrice: number;
  stock: number;
  unit: string;
  status: string;
  isActive: boolean;
  imageUrl: string | null;
  categories: {
    id: string;
    name: string;
  };
}

interface SupplierConfig {
  maxProducts: number;
  allowImageUpload: boolean;
  requireImageUpload: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  categoryId: string;
  description: string;
  sellPrice: string;
  stock: string;
  unit: string;
  stockCycle: string;
  imageUrl: string;
}

export default function SupplierProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<SupplierConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    categoryId: '',
    description: '',
    sellPrice: '',
    stock: '',
    unit: 'pcs',
    stockCycle: 'Harian',
    imageUrl: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchConfig();
    fetchProducts();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Unauthorized - Please login');
        return;
      }

      const response = await fetch('/api/settings/supplier-config', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await response.json();
      
      if (result.success) {
        setConfig(result.data);
      } else {
        setConfig({
          maxProducts: 3,
          allowImageUpload: true,
          requireImageUpload: false,
        });
      }
    } catch (error) {
      setConfig({
        maxProducts: 3,
        allowImageUpload: true,
        requireImageUpload: false,
      });
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Unauthorized - Please login');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/supplier/products', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data);
      } else {
        setError(result.error || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleOpenModal = () => {
    fetchCategories();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      name: '',
      categoryId: '',
      description: '',
      sellPrice: '',
      stock: '',
      unit: 'pcs',
      stockCycle: 'Harian',
      imageUrl: ''
    });
    setImagePreview(null);
    setIsSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      alert('Nama produk wajib diisi');
      return;
    }
    if (!formData.categoryId) {
      alert('Kategori wajib dipilih');
      return;
    }
    if (!formData.sellPrice || parseFloat(formData.sellPrice) < 1000) {
      alert('Harga jual minimal Rp 1.000');
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      alert('Stok tidak boleh negatif');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Unauthorized - Please login');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/supplier/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          categoryId: formData.categoryId,
          description: formData.description.trim() || null,
          sellPrice: parseFloat(formData.sellPrice),
          stock: parseInt(formData.stock),
          unit: formData.unit,
          stockCycle: formData.stockCycle,
          imageUrl: formData.imageUrl || null
        })
      });

      const result = await response.json();

      if (result.success) {
        alert('Produk berhasil direquest! Menunggu approval admin.');
        handleCloseModal();
        fetchProducts(); // Refresh list
      } else {
        alert(result.error || 'Gagal membuat request produk');
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('Toggle status for product:', productId, 'to:', !currentStatus);
      await fetchProducts();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      INACTIVE: {
        label: 'Menunggu Approval',
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      ACTIVE: {
        label: 'Tersedia di BSM Mart',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      REJECTED: {
        label: 'Ditolak',
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-200'
      }
    };
    
    return configs[status as keyof typeof configs] || configs.INACTIVE;
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const { label, icon: Icon, className } = getStatusConfig(status);
    
    return (
      <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${className}`}>
        <Icon className="w-3 h-3" />
        <span>{label}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat produk...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Terjadi Kesalahan
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchProducts}>
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const maxProducts = config?.maxProducts || 3;
  const canAddMore = products.length < maxProducts;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Produk Saya</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Kelola produk yang Anda jual</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <Package className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" />
            <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">
              Produk: <strong className="text-blue-600">{products.length}/{maxProducts}</strong> slot
            </span>
          </div>
          
          <Button 
            onClick={handleOpenModal}
            disabled={!canAddMore}
            className="w-full sm:w-auto"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            {canAddMore ? 'Request Produk Baru' : 'Slot Penuh'}
          </Button>
        </div>
      </div>

      {products.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-12 text-center">
            <Package className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Belum Ada Produk
            </h3>
            <p className="text-gray-600 mb-6">
              Anda belum memiliki produk. Mulai dengan request produk baru untuk dijual di BSM Mart.
            </p>
            <Button onClick={handleOpenModal}>
              <Plus className="w-4 h-4 mr-2" />
              Request Produk Pertama
            </Button>
          </CardContent>
        </Card>
      )}

      {products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.categories.name}</p>
                  </div>
                  
                  <StatusBadge status={product.status} />
                  
                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  )}
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Harga Jual</p>
                      <p className="font-bold text-lg text-blue-600">{formatCurrency(product.sellPrice)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Stok</p>
                      <p className="font-bold text-lg text-gray-900">{product.stock} <span className="text-sm font-normal text-gray-500">{product.unit}</span></p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => console.log('Edit product:', product.id)}
                    >
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => handleToggleStatus(product.id, product.isActive)}
                      disabled={product.status !== 'ACTIVE'}
                    >
                      <Power className="w-4 h-4 mr-1" />
                      {product.isActive ? 'Nonaktif' : 'Aktif'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {canAddMore && (
            <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer transition-colors">
              <CardContent 
                className="p-6 flex flex-col items-center justify-center h-full min-h-[400px]"
                onClick={handleOpenModal}
              >
                <Plus className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">Request Produk Baru</p>
                <p className="text-sm text-gray-400 mt-2">
                  {maxProducts - products.length} slot tersisa
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Modal Request Produk */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Request Produk Baru</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
                disabled={isSubmitting}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Nama Produk */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Contoh: Indomie Goreng Jumbo"
                  required
                  maxLength={100}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">Min 3 karakter, max 100 karakter</p>
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Deskripsi produk (opsional)"
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Harga & Stok */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Jual (Rp) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="sellPrice"
                    value={formData.sellPrice}
                    onChange={handleInputChange}
                    placeholder="10000"
                    required
                    min="1000"
                    max="10000000"
                    step="100"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">Min Rp 1.000</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stok Awal <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="100"
                    required
                    min="0"
                    max="10000"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">Max 10.000</p>
                </div>
              </div>

              {/* Unit & Siklus */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Satuan <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pcs">Pcs (Pieces)</option>
                    <option value="kg">Kg (Kilogram)</option>
                    <option value="liter">Liter</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                    <option value="lusin">Lusin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Siklus Stok <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="stockCycle"
                    value={formData.stockCycle}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Harian">Harian</option>
                    <option value="Mingguan">Mingguan</option>
                    <option value="Bulanan">Bulanan</option>
                  </select>
                </div>
              </div>

              {/* Image Upload (Optional for now) */}
              {config?.allowImageUpload && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto Produk {config?.requireImageUpload && <span className="text-red-500">*</span>}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Upload foto produk (coming soon)</p>
                    <p className="text-xs text-gray-500 mt-1">Max 2MB, format: JPG/PNG</p>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mengirim Request...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
