"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Users, Package, TrendingUp } from "lucide-react";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    pendingSuppliers: 0,
    activeSuppliers: 0,
    totalRevenue: 0,
    pendingPayments: 0,
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
          if (d.data.role !== "SUPER_ADMIN") {
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
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Selamat datang, {user.name}</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Supplier Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingSuppliers}</p>
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
                <p className="text-sm font-medium text-gray-600">Supplier Aktif</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.activeSuppliers}</p>
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
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  Rp {stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingPayments}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Supplier Registrations</p>
                    <p className="text-xs text-gray-600">{stats.pendingSuppliers} menunggu</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => router.push("/koperasi/super-admin/approvals")}>
                  Review
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment Verifications</p>
                    <p className="text-xs text-gray-600">{stats.pendingPayments} menunggu</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => router.push("/koperasi/super-admin/payments")}>
                  Verify
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/koperasi/super-admin/suppliers")}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Suppliers
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/koperasi/financial")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Financial Reports
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/koperasi/inventory")}
              >
                <Package className="h-4 w-4 mr-2" />
                Inventory Overview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
