"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, InfoBanner } from "@/components/ui/tooltip";
import { 
  ArrowLeft, 
  Package, 
  Plus, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  stock: number;
  threshold: number;
  unit: string;
  sellPrice: number;
  categories: {
    name: string;
  };
}

interface RestockRequest {
  id: string;
  qtyRequested: number;
  currentStock: number;
  reason: string | null;
  status: string;
  requestedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  note: string | null;
  product: Product;
  reviewer: {
    name: string;
  } | null;
}

export default function SupplierStockPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [requests, setRequests] = useState<RestockRequest[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qtyRequested, setQtyRequested] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const productsRes = await fetch("/api/supplier/products");
      const productsData = await productsRes.json();
      
      if (productsData.success) {
        setProducts(productsData.data || []);
      }

      // Fetch restock requests
      const requestsRes = await fetch("/api/supplier/products/restock");
      const requestsData = await requestsRes.json();
      
      if (requestsData.success) {
        setRequests(requestsData.data.requests || []);
        setSummary(requestsData.data.summary);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRestock = (product: Product) => {
    setSelectedProduct(product);
    setQtyRequested("");
    setReason("");
    setShowRequestModal(true);
  };

  const submitRestockRequest = async () => {
    if (!selectedProduct || !qtyRequested) {
      alert("Quantity is required");
      return;
    }

    const qty = parseInt(qtyRequested);
    if (qty <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/supplier/products/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          qtyRequested: qty,
          reason: reason || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Permintaan stok berhasil diajukan!");
        setShowRequestModal(false);
        fetchData();
      } else {
        alert(data.error || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Gagal mengajukan permintaan stok");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "APPROVED":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      case "COMPLETED":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 rounded">{status}</span>;
    }
  };

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock === 0) {
      return <span className="text-red-600 font-medium">Stok Habis</span>;
    } else if (stock <= threshold) {
      return <span className="text-yellow-600 font-medium">Stok Menipis</span>;
    } else {
      return <span className="text-green-600 font-medium">Stok Tersedia</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 space-y-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-2"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2 md:gap-3">
                <Package className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                Manajemen Stok
              </h1>
              <p className="text-sm md:text-base text-slate-600 mt-1 md:mt-2">
                Kelola stok produk dan ajukan permintaan restock
              </p>
            </div>
          </div>

          <InfoBanner
            type="tip"
            title="💡 Cara Menggunakan"
            message="Ajukan permintaan stok saat produk Anda menipis. Admin akan meninjau dan menyetujui permintaan Anda."
          />
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{summary.total}</div>
                  <div className="text-sm text-slate-600">Total Permintaan</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{summary.pending}</div>
                  <div className="text-sm text-slate-600">Pending</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{summary.approved}</div>
                  <div className="text-sm text-slate-600">Approved</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{summary.rejected}</div>
                  <div className="text-sm text-slate-600">Rejected</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{summary.completed}</div>
                  <div className="text-sm text-slate-600">Completed</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products List */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Produk Anda</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Belum ada produk. Ajukan produk baru terlebih dahulu.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Produk</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Kategori</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Stock</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Threshold</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{product.name}</div>
                          <div className="text-sm text-slate-500">Rp {product.sellPrice.toLocaleString()}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{product.categories.name}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-medium text-slate-900">{product.stock} {product.unit}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">{product.threshold}</td>
                        <td className="px-4 py-3 text-center">
                          {getStockStatus(product.stock, product.threshold)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            size="sm"
                            onClick={() => handleRequestRestock(product)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Request Restock
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Restock Requests History */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Permintaan Restock</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Belum ada permintaan restock
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <Card key={request.id} className="border border-slate-200">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900">{request.product.name}</h3>
                            {getStatusBadge(request.status)}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-slate-600">Current Stock:</span>
                              <div className="font-medium text-slate-900">{request.currentStock} {request.product.unit}</div>
                            </div>
                            <div>
                              <span className="text-slate-600">Requested:</span>
                              <div className="font-medium text-slate-900">{request.qtyRequested} {request.product.unit}</div>
                            </div>
                            <div>
                              <span className="text-slate-600">Requested At:</span>
                              <div className="font-medium text-slate-900">
                                {new Date(request.requestedAt).toLocaleDateString('id-ID')}
                              </div>
                            </div>
                            {request.reviewedAt && (
                              <div>
                                <span className="text-slate-600">Reviewed At:</span>
                                <div className="font-medium text-slate-900">
                                  {new Date(request.reviewedAt).toLocaleDateString('id-ID')}
                                </div>
                              </div>
                            )}
                          </div>

                          {request.reason && (
                            <div className="mt-3 p-3 bg-slate-50 rounded">
                              <span className="text-xs text-slate-600">Reason:</span>
                              <p className="text-sm text-slate-900 mt-1">{request.reason}</p>
                            </div>
                          )}

                          {request.status === 'REJECTED' && request.rejectionReason && (
                            <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                              <span className="text-xs text-red-600 font-medium">Rejection Reason:</span>
                              <p className="text-sm text-red-900 mt-1">{request.rejectionReason}</p>
                            </div>
                          )}

                          {request.note && (
                            <div className="mt-3 p-3 bg-blue-50 rounded">
                              <span className="text-xs text-blue-600">Admin Note:</span>
                              <p className="text-sm text-blue-900 mt-1">{request.note}</p>
                            </div>
                          )}

                          {request.reviewer && (
                            <div className="mt-2 text-xs text-slate-500">
                              Reviewed by: {request.reviewer.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Modal */}
        {showRequestModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Request Restock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Product
                    </label>
                    <div className="font-medium text-slate-900">{selectedProduct.name}</div>
                    <div className="text-sm text-slate-500">
                      Current Stock: {selectedProduct.stock} {selectedProduct.unit}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Quantity Requested <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={qtyRequested}
                      onChange={(e) => setQtyRequested(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter quantity"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Reason (Optional)
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Why do you need to restock?"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowRequestModal(false)}
                      className="flex-1"
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={submitRestockRequest}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={submitting || !qtyRequested}
                    >
                      {submitting ? "Submitting..." : "Submit Request"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
