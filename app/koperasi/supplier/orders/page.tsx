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
import { StatusBadge, EmptyState, Pagination } from "@/components/supplier";
import { ORDER_STATUS, formatCurrency, formatDate, EMPTY_STATES } from "@/lib/supplier-constants";

// Dummy data pesanan
const dummyOrders = [
  { 
    id: "ORD-001", 
    product: "Beras Premium 5kg", 
    quantity: 10, 
    total: 750000, 
    status: "pending", 
    date: "2025-01-15"
  },
  { 
    id: "ORD-002", 
    product: "Minyak Goreng 2L", 
    quantity: 20, 
    total: 640000, 
    status: "processing", 
    date: "2025-01-15"
  },
  { 
    id: "ORD-003", 
    product: "Gula Pasir 1kg", 
    quantity: 50, 
    total: 750000, 
    status: "shipped", 
    date: "2025-01-14"
  },
  { 
    id: "ORD-004", 
    product: "Telur Ayam 1kg", 
    quantity: 30, 
    total: 840000, 
    status: "completed", 
    date: "2025-01-13"
  },
  { 
    id: "ORD-005", 
    product: "Susu UHT 1L", 
    quantity: 40, 
    total: 720000, 
    status: "pending", 
    date: "2025-01-15"
  },
  { 
    id: "ORD-006", 
    product: "Indomie Goreng 5pcs", 
    quantity: 100, 
    total: 1400000, 
    status: "processing", 
    date: "2025-01-14"
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
      order.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const getStatusLabel = (status: string) => {
    return ORDER_STATUS[status as keyof typeof ORDER_STATUS]?.label || status;
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
    <div className="space-y-4 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pesanan Masuk</h1>
          <p className="text-gray-600 mt-1">Kelola dan update status pesanan</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statusOptions.filter(s => s.value !== "all").map((status) => {
          const count = orders.filter(o => o.status === status.value).length;
          const statusConfig = ORDER_STATUS[status.value as keyof typeof ORDER_STATUS] || ORDER_STATUS.pending;
          const Icon = statusConfig.icon;
          
          return (
            <Card key={status.value} className={`rounded-xl shadow-sm border ${statusConfig.color.split(' ')[2]}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{status.label}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{count}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${statusConfig.color.split(' ')[0]} bg-opacity-20`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari ID pesanan atau produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-lg border-gray-300"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setStatusFilter(status.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    statusFilter === status.value
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table/Empty State */}
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Package}
                title={searchTerm || statusFilter !== "all" ? EMPTY_STATES.search.title : EMPTY_STATES.orders.title}
                description={searchTerm || statusFilter !== "all" ? EMPTY_STATES.search.description : EMPTY_STATES.orders.description}
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID Pesanan</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Produk</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Jumlah</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedOrders.map((order) => {
                      const currentIndex = statusFlow.indexOf(order.status);
                      const canProgress = currentIndex < statusFlow.length - 1;
                      
                      return (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{order.id}</p>
                              <p className="text-xs text-gray-500 flex items-center mt-1">
                                <Calendar className="w-3 h-3 mr-1" />
                                {order.date}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900 text-sm">{order.product}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {order.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900 text-sm">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge 
                              {...(ORDER_STATUS[order.status as keyof typeof ORDER_STATUS] || ORDER_STATUS.pending)}
                              size="sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center space-x-2">
                              <Button
                                onClick={() => handleViewDetail(order)}
                                size="sm"
                                variant="outline"
                                className="rounded-lg p-2"
                                title="Lihat Detail"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {canProgress && (
                                <select
                                  onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                  value={order.status}
                                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
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
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredOrders.length}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal Detail Pesanan */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl rounded-xl shadow-2xl border-0">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Detail Pesanan</h2>
                  <p className="text-gray-600 text-sm mt-1">{selectedOrder.id}</p>
                </div>
                <button 
                  onClick={() => setShowDetailModal(false)} 
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <span className="text-gray-700 font-medium">Status Pesanan</span>
                  <StatusBadge 
                    {...(ORDER_STATUS[selectedOrder.status as keyof typeof ORDER_STATUS] || ORDER_STATUS.pending)}
                  />
                </div>

                {/* Info Produk */}
                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-lg">{selectedOrder.product}</p>
                      <p className="text-gray-600">Jumlah: {selectedOrder.quantity} unit</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-gray-700 font-medium">Total Pembayaran</span>
                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>

                {/* Info Pesanan */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Informasi Pesanan</h3>
                  <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tanggal Pesanan</span>
                      <span className="font-medium text-gray-900">{selectedOrder.date}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status</span>
                      <StatusBadge 
                        {...(ORDER_STATUS[selectedOrder.status as keyof typeof ORDER_STATUS] || ORDER_STATUS.pending)}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={() => handlePrintInvoice(selectedOrder)}
                    variant="outline"
                    className="rounded-lg flex-1 flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Cetak Invoice
                  </Button>
                  <Button
                    onClick={() => setShowDetailModal(false)}
                    className="bg-blue-600 hover:bg-blue-700 rounded-lg flex-1"
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
