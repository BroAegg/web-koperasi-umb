"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    lowStockItems: 0,
    todaysSales: 0,
    pendingOrders: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch user info
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          if (d.data.role !== "ADMIN") {
            // Redirect to appropriate dashboard
            router.push("/koperasi/dashboard");
            return;
          }
          setUser(d.data);
        } else {
          router.push("/login");
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Selamat datang, {user.name}</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.lowStockItems}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Sales</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  Rp {stats.todaysSales.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
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
                <ShoppingCart className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Management</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/koperasi/inventory")}
              >
                <Package className="h-4 w-4 mr-2" />
                Manage Inventory
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/koperasi/admin/stock-in")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Record Stock In
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/koperasi/admin/stock-out")}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Record Stock Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transactions</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/koperasi/financial")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Transactions
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/koperasi/admin/payments")}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Process Payments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
