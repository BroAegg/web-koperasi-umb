"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Package, 
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  User
} from "lucide-react";

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
  product: {
    id: string;
    name: string;
    stock: number;
    unit: string;
    sellPrice: number;
    categories: {
      name: string;
    };
  };
  supplier: {
    id: string;
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    code: string;
    status: string;
  };
  reviewer: {
    name: string;
  } | null;
}

export default function AdminRestockRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<RestockRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RestockRequest[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RestockRequest | null>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [note, setNote] = useState("");
  const [qtyApproved, setQtyApproved] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [activeFilter, requests]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/stock/requests");
      const data = await response.json();

      if (data.success) {
        setRequests(data.data.requests || []);
        setSummary(data.data.summary);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (activeFilter === "ALL") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter((r) => r.status === activeFilter));
    }
  };

  const handleAction = (request: RestockRequest, type: "APPROVE" | "REJECT") => {
    setSelectedRequest(request);
    setActionType(type);
    setNote("");
    setQtyApproved(request.qtyRequested.toString());
    setShowActionModal(true);
  };

  const submitAction = async () => {
    if (!selectedRequest) return;

    if (actionType === "REJECT" && !note) {
      alert("Rejection reason is required");
      return;
    }

    if (actionType === "APPROVE") {
      const qty = parseInt(qtyApproved);
      if (qty <= 0) {
        alert("Approved quantity must be greater than 0");
        return;
      }
    }

    try {
      setProcessing(true);

      const response = await fetch("/api/admin/stock/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          action: actionType,
          note: note || null,
          qtyApproved: actionType === "APPROVE" ? parseInt(qtyApproved) : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setShowActionModal(false);
        fetchRequests();
      } else {
        alert(data.error || "Failed to process request");
      }
    } catch (error) {
      console.error("Error processing request:", error);
      alert("Failed to process request");
    } finally {
      setProcessing(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>

          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              Restock Requests
            </h1>
            <p className="text-slate-600 mt-2">
              Kelola permintaan restock dari supplier
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card 
              className={`cursor-pointer transition-all ${activeFilter === "ALL" ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => setActiveFilter("ALL")}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{summary.total}</div>
                  <div className="text-sm text-slate-600">Total Requests</div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${activeFilter === "PENDING" ? "ring-2 ring-yellow-500" : ""}`}
              onClick={() => setActiveFilter("PENDING")}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{summary.pending}</div>
                  <div className="text-sm text-slate-600">Pending</div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${activeFilter === "APPROVED" ? "ring-2 ring-green-500" : ""}`}
              onClick={() => setActiveFilter("APPROVED")}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{summary.approved}</div>
                  <div className="text-sm text-slate-600">Approved</div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${activeFilter === "REJECTED" ? "ring-2 ring-red-500" : ""}`}
              onClick={() => setActiveFilter("REJECTED")}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{summary.rejected}</div>
                  <div className="text-sm text-slate-600">Rejected</div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${activeFilter === "COMPLETED" ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => setActiveFilter("COMPLETED")}
            >
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

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-slate-500">
                  {activeFilter === "ALL" 
                    ? "Belum ada permintaan restock" 
                    : `Tidak ada permintaan dengan status ${activeFilter}`}
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className="border border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Request Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {request.product.name}
                        </h3>
                        {getStatusBadge(request.status)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-xs text-slate-600">Category</span>
                          <div className="font-medium text-slate-900">{request.product.categories.name}</div>
                        </div>
                        <div>
                          <span className="text-xs text-slate-600">Current Stock</span>
                          <div className="font-medium text-slate-900">
                            {request.currentStock} {request.product.unit}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-slate-600">Requested Qty</span>
                          <div className="font-medium text-blue-600">
                            {request.qtyRequested} {request.product.unit}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-slate-600">New Stock (if approved)</span>
                          <div className="font-medium text-green-600">
                            {request.currentStock + request.qtyRequested} {request.product.unit}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-slate-600">Requested At</span>
                          <div className="font-medium text-slate-900">
                            {new Date(request.requestedAt).toLocaleString('id-ID')}
                          </div>
                        </div>
                        {request.reviewedAt && (
                          <div>
                            <span className="text-xs text-slate-600">Reviewed At</span>
                            <div className="font-medium text-slate-900">
                              {new Date(request.reviewedAt).toLocaleString('id-ID')}
                            </div>
                          </div>
                        )}
                      </div>

                      {request.reason && (
                        <div className="p-3 bg-slate-50 rounded mb-3">
                          <span className="text-xs text-slate-600 font-medium">Reason:</span>
                          <p className="text-sm text-slate-900 mt-1">{request.reason}</p>
                        </div>
                      )}

                      {request.status === 'REJECTED' && request.rejectionReason && (
                        <div className="p-3 bg-red-50 rounded border border-red-200 mb-3">
                          <span className="text-xs text-red-600 font-medium">Rejection Reason:</span>
                          <p className="text-sm text-red-900 mt-1">{request.rejectionReason}</p>
                        </div>
                      )}

                      {request.note && (
                        <div className="p-3 bg-blue-50 rounded mb-3">
                          <span className="text-xs text-blue-600 font-medium">Admin Note:</span>
                          <p className="text-sm text-blue-900 mt-1">{request.note}</p>
                        </div>
                      )}

                      {request.reviewer && (
                        <div className="text-xs text-slate-500">
                          Reviewed by: {request.reviewer.name}
                        </div>
                      )}
                    </div>

                    {/* Right: Supplier Info & Actions */}
                    <div className="lg:w-80 space-y-4">
                      <Card className="bg-slate-50">
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Supplier Info
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-slate-600">Business:</span>
                              <div className="font-medium text-slate-900">{request.supplier.businessName}</div>
                            </div>
                            <div>
                              <span className="text-slate-600">Owner:</span>
                              <div className="text-slate-900">{request.supplier.ownerName}</div>
                            </div>
                            <div>
                              <span className="text-slate-600">Code:</span>
                              <div className="text-slate-900 font-mono">{request.supplier.code}</div>
                            </div>
                            <div>
                              <span className="text-slate-600">Email:</span>
                              <div className="text-slate-900">{request.supplier.email}</div>
                            </div>
                            <div>
                              <span className="text-slate-600">Phone:</span>
                              <div className="text-slate-900">{request.supplier.phone}</div>
                            </div>
                            <div>
                              <span className="text-slate-600">Status:</span>
                              <div className="font-medium">
                                <span className={`px-2 py-1 text-xs rounded ${
                                  request.supplier.status === 'ACTIVE' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {request.supplier.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {request.status === 'PENDING' && (
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => handleAction(request, "APPROVE")}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleAction(request, "REJECT")}
                            variant="danger"
                            className="w-full"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Action Modal */}
        {showActionModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>
                  {actionType === "APPROVE" ? "Approve Restock Request" : "Reject Restock Request"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Product
                    </label>
                    <div className="font-medium text-slate-900">{selectedRequest.product.name}</div>
                    <div className="text-sm text-slate-500">
                      Supplier: {selectedRequest.supplier.businessName}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Current Stock
                    </label>
                    <div className="text-slate-900">{selectedRequest.currentStock} {selectedRequest.product.unit}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Requested Quantity
                    </label>
                    <div className="text-blue-600 font-medium">
                      {selectedRequest.qtyRequested} {selectedRequest.product.unit}
                    </div>
                  </div>

                  {actionType === "APPROVE" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Approved Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={qtyApproved}
                        onChange={(e) => setQtyApproved(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        New stock will be: {selectedRequest.currentStock + parseInt(qtyApproved || "0")} {selectedRequest.product.unit}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {actionType === "APPROVE" ? "Note (Optional)" : "Rejection Reason"} 
                      {actionType === "REJECT" && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder={actionType === "APPROVE" ? "Add optional note..." : "Why are you rejecting this request?"}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowActionModal(false)}
                      className="flex-1"
                      disabled={processing}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={submitAction}
                      className={`flex-1 ${
                        actionType === "APPROVE" 
                          ? "bg-green-600 hover:bg-green-700" 
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                      disabled={processing || (actionType === "REJECT" && !note)}
                    >
                      {processing ? "Processing..." : actionType === "APPROVE" ? "Approve" : "Reject"}
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
