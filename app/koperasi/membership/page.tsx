'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Loading, TableSkeleton } from '@/components/ui/loading';
import { formatCurrency } from '@/lib/utils';
import { useNotification } from '@/lib/notification-context';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  nomorAnggota: string;
  gender: 'MALE' | 'FEMALE';
  unitKerja: string;
  phone?: string;
  address?: string;
  simpananPokok: number;
  simpananWajib: number;
  simpananSukarela: number;
  totalSimpanan: number;
  joinDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export default function MembershipPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Global notifications
  const { success, error, warning, confirm } = useNotification();

  // Form state for new member
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    unitKerja: '',
    simpananPokok: '50000',
    simpananWajib: '200000',
    simpananSukarela: '0',
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/members');
      const result = await response.json();
      
      if (result.success) {
        setMembers(result.data);
      } else {
        console.error('Failed to fetch members:', result.error);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.nomorAnggota.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.unitKerja.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'ACTIVE').length;
  const totalSimpanan = members.reduce((sum, m) => sum + m.totalSimpanan, 0);

  const handleViewMember = (member: Member) => {
    setSelectedMember(member);
  };

  const handleEditMember = (member: Member) => {
    // Implementasi edit member
    console.log('Edit member:', member);
  };

  const handleDeleteMember = async (memberId: string) => {
    const confirmed = await confirm({
      title: 'Hapus Anggota',
      message: 'Apakah Anda yakin ingin menghapus anggota ini? Tindakan ini tidak dapat dibatalkan.',
      type: 'danger',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal'
    });

    if (confirmed) {
      try {
        const response = await fetch(`/api/members/${memberId}`, {
          method: 'DELETE',
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Refresh member list
          fetchMembers();
          success('Anggota Berhasil Dihapus', 'Data anggota telah dihapus dari sistem');
        } else {
          error('Gagal Menghapus Anggota', result.error || 'Terjadi kesalahan saat menghapus anggota');
        }
      } catch (err) {
        console.error('Error deleting member:', err);
        error('Kesalahan Server', 'Terjadi kesalahan pada server, silakan coba lagi');
      }
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMember.name || !newMember.email || !newMember.unitKerja) {
      warning('Form Tidak Lengkap', 'Nama, email, dan unit kerja wajib diisi');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMember),
      });

      const result = await response.json();

      if (result.success) {
        // Reset form
        setNewMember({
          name: '',
          email: '',
          phone: '',
          address: '',
          gender: 'MALE',
          unitKerja: '',
          simpananPokok: '50000',
          simpananWajib: '200000',
          simpananSukarela: '0',
        });
        
        setShowAddModal(false);
        fetchMembers(); // Refresh list
        success('Anggota Berhasil Ditambahkan', `${newMember.name} telah ditambahkan sebagai anggota koperasi`);
      } else {
        error('Gagal Menambahkan Anggota', result.error || 'Terjadi kesalahan saat menambahkan anggota');
      }
    } catch (err) {
      console.error('Error adding member:', err);
      error('Kesalahan Server', 'Terjadi kesalahan pada server, silakan coba lagi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewMember({
      name: '',
      email: '',
      phone: '',
      address: '',
      gender: 'MALE',
      unitKerja: '',
      simpananPokok: '50000',
      simpananWajib: '200000',
      simpananSukarela: '0',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Keanggotaan</h1>
          <p className="text-gray-600 mt-1">Kelola data anggota koperasi</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Tambah Anggota
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Anggota</p>
                <h3 className="text-2xl font-bold text-gray-900">{totalMembers}</h3>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Anggota Aktif</p>
                <h3 className="text-2xl font-bold text-gray-900">{activeMembers}</h3>
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
                <p className="text-sm text-gray-600">Total Simpanan</p>
                <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totalSimpanan)}</h3>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <Users className="w-6 h-6 text-green-600" />
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
                placeholder="Cari anggota berdasarkan nama, nomor anggota, email, atau unit kerja..."
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

      {/* Members Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">
            Daftar Anggota ({filteredMembers.length})
          </h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={5} cols={7} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Anggota</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Unit Kerja</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Simpanan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.nomorAnggota}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</p>
                      </div>
                    </TableCell>
                    <TableCell>{member.unitKerja}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency(member.totalSimpanan)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {member.status === 'ACTIVE' ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewMember(member)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditMember(member)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleDeleteMember(member.id)}
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

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Detail Anggota</h3>
              <Button variant="outline" onClick={() => setSelectedMember(null)}>
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Informasi Pribadi</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Nama Lengkap</label>
                    <p className="font-medium">{selectedMember.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Nomor Anggota</label>
                    <p className="font-medium">{selectedMember.nomorAnggota}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Gender</label>
                    <p className="font-medium">{selectedMember.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Unit Kerja</label>
                    <p className="font-medium">{selectedMember.unitKerja}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Kontak</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{selectedMember.email}</span>
                  </div>
                  {selectedMember.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{selectedMember.phone}</span>
                    </div>
                  )}
                  {selectedMember.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{selectedMember.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-4">Simpanan</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">Simpanan Pokok</p>
                  <p className="text-lg font-bold text-blue-700">
                    {formatCurrency(selectedMember.simpananPokok)}
                  </p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-sm text-emerald-600">Simpanan Wajib</p>
                  <p className="text-lg font-bold text-emerald-700">
                    {formatCurrency(selectedMember.simpananWajib)}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600">Simpanan Sukarela</p>
                  <p className="text-lg font-bold text-green-700">
                    {formatCurrency(selectedMember.simpananSukarela)}
                  </p>
                </div>
              </div>
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Simpanan</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(selectedMember.totalSimpanan)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Tambah Anggota Baru</h3>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleAddMember}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Informasi Pribadi</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={newMember.name}
                      onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contoh@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Telepon
                    </label>
                    <Input
                      type="tel"
                      value={newMember.phone}
                      onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="081234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alamat
                    </label>
                    <Input
                      type="text"
                      value={newMember.address}
                      onChange={(e) => setNewMember(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Alamat lengkap"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Informasi Kerja</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jenis Kelamin <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newMember.gender}
                      onChange={(e) => setNewMember(prev => ({ ...prev, gender: e.target.value as 'MALE' | 'FEMALE' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="MALE">Laki-laki</option>
                      <option value="FEMALE">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Kerja <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newMember.unitKerja}
                      onChange={(e) => setNewMember(prev => ({ ...prev, unitKerja: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Pilih Unit Kerja</option>
                      <option value="Keuangan">Keuangan</option>
                      <option value="HRD">HRD</option>
                      <option value="IT">IT</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Operasional">Operasional</option>
                      <option value="Akademik">Akademik</option>
                      <option value="Kemahasiswaan">Kemahasiswaan</option>
                    </select>
                  </div>

                  <h4 className="font-semibold text-gray-900 mt-6">Simpanan Awal</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Simpanan Pokok
                    </label>
                    <Input
                      type="number"
                      value={newMember.simpananPokok}
                      onChange={(e) => setNewMember(prev => ({ ...prev, simpananPokok: e.target.value }))}
                      placeholder="50000"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Simpanan Wajib
                    </label>
                    <Input
                      type="number"
                      value={newMember.simpananWajib}
                      onChange={(e) => setNewMember(prev => ({ ...prev, simpananWajib: e.target.value }))}
                      placeholder="200000"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Simpanan Sukarela
                    </label>
                    <Input
                      type="number"
                      value={newMember.simpananSukarela}
                      onChange={(e) => setNewMember(prev => ({ ...prev, simpananSukarela: e.target.value }))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Anggota'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
