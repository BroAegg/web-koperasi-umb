"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Edit, 
  Power,
  Package,
  AlertCircle,
  Loader2,
  CheckCircle,
  Clock,
  XCircle
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

export default function SupplierProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<SupplierConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produk Saya</h1>
          <p className="text-gray-600 mt-1">Kelola produk yang Anda jual</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <Package className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">
              Produk: <strong className="text-blue-600">{products.length}/{maxProducts}</strong> slot
            </span>
          </div>
          
          <Button 
            onClick={() => console.log('Open add product modal')}
            disabled={!canAddMore}
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
            <Button onClick={() => console.log('Open add product modal')}>
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
                onClick={() => console.log('Open add product modal')}
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
    </div>
  );
}
