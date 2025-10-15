"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bell,
  Calendar,
  ChevronDown,
  ChevronUp
} from "lucide-react";

// Dummy data broadcast
const dummyBroadcasts = [
  {
    id: 1,
    title: "Pengumuman Pembayaran Supplier",
    content: "Mohon segera melengkapi data rekening untuk proses pembayaran bulan ini. Batas waktu pengisian data adalah tanggal 20 Januari 2025. Pembayaran akan diproses paling lambat 3 hari kerja setelah data lengkap diterima.",
    date: "2025-01-15",
    time: "09:30",
    type: "important",
    isRead: false,
  },
  {
    id: 2,
    title: "Jadwal Pengiriman Produk Januari 2025",
    content: "Pengiriman produk untuk bulan Januari akan dilakukan setiap Senin dan Kamis. Mohon pastikan produk siap di hari pengiriman. Jika ada kendala, hubungi admin minimal H-1.",
    date: "2025-01-14",
    time: "14:15",
    type: "info",
    isRead: true,
  },
  {
    id: 3,
    title: "Update Sistem Koperasi",
    content: "Sistem koperasi akan mengalami maintenance pada tanggal 18 Januari 2025 pukul 01:00 - 05:00 WIB. Selama masa maintenance, sistem tidak dapat diakses.",
    date: "2025-01-13",
    time: "16:45",
    type: "warning",
    isRead: true,
  },
  {
    id: 4,
    title: "Peningkatan Kualitas Produk",
    content: "Kami menghimbau seluruh supplier untuk memastikan kualitas produk sesuai standar. Produk yang tidak memenuhi standar akan dikembalikan tanpa pembayaran.",
    date: "2025-01-12",
    time: "10:00",
    type: "important",
    isRead: true,
  },
  {
    id: 5,
    title: "Promo Akhir Tahun",
    content: "Koperasi mengadakan promo akhir tahun dengan diskon hingga 20% untuk produk tertentu. Supplier yang berpartisipasi akan mendapatkan bonus komisi tambahan 5%.",
    date: "2025-01-10",
    time: "11:20",
    type: "info",
    isRead: true,
  },
];

export default function SupplierBroadcast() {
  const [broadcasts, setBroadcasts] = useState(dummyBroadcasts);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleToggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
    
    // Mark as read when expanded
    setBroadcasts(broadcasts.map(b => 
      b.id === id ? { ...b, isRead: true } : b
    ));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "important":
        return { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-700", icon: "text-red-600" };
      case "warning":
        return { bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-700", icon: "text-yellow-600" };
      default:
        return { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700", icon: "text-blue-600" };
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "important":
        return "Penting";
      case "warning":
        return "Peringatan";
      default:
        return "Informasi";
    }
  };

  const unreadCount = broadcasts.filter(b => !b.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Broadcast Koperasi</h1>
          <p className="text-slate-600 mt-1">Pengumuman dan informasi dari koperasi</p>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl">
            <Bell className="w-5 h-5" />
            <span className="font-medium">{unreadCount} pesan belum dibaca</span>
          </div>
        )}
      </div>

      {/* Info Card */}
      <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Bell className="w-8 h-8 mt-1" />
            <div>
              <h3 className="text-xl font-bold">Informasi Penting</h3>
              <p className="text-blue-100 mt-2">
                Halaman ini menampilkan pengumuman resmi dari koperasi. Pastikan Anda membaca semua pengumuman penting.
                Anda tidak dapat membalas pengumuman ini.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Broadcasts List */}
      <div className="space-y-4">
        {broadcasts.map((broadcast) => {
          const colors = getTypeColor(broadcast.type);
          const isExpanded = expandedId === broadcast.id;
          
          return (
            <Card 
              key={broadcast.id}
              className={`rounded-2xl shadow-md border-2 ${colors.border} ${colors.bg} transition-all hover:shadow-lg`}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {!broadcast.isRead && (
                          <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                          {getTypeLabel(broadcast.type)}
                        </span>
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          {broadcast.date} • {broadcast.time}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">
                        {broadcast.title}
                      </h3>
                    </div>
                    <Button
                      onClick={() => handleToggleExpand(broadcast.id)}
                      size="sm"
                      variant="outline"
                      className="rounded-lg ml-4"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </Button>
                  </div>

                  {/* Content Preview */}
                  {!isExpanded && (
                    <p className="text-slate-700 line-clamp-2">
                      {broadcast.content}
                    </p>
                  )}

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-slate-200">
                      <div className={`p-4 rounded-xl bg-white`}>
                        <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                          {broadcast.content}
                        </p>
                      </div>
                      <div className="mt-4 text-sm text-slate-600">
                        <p>Dikirim oleh: <span className="font-medium">Admin Koperasi</span></p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {broadcasts.length === 0 && (
        <Card className="rounded-2xl shadow-md border-0">
          <CardContent className="p-12 text-center">
            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Tidak Ada Pengumuman</h3>
            <p className="text-slate-600">Belum ada pengumuman dari koperasi saat ini.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
