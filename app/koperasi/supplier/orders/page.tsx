"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Package,
  DollarSign
} from "lucide-react";

// Dummy data pesanan
const dummyOrders = [
  { 
    id: "ORD-001", 
    product: "Beras Premium 5kg", 
    quantity: 10, 
    total: 750000, 
    status: "pending", 
    date: "2025-01-15",
    customer: "Toko Berkah Jaya",
    address: "Jl. Merdeka No. 123, Jakarta",
    phone: "081234567890"
  },
  { 
    id: "ORD-002", 
    product: "Minyak Goreng 2L", 
    quantity: 20, 
    total: 640000, 
    status: "processing", 
    date: "2025-01-15",
    customer: "Warung Sari",
    address: "Jl. Sudirman No. 45, Jakarta",
    phone: "081234567891"
  },
  { 
    id: "ORD-003", 
    product: "Gula Pasir 1kg", 
    quantity: 50, 
    total: 750000, 
    status: "shipped", 
    date: "2025-01-14",
    customer: "Toko Makmur",
    address: "Jl. Gatot Subroto No. 78, Jakarta",
    phone: "081234567892"
  },
  { 
    id: "ORD-004", 
    product: "Telur Ayam 1kg", 
    quantity: 30, 
    total: 840000, 
    status: "completed", 
    date: "2025-01-13",
    customer: "Pasar Segar",
    address: "Jl. Ahmad Yani No. 90, Jakarta",
    phone: "081234567893"
  },
  { 
    id: "ORD-005", 
    product: "Susu UHT 1L", 
    quantity: 40, 
    total: 720000, 
    status: "pending", 
    date: "2025-01-15",
    customer: "Mini Market Sejahtera",
    address: "Jl. Diponegoro No. 12, Jakarta",
    phone: "081234567894"
  },
  { 
    id: "ORD-006", 
    product: "Indomie Goreng 5pcs", 
    quantity: 100, 
    total: 1400000, 
    status: "processing", 
    date: "2025-01-14",
    customer: "Warung Bahagia",
    address: "Jl. Veteran No. 34, Jakarta",
    phone: "081234567895"
  },
];

const statusOptions = [
  { value: "all", label: "Semua Status", color: "slate" },
  { value: "pending", label: "Menunggu", color: "yellow" },
  { value: "processing", label: "Diproses", color: "blue" },
  { value: "shipped", label: "Dikirim", color: "purple" },
  { value: "completed", label: "Selesai", color: "green" },
];

const statusFlow = ["pending", "processing", "shipped", "completed"];

export default function SupplierOrders() {
  const [orders, setOrders] = useState(dummyOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter pesanan
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const statusConfig: any = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },
      processing: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
      shipped: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
      completed: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
    };
    return statusConfig[status] || statusConfig.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      pending: "Menunggu",
      processing: "Diproses",
      shipped: "Dikirim",
      completed: "Selesai",
    };
    return labels[status] || status;
  };

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handleViewDetail = (order: any) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handlePrintInvoice = (order: any) => {
    alert(`Mencetak invoice untuk pesanan ${order.id}...`);
    // Implementasi print invoice di sini
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Pesanan Masuk</h1>
          <p className="text-slate-600 mt-1">Kelola dan update status pesanan</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statusOptions.filter(s => s.value !== "all").map((status) => {
          const count = orders.filter(o => o.status === status.value).length;
          const colors = getStatusColor(status.value);
          return (
            <Card key={status.value} className={`rounded-2xl shadow-md border-2 ${colors.border} ${colors.bg}`}>
              <CardContent className="p-4">
                <p className={`text-sm font-medium ${colors.text}`}>{status.label}</p>
                <p className={`text-3xl font-bold ${colors.text} mt-2`}>{count}</p>
              </CardContent>
            </Card>
          );
        })}
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
                placeholder="Cari ID pesanan, produk, atau pelanggan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl border-slate-300"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setStatusFilter(status.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    statusFilter === status.value
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="rounded-2xl shadow-md border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">ID Pesanan</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Produk</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Pelanggan</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Jumlah</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedOrders.map((order) => {
                  const colors = getStatusColor(order.status);
                  const currentIndex = statusFlow.indexOf(order.status);
                  const canProgress = currentIndex < statusFlow.length - 1;
                  
                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-800">{order.id}</p>
                          <p className="text-sm text-slate-500 flex items-center mt-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            {order.date}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">{order.product}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">{order.customer}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                          {order.quantity} unit
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            onClick={() => handleViewDetail(order)}
                            size="sm"
                            variant="outline"
                            className="rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {canProgress && (
                            <select
                              onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                              value={order.status}
                              className="px-3 py-1 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                            >
                              {statusFlow.slice(currentIndex).map((status) => (
                                <option key={status} value={status}>
                                  {getStatusLabel(status)}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredOrders.length)} dari {filteredOrders.length} pesanan
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
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
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

      {/* Modal Detail Pesanan */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl rounded-2xl shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Detail Pesanan</h2>
                  <p className="text-slate-600">{selectedOrder.id}</p>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                  <span className="text-slate-700 font-medium">Status Pesanan</span>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedOrder.status).bg} ${getStatusColor(selectedOrder.status).text}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>

                {/* Info Produk */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <Package className="w-8 h-8 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-lg">{selectedOrder.product}</p>
                      <p className="text-slate-600">Jumlah: {selectedOrder.quantity} unit</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <span className="text-slate-700 font-medium">Total Pembayaran</span>
                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>

                {/* Info Pelanggan */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800">Informasi Pelanggan</h3>
                  <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Nama</span>
                      <span className="font-medium text-slate-800">{selectedOrder.customer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Telepon</span>
                      <span className="font-medium text-slate-800">{selectedOrder.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Alamat</span>
                      <span className="font-medium text-slate-800 text-right">{selectedOrder.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tanggal Pesanan</span>
                      <span className="font-medium text-slate-800">{selectedOrder.date}</span>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between space-x-3 pt-4">
                  <Button
                    onClick={() => handlePrintInvoice(selectedOrder)}
                    variant="outline"
                    className="rounded-xl flex-1"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Cetak Invoice
                  </Button>
                  <Button
                    onClick={() => setShowDetailModal(false)}
                    className="bg-blue-600 hover:bg-blue-700 rounded-xl flex-1"
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
