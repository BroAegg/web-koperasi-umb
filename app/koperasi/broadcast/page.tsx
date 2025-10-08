'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Loading, CardSkeleton } from '@/components/ui/loading';
import { formatDate } from '@/lib/utils';
import { 
  Megaphone, 
  Plus, 
  Send, 
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar
} from 'lucide-react';

interface Broadcast {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'urgent' | 'info' | 'reminder';
  targetAudience: 'all' | 'active_members' | 'unit_specific';
  unitTarget?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  createdAt: string;
  sentAt?: string;
  scheduledAt?: string;
  totalRecipients: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  createdBy: string;
}

export default function BroadcastPage() {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);

  // Mock data - nanti akan diganti dengan data dari API
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([
    {
      id: '1',
      title: 'Pengumuman Rapat Anggota Tahunan',
      message: 'Kepada seluruh anggota koperasi, diinformasikan bahwa Rapat Anggota Tahunan akan dilaksanakan pada tanggal 15 November 2024. Mohon kehadiran semua anggota.',
      type: 'announcement',
      targetAudience: 'all',
      status: 'sent',
      createdAt: '2024-10-01T10:00:00Z',
      sentAt: '2024-10-01T10:30:00Z',
      totalRecipients: 130,
      successfulDeliveries: 125,
      failedDeliveries: 5,
      createdBy: 'Admin Koperasi'
    },
    {
      id: '2',
      title: 'Reminder Pembayaran Simpanan Wajib',
      message: 'Pengingat untuk semua anggota bahwa pembayaran simpanan wajib bulan Oktober akan berakhir pada tanggal 25 Oktober 2024.',
      type: 'reminder',
      targetAudience: 'active_members',
      status: 'sent',
      createdAt: '2024-10-05T09:00:00Z',
      sentAt: '2024-10-05T09:15:00Z',
      totalRecipients: 120,
      successfulDeliveries: 118,
      failedDeliveries: 2,
      createdBy: 'Admin Koperasi'
    },
    {
      id: '3',
      title: 'Info Produk Baru di Toko Koperasi',
      message: 'Toko koperasi telah menambah produk baru: Beras Premium, Minyak Goreng, dan Gula Pasir dengan harga khusus untuk anggota.',
      type: 'info',
      targetAudience: 'all',
      status: 'scheduled',
      createdAt: '2024-10-07T14:00:00Z',
      scheduledAt: '2024-10-08T08:00:00Z',
      totalRecipients: 130,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      createdBy: 'Admin Toko'
    }
  ]);

  const filteredBroadcasts = broadcasts.filter(broadcast =>
    broadcast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    broadcast.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    broadcast.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBroadcasts = broadcasts.length;
  const sentBroadcasts = broadcasts.filter(b => b.status === 'sent').length;
  const totalRecipients = broadcasts.reduce((sum, b) => sum + b.totalRecipients, 0);
  const averageSuccessRate = broadcasts.length > 0 
    ? Math.round((broadcasts.reduce((sum, b) => sum + b.successfulDeliveries, 0) / 
        broadcasts.reduce((sum, b) => sum + b.totalRecipients, 0)) * 100)
    : 0;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'announcement': return 'bg-blue-100 text-blue-700';
      case 'reminder': return 'bg-amber-100 text-amber-700';
      case 'info': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleViewBroadcast = (broadcast: Broadcast) => {
    setSelectedBroadcast(broadcast);
  };

  const handleEditBroadcast = (broadcast: Broadcast) => {
    console.log('Edit broadcast:', broadcast);
  };

  const handleDeleteBroadcast = (broadcastId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus broadcast ini?')) {
      setBroadcasts(broadcasts.filter(b => b.id !== broadcastId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Broadcast</h1>
          <p className="text-gray-600 mt-1">Kelola pengumuman dan komunikasi kepada anggota</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Jadwal Broadcast
          </Button>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Buat Broadcast
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Broadcast</p>
                <h3 className="text-2xl font-bold text-gray-900">{totalBroadcasts}</h3>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Megaphone className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Terkirim</p>
                <h3 className="text-2xl font-bold text-gray-900">{sentBroadcasts}</h3>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <Send className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Penerima</p>
                <h3 className="text-2xl font-bold text-gray-900">{totalRecipients}</h3>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <h3 className="text-2xl font-bold text-gray-900">{averageSuccessRate}%</h3>
              </div>
              <div className="p-3 rounded-lg bg-amber-50">
                <CheckCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Cari broadcast berdasarkan judul, pesan, atau tipe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-gray-400" />}
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Broadcasts Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">
            Daftar Broadcast ({filteredBroadcasts.length})
          </h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul & Tipe</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Penerima</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBroadcasts.map((broadcast) => (
                  <TableRow key={broadcast.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{broadcast.title}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getTypeColor(broadcast.type)}`}>
                          {broadcast.type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-gray-900">
                          {broadcast.targetAudience === 'all' ? 'Semua Anggota' :
                           broadcast.targetAudience === 'active_members' ? 'Anggota Aktif' :
                           `Unit ${broadcast.unitTarget}`}
                        </p>
                        <p className="text-xs text-gray-500">{broadcast.totalRecipients} penerima</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(broadcast.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(broadcast.status)}`}>
                          {broadcast.status === 'sent' ? 'Terkirim' :
                           broadcast.status === 'scheduled' ? 'Terjadwal' :
                           broadcast.status === 'draft' ? 'Draft' : 'Gagal'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="text-green-600 font-medium">✓ {broadcast.successfulDeliveries}</p>
                        {broadcast.failedDeliveries > 0 && (
                          <p className="text-red-600">✗ {broadcast.failedDeliveries}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="text-gray-900">
                          {formatDate(new Date(broadcast.createdAt))}
                        </p>
                        {broadcast.sentAt && (
                          <p className="text-gray-500">
                            Terkirim: {formatDate(new Date(broadcast.sentAt))}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewBroadcast(broadcast)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditBroadcast(broadcast)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleDeleteBroadcast(broadcast.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Broadcast Detail Modal */}
      {selectedBroadcast && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Detail Broadcast</h3>
              <Button variant="outline" onClick={() => setSelectedBroadcast(null)}>
                ✕
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Informasi Broadcast</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Judul</label>
                    <p className="font-medium">{selectedBroadcast.title}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Tipe</label>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedBroadcast.type)}`}>
                      {selectedBroadcast.type}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Target Audience</label>
                    <p className="font-medium">
                      {selectedBroadcast.targetAudience === 'all' ? 'Semua Anggota' :
                       selectedBroadcast.targetAudience === 'active_members' ? 'Anggota Aktif' :
                       `Unit ${selectedBroadcast.unitTarget}`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Status</label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedBroadcast.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBroadcast.status)}`}>
                        {selectedBroadcast.status === 'sent' ? 'Terkirim' :
                         selectedBroadcast.status === 'scheduled' ? 'Terjadwal' :
                         selectedBroadcast.status === 'draft' ? 'Draft' : 'Gagal'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Pesan</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900">{selectedBroadcast.message}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Statistik Pengiriman</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600">Total Penerima</p>
                    <p className="text-lg font-bold text-blue-700">{selectedBroadcast.totalRecipients}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600">Berhasil Terkirim</p>
                    <p className="text-lg font-bold text-green-700">{selectedBroadcast.successfulDeliveries}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-600">Gagal Terkirim</p>
                    <p className="text-lg font-bold text-red-700">{selectedBroadcast.failedDeliveries}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Dibuat:</span> {formatDate(new Date(selectedBroadcast.createdAt))} oleh {selectedBroadcast.createdBy}</p>
                  {selectedBroadcast.scheduledAt && (
                    <p><span className="text-gray-600">Dijadwalkan:</span> {formatDate(new Date(selectedBroadcast.scheduledAt))}</p>
                  )}
                  {selectedBroadcast.sentAt && (
                    <p><span className="text-gray-600">Terkirim:</span> {formatDate(new Date(selectedBroadcast.sentAt))}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
