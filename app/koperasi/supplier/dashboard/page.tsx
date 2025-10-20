"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { StatusBadge, EmptyState, LoadingSpinner } from "@/components/supplier";
import { PAYMENT_STATUS, ORDER_STATUS, formatCurrency, formatDate } from "@/lib/supplier-constants";

interface DashboardData {
  supplier: {
    name: string;
    status: string;
    email: string;
    phone: string;
  };
  metrics: {
    totalProducts: number;
    activeProducts: number;
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    monthlyRevenue: number;
    activeOrdersRate: number;
    completionRate: number;
  };
  payment: {
    status: string;
    isActive: boolean;
    nextDue: string | null;
    monthlyFee: number;
  };
  recentOrders: any[];
  productPerformance: any[];
}

export default function SupplierDashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch('/api/supplier/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      
      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError(data.error || 'Failed to load dashboard');
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Get payment status badge using centralized config
  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = PAYMENT_STATUS[status as keyof typeof PAYMENT_STATUS] || PAYMENT_STATUS.PENDING;
    return <StatusBadge {...statusConfig} />;
  };

  // Get supplier status badge
  const getSupplierStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string; icon: any }> = {
      PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
      APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      ACTIVE: { label: 'Active', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle },
      REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
    };
    const badge = badges[status] || badges.PENDING;
    return <StatusBadge {...badge} />;
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Memuat dashboard..." />;
  }

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { supplier, metrics, payment, recentOrders, productPerformance } = dashboardData;

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard Supplier</h1>
          <p className="text-slate-600 mt-1">Selamat datang, {supplier.name}</p>
          <div className="mt-2">{getSupplierStatusBadge(supplier.status)}</div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => router.push("/koperasi/supplier/products")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Produk
          </Button>
          <Button 
            onClick={() => router.push("/koperasi/supplier/orders")}
            variant="outline"
          >
            <Eye className="w-4 h-4 mr-2" />
            Lihat Pesanan
          </Button>
        </div>
      </div>

      {/* Payment Warning */}
      {payment.status !== 'PAID_APPROVED' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-900">Pembayaran Diperlukan</h4>
                <p className="text-sm text-yellow-800 mt-1">
                  Silakan upload bukti pembayaran sebesar {formatCurrency(payment.monthlyFee)} untuk mengaktifkan akun.
                </p>
                <Button 
                  size="sm" 
                  className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white"
                  onClick={() => router.push('/koperasi/supplier/payment')}
                >
                  Upload Pembayaran
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Produk</p>
                <p className="text-3xl font-bold mt-2">{metrics.totalProducts}</p>
                <p className="text-blue-100 text-xs mt-1">{metrics.activeProducts} aktif</p>
              </div>
              <div className="bg-blue-400 bg-opacity-30 p-3 rounded-full">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Pesanan</p>
                <p className="text-3xl font-bold mt-2">{metrics.totalOrders}</p>
                <p className="text-green-100 text-xs mt-1">{metrics.pendingOrders} pending</p>
              </div>
              <div className="bg-green-400 bg-opacity-30 p-3 rounded-full">
                <ShoppingCart className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Pendapatan Bulan Ini</p>
                <p className="text-2xl font-bold mt-2">{formatCurrency(metrics.monthlyRevenue)}</p>
                <p className="text-purple-100 text-xs mt-1">{metrics.completedOrders} selesai</p>
              </div>
              <div className="bg-purple-400 bg-opacity-30 p-3 rounded-full">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Tingkat Penyelesaian</p>
                <p className="text-3xl font-bold mt-2">{metrics.completionRate}%</p>
                <p className="text-orange-100 text-xs mt-1">dari total pesanan</p>
              </div>
              <div className="bg-orange-400 bg-opacity-30 p-3 rounded-full">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Pesanan Terbaru</h3>
            {recentOrders.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="Belum Ada Pesanan"
                description="Pesanan dari koperasi akan muncul di sini"
              />
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order, index) => (
                  <div 
                    key={order.id || index} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{order.purchaseNumber}</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-sm text-gray-900">{formatCurrency(order.totalAmount)}</p>
                      <StatusBadge 
                        {...(ORDER_STATUS[order.status.toLowerCase() as keyof typeof ORDER_STATUS] || ORDER_STATUS.pending)}
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Performance */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Performa Produk</h3>
            {productPerformance.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Belum Ada Produk"
                description="Tambahkan produk untuk melihat performanya"
                actionLabel="Tambah Produk"
                onAction={() => router.push('/koperasi/supplier/products/add')}
              />
            ) : (
              <div className="space-y-3">
                {productPerformance.map((product, index) => (
                  <div 
                    key={product.id || index} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{product.category}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-sm text-gray-900">{formatCurrency(product.sellPrice)}</p>
                      <p className="text-xs text-gray-600 mt-0.5">Stok: {product.stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
