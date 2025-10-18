"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, CreditCard, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function SupplierDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [supplierProfile, setSupplierProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    paymentStatus: "active",
  });

  useEffect(() => {
    console.log('[Supplier Dashboard] Component mounted');
    const token = localStorage.getItem("token");
    console.log('[Supplier Dashboard] Token exists:', !!token);
    
    if (!token) {
      console.log('[Supplier Dashboard] No token, redirecting to login');
      router.push("/login");
      return;
    }

    // Fetch user info
    console.log('[Supplier Dashboard] Fetching user info...');
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        console.log('[Supplier Dashboard] Auth response:', d);
        if (d.success && d.data) {
          if (d.data.role !== "SUPPLIER") {
            // Redirect to appropriate dashboard
            console.log('[Supplier Dashboard] Not a supplier, redirecting to admin dashboard');
            router.push("/koperasi/dashboard");
            return;
          }
          console.log('[Supplier Dashboard] User is supplier:', d.data);
          setUser(d.data);
          
          // Fetch supplier profile
          console.log('[Supplier Dashboard] Fetching supplier profile...');
          return fetch("/api/supplier/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          console.log('[Supplier Dashboard] Auth failed, redirecting to login');
          router.push("/login");
        }
      })
      .then((r) => r?.json())
      .then((d) => {
        if (d?.success) {
          setSupplierProfile(d.data);
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show registration prompt if no profile
  if (!supplierProfile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Supplier Dashboard</h1>
            <p className="text-gray-600 mt-1">Selamat datang, {user.name}</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Lengkapi Profil Supplier Anda
            </h3>
            <p className="text-gray-600 mb-6">
              Untuk mulai menerima pesanan, silakan lengkapi profil supplier Anda terlebih dahulu.
            </p>
            <Button onClick={() => router.push("/koperasi/supplier/register")}>
              Daftar Sebagai Supplier
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show pending approval status
  if (supplierProfile.status === "PENDING") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Supplier Dashboard</h1>
            <p className="text-gray-600 mt-1">Selamat datang, {user.name}</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Menunggu Persetujuan
            </h3>
            <p className="text-gray-600 mb-6">
              Pendaftaran Anda sedang ditinjau oleh admin. Kami akan menghubungi Anda segera setelah disetujui.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mt-4 text-left">
              <p className="text-sm text-gray-600 mb-2">Informasi Pendaftaran:</p>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Nama Bisnis:</span> {supplierProfile.businessName}</p>
                <p><span className="font-medium">Kategori:</span> {supplierProfile.productCategory}</p>
                <p><span className="font-medium">Status:</span> <span className="text-yellow-600">Menunggu Persetujuan</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Dashboard</h1>
          <p className="text-gray-600 mt-1">{supplierProfile.businessName}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          stats.paymentStatus === "active" 
            ? "bg-green-100 text-green-800" 
            : "bg-red-100 text-red-800"
        }`}>
          {stats.paymentStatus === "active" ? "Payment Active" : "Payment Due"}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingOrders}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  Rp {stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Fee</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">Rp 25,000</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Next Payment Due:</span>
                <span className="font-medium text-gray-900">
                  {supplierProfile.nextPaymentDue 
                    ? new Date(supplierProfile.nextPaymentDue).toLocaleDateString('id-ID')
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Payment:</span>
                <span className="font-medium text-gray-900">
                  {supplierProfile.lastPaymentDate 
                    ? new Date(supplierProfile.lastPaymentDate).toLocaleDateString('id-ID')
                    : 'Belum ada pembayaran'}
                </span>
              </div>
            </div>
            <Button 
              className="w-full mt-4"
              onClick={() => router.push("/koperasi/supplier/payment")}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Make Payment
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/koperasi/supplier/orders")}
              >
                <Package className="h-4 w-4 mr-2" />
                View Orders
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/koperasi/supplier/products")}
              >
                <Package className="h-4 w-4 mr-2" />
                My Products
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/koperasi/supplier/profile")}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
