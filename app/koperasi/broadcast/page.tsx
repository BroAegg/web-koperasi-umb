'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Loading, CardSkeleton } from '@/components/ui/loading';
import { formatDate } from '@/lib/utils';
import { useNotification } from '@/lib/notification-context';
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
  Calendar,
  X
} from 'lucide-react';

interface Broadcast {
  id: string;
  title: string;
  message: string;
  type: 'ANNOUNCEMENT' | 'URGENT' | 'INFO' | 'REMINDER';
  targetAudience: 'ALL' | 'ACTIVE_MEMBERS' | 'UNIT_SPECIFIC';
  unitTarget?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'FAILED';
  createdAt: string;
  sentAt?: string;
  scheduledAt?: string;
  totalRecipients: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

interface NewBroadcast {
  title: string;
  message: string;
  type: string;
  targetAudience: string;
  unitTarget: string;
  scheduledAt: string;
}

export default function BroadcastPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error, warning, confirm } = useNotification();

  const [newBroadcast, setNewBroadcast] = useState<NewBroadcast>({
    title: '',
    message: '',
    type: 'INFO',
    targetAudience: 'ALL',
    unitTarget: '',
    scheduledAt: '',
  });

  // Fetch broadcasts from API
  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/broadcasts');
      const result = await response.json();
      
      if (result.success) {
        setBroadcasts(result.data);
      } else {
        error('Gagal Memuat Data', result.error || 'Terjadi kesalahan saat memuat data broadcast');
      }
    } catch (err) {
      console.error('Error fetching broadcasts:', err);
      error('Kesalahan Server', 'Terjadi kesalahan pada server, silakan coba lagi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const filteredBroadcasts = broadcasts.filter(broadcast =>
    broadcast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    broadcast.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    broadcast.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBroadcasts = broadcasts.length;
  const sentBroadcasts = broadcasts.filter(b => b.status === 'SENT').length;
  const totalRecipients = broadcasts.reduce((sum, b) => sum + b.totalRecipients, 0);
  const averageSuccessRate = broadcasts.length > 0 
    ? Math.round((broadcasts.reduce((sum, b) => sum + b.successfulDeliveries, 0) / 
        broadcasts.reduce((sum, b) => sum + b.totalRecipients, 0)) * 100)
    : 0;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'URGENT': return 'bg-red-100 text-red-700';
      case 'ANNOUNCEMENT': return 'bg-blue-100 text-blue-700';
      case 'REMINDER': return 'bg-amber-100 text-amber-700';
      case 'INFO': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'bg-green-100 text-green-700';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-700';
      case 'DRAFT': return 'bg-gray-100 text-gray-700';
      case 'FAILED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT': return <CheckCircle className="w-4 h-4" />;
      case 'SCHEDULED': return <Clock className="w-4 h-4" />;
      case 'FAILED': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleViewBroadcast = (broadcast: Broadcast) => {
    setSelectedBroadcast(broadcast);
  };

  const handleEditBroadcast = (broadcast: Broadcast) => {
    console.log('Edit broadcast:', broadcast);
  };

  const handleDeleteBroadcast = async (broadcastId: string) => {
    const confirmed = await confirm({
      title: 'Hapus Broadcast',
      message: 'Apakah Anda yakin ingin menghapus broadcast ini? Tindakan ini tidak dapat dibatalkan.',
      type: 'danger'
    });
    
    if (confirmed) {
      try {
        const response = await fetch(`/api/broadcasts/${broadcastId}`, {
          method: 'DELETE',
        });
        
        const result = await response.json();
        
        if (result.success) {
          success('Broadcast Dihapus', 'Broadcast berhasil dihapus');
          fetchBroadcasts(); // Refresh data
        } else {
          error('Gagal Menghapus Broadcast', result.error || 'Terjadi kesalahan saat menghapus broadcast');
        }
      } catch (err) {
        console.error('Error deleting broadcast:', err);
        error('Kesalahan Server', 'Terjadi kesalahan pada server, silakan coba lagi');
      }
    }
  };

  const handleAddBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBroadcast.title || !newBroadcast.message) {
      warning('Form Tidak Lengkap', 'Judul dan pesan wajib diisi');
      return;
    }

    if (newBroadcast.targetAudience === 'UNIT_SPECIFIC' && !newBroadcast.unitTarget) {
      warning('Unit Target Belum Dipilih', 'Pilih unit target untuk broadcast ini');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newBroadcast,
          createdById: 'cm52aqx5v0001uk9m8n3zdyuu', // Use first admin user ID from seed
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Reset form
        setNewBroadcast({
          title: '',
          message: '',
          type: 'INFO',
          targetAudience: 'ALL',
          unitTarget: '',
          scheduledAt: '',
        });
        setShowCreateModal(false);
        fetchBroadcasts(); // Refresh data
        success('Broadcast Berhasil', result.message || 'Broadcast berhasil dibuat');
      } else {
        error('Gagal Membuat Broadcast', result.error || 'Terjadi kesalahan saat membuat broadcast');
      }
    } catch (err) {
      console.error('Error creating broadcast:', err);
      error('Kesalahan Server', 'Terjadi kesalahan pada server, silakan coba lagi');
    } finally {
      setIsSubmitting(false);
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
                          {broadcast.targetAudience === 'ALL' ? 'Semua Anggota' :
                           broadcast.targetAudience === 'ACTIVE_MEMBERS' ? 'Anggota Aktif' :
                           `Unit ${broadcast.unitTarget}`}
                        </p>
                        <p className="text-xs text-gray-500">{broadcast.totalRecipients} penerima</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(broadcast.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(broadcast.status)}`}>
                          {broadcast.status === 'SENT' ? 'Terkirim' :
                           broadcast.status === 'SCHEDULED' ? 'Terjadwal' :
                           broadcast.status === 'DRAFT' ? 'Draft' : 'Gagal'}
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
                          className="text-blue-600 hover:bg-blue-50"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditBroadcast(broadcast)}
                          className="text-amber-600 hover:bg-amber-50"
                          title="Edit Broadcast"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleDeleteBroadcast(broadcast.id)}
                          title="Hapus Broadcast"
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

      {/* Create Broadcast Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Buat Broadcast Baru</h3>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleAddBroadcast} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Broadcast *
                </label>
                <Input
                  type="text"
                  value={newBroadcast.title}
                  onChange={(e) => setNewBroadcast({ ...newBroadcast, title: e.target.value })}
                  placeholder="Masukkan judul broadcast"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pesan *
                </label>
                <textarea
                  value={newBroadcast.message}
                  onChange={(e) => setNewBroadcast({ ...newBroadcast, message: e.target.value })}
                  placeholder="Tulis pesan broadcast..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Broadcast
                  </label>
                  <select
                    value={newBroadcast.type}
                    onChange={(e) => setNewBroadcast({ ...newBroadcast, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="INFO">Info</option>
                    <option value="ANNOUNCEMENT">Pengumuman</option>
                    <option value="REMINDER">Pengingat</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Penerima
                  </label>
                  <select
                    value={newBroadcast.targetAudience}
                    onChange={(e) => setNewBroadcast({ ...newBroadcast, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ALL">Semua Anggota</option>
                    <option value="ACTIVE_MEMBERS">Anggota Aktif</option>
                    <option value="UNIT_SPECIFIC">Unit Tertentu</option>
                  </select>
                </div>
              </div>

              {newBroadcast.targetAudience === 'UNIT_SPECIFIC' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Target
                  </label>
                  <Input
                    type="text"
                    value={newBroadcast.unitTarget}
                    onChange={(e) => setNewBroadcast({ ...newBroadcast, unitTarget: e.target.value })}
                    placeholder="Masukkan nama unit"
                    required={newBroadcast.targetAudience === 'UNIT_SPECIFIC'}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jadwal Kirim (Opsional)
                </label>
                <Input
                  type="datetime-local"
                  value={newBroadcast.scheduledAt}
                  onChange={(e) => setNewBroadcast({ ...newBroadcast, scheduledAt: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Kosongkan untuk mengirim sekarang
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loading className="w-4 h-4 mr-2" />
                      {newBroadcast.scheduledAt ? 'Menjadwalkan...' : 'Mengirim...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {newBroadcast.scheduledAt ? 'Jadwalkan' : 'Kirim Sekarang'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                      {selectedBroadcast.targetAudience === 'ALL' ? 'Semua Anggota' :
                       selectedBroadcast.targetAudience === 'ACTIVE_MEMBERS' ? 'Anggota Aktif' :
                       `Unit ${selectedBroadcast.unitTarget}`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Status</label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedBroadcast.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBroadcast.status)}`}>
                        {selectedBroadcast.status === 'SENT' ? 'Terkirim' :
                         selectedBroadcast.status === 'SCHEDULED' ? 'Terjadwal' :
                         selectedBroadcast.status === 'DRAFT' ? 'Draft' : 'Gagal'}
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
                  <p><span className="text-gray-600">Dibuat:</span> {formatDate(new Date(selectedBroadcast.createdAt))} oleh {selectedBroadcast.createdBy.name}</p>
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
