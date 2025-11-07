'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Loading, TableSkeleton } from '@/components/ui/loading';
import { TableEmptyState } from '@/components/ui/empty-state';
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
  Upload,
  Mail,
  Phone,
  MapPin,
  X,
  User,
  Building2,
  CreditCard,
  Calendar,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface Saving {
  id: string;
  amount: number;
  type: 'POKOK' | 'WAJIB' | 'SUKARELA' | 'WITHDRAWAL';
  date: string;
  createdAt: string;
  description?: string;
}

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
  savings?: Saving[];
}

export default function MembershipPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  
  // Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importError, setImportError] = useState<string | null>(null);

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
  const totalSimpanan = members.reduce((sum, m) => sum + Number(m.totalSimpanan || 0), 0);

  const handleViewMember = (member: Member) => {
    setSelectedMember(member);
  };

  const handleEditMember = (member: Member) => {
    // Populate form with existing member data for editing
    setNewMember({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      address: member.address || '',
      gender: member.gender,
      unitKerja: member.unitKerja,
      simpananPokok: member.simpananPokok.toString(),
      simpananWajib: member.simpananWajib.toString(),
      simpananSukarela: member.simpananSukarela.toString(),
    });
    setEditingMember(member.id);
    setShowAddModal(true);
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMember.email)) {
      warning('Email Tidak Valid', 'Masukkan format email yang benar (contoh: user@example.com)');
      return;
    }

    // Validate savings values
    const simpananPokok = parseFloat(newMember.simpananPokok) || 50000;
    const simpananWajib = parseFloat(newMember.simpananWajib) || 200000;
    const simpananSukarela = parseFloat(newMember.simpananSukarela) || 0;

    if (simpananPokok < 0 || simpananWajib < 0 || simpananSukarela < 0) {
      warning('Nilai Simpanan Tidak Valid', 'Nilai simpanan tidak boleh negatif');
      return;
    }

    // Prepare data with validated values
    const memberData = {
      ...newMember,
      simpananPokok: simpananPokok.toString(),
      simpananWajib: simpananWajib.toString(),
      simpananSukarela: simpananSukarela.toString(),
    };

    setIsSubmitting(true);
    
    try {
      const url = editingMember 
        ? `/api/members/${editingMember}`
        : '/api/members';
      
      const method = editingMember ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
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
        
        setEditingMember(null);
        setShowAddModal(false);
        fetchMembers(); // Refresh list
        
        const successMessage = editingMember 
          ? `${newMember.name} berhasil diupdate`
          : `${newMember.name} telah ditambahkan sebagai anggota koperasi`;
        success(editingMember ? 'Update Berhasil' : 'Anggota Berhasil Ditambahkan', successMessage);
      } else {
        error(editingMember ? 'Gagal Update Anggota' : 'Gagal Menambahkan Anggota', result.error || 'Terjadi kesalahan saat menyimpan data anggota');
      }
    } catch (err) {
      console.error('Error saving member:', err);
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
    setEditingMember(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setImportError('Please upload an Excel file (.xlsx or .xls)');
        return;
      }
      setImportFile(selectedFile);
      setImportError(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      setImportError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setImportError(null);

    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/members/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setImportResult(data);
        setImportFile(null);
        setShowImportModal(false);
        fetchMembers(); // Refresh list
        const txMsg = data.stats.transactionsImported 
          ? ` dan ${data.stats.transactionsImported} transaksi` 
          : '';
        success('Import berhasil!', `${data.stats.imported} anggota${txMsg} berhasil diimport`);
        // Reset file input
        const fileInput = document.getElementById('file-input-import') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setImportError(data.error || 'Failed to import members');
      }
    } catch (err: any) {
      setImportError(err.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAll = async () => {
    const confirmed = await confirm({
      title: '⚠️ Hapus Semua Anggota?',
      message: `Ini akan menghapus SEMUA ${members.length} anggota dan data terkait (users, savings, loans). Aksi ini tidak bisa dibatalkan! Fitur ini hanya untuk testing.`,
      type: 'danger',
      confirmText: 'Ya, Hapus Semua',
      cancelText: 'Batal'
    });

    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/members/delete-all', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        success('Berhasil!', `${data.deleted} anggota berhasil dihapus`);
        setMembers([]);
        setImportResult(null);
      } else {
        error('Gagal menghapus', data.error || 'Terjadi kesalahan');
      }
    } catch (err: any) {
      error('Gagal menghapus', err.message || 'Terjadi kesalahan');
    }
  };

  const handleGenerateTest = async () => {
    const confirmed = await confirm({
      title: '🧪 Generate Test Members?',
      message: 'Ini akan membuat 15 anggota dummy dengan data lengkap dan riwayat transaksi simpanan yang realistis untuk testing.',
      type: 'info',
      confirmText: 'Ya, Generate',
      cancelText: 'Batal'
    });

    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/members/generate-test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        success('Berhasil!', `${data.data.membersCreated} anggota test berhasil dibuat dengan ${data.data.savingsCreated} transaksi simpanan`);
        fetchMembers(); // Reload members
      } else {
        error('Gagal generate', data.error || 'Terjadi kesalahan');
      }
    } catch (err: any) {
      error('Gagal generate', err.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Keanggotaan</h1>
          <p className="text-gray-600 mt-1">Kelola data anggota koperasi</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setShowImportModal(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import Data
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          {/* Testing only - Generate Test */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateTest}
            disabled={isSubmitting}
            className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
          >
            <Users className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Generating...' : 'Generate Test (15)'}
          </Button>
          {/* Testing only - Delete All */}
          {members.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDeleteAll}
              className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus Semua ({members.length})
            </Button>
          )}
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Tambah Anggota
          </Button>
        </div>
      </div>

      {/* Import Success Result */}
      {importResult && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-green-900 mb-1">
                      Import Berhasil!
                    </h3>
                    <p className="text-sm text-green-700">{importResult.message}</p>
                  </div>
                  <button
                    onClick={() => setImportResult(null)}
                    className="text-green-600 hover:text-green-800 p-1"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {/* Members Stats */}
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <p className="text-xs text-gray-600 mb-1">Total Rows</p>
                    <p className="text-2xl font-bold text-gray-900">{importResult.stats.total}</p>
                    <p className="text-xs text-gray-500 mt-1">Anggota</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <p className="text-xs text-gray-600 mb-1">Imported</p>
                    <p className="text-2xl font-bold text-green-600">{importResult.stats.imported}</p>
                    <p className="text-xs text-gray-500 mt-1">Anggota baru</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-yellow-200">
                    <p className="text-xs text-gray-600 mb-1">Skipped</p>
                    <p className="text-2xl font-bold text-yellow-600">{importResult.stats.skipped}</p>
                    <p className="text-xs text-gray-500 mt-1">Duplikat</p>
                  </div>

                  {/* Transactions Stats */}
                  {importResult.stats.transactionsTotal > 0 && (
                    <>
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <p className="text-xs text-gray-600 mb-1">Transaksi Total</p>
                        <p className="text-2xl font-bold text-gray-900">{importResult.stats.transactionsTotal}</p>
                        <p className="text-xs text-gray-500 mt-1">Dari sheet Data</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <p className="text-xs text-gray-600 mb-1">Transaksi Imported</p>
                        <p className="text-2xl font-bold text-blue-600">{importResult.stats.transactionsImported}</p>
                        <p className="text-xs text-gray-500 mt-1">Setor/Tarik</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Errors if any */}
                {importResult.stats.errors && importResult.stats.errors.length > 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-yellow-900 mb-2">
                          {importResult.stats.errors.length} Warning(s)
                        </p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {importResult.stats.errors.slice(0, 10).map((err: string, i: number) => (
                            <p key={i} className="text-xs text-yellow-800">• {err}</p>
                          ))}
                          {importResult.stats.errors.length > 10 && (
                            <p className="text-xs text-yellow-700 italic mt-2">
                              ...dan {importResult.stats.errors.length - 10} warning lainnya
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
          ) : filteredMembers.length === 0 ? (
            <TableEmptyState
              icon={Users}
              message={searchTerm ? "Tidak ada anggota yang sesuai pencarian" : "Belum ada data anggota"}
              description={searchTerm ? "Coba ubah kata kunci pencarian" : "Tambahkan anggota pertama untuk memulai"}
            />
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
                          className="text-blue-600 hover:bg-blue-50"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditMember(member)}
                          className="text-amber-600 hover:bg-amber-50"
                          title="Edit Anggota"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleDeleteMember(member.id)}
                          title="Hapus Anggota"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Detail Anggota</h3>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                {/* Left Column - Personal Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Informasi Pribadi
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Nama Lengkap</label>
                      <p className="font-semibold text-gray-900 mt-1">{selectedMember.name}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Nomor Anggota</label>
                      <p className="font-semibold text-gray-900 mt-1">{selectedMember.nomorAnggota}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Gender</label>
                      <p className="font-medium text-gray-700 mt-1">
                        {selectedMember.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Unit Kerja</label>
                      <p className="font-medium text-gray-700 mt-1">{selectedMember.unitKerja}</p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Contact */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    Kontak
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 break-all">{selectedMember.email}</p>
                      </div>
                    </div>
                    {selectedMember.phone && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{selectedMember.phone}</p>
                        </div>
                      </div>
                    )}
                    {selectedMember.address && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{selectedMember.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Savings Section */}
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Simpanan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  {/* Simpanan Pokok */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-blue-700 font-medium mb-1">Simpanan Pokok</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(selectedMember.simpananPokok)}
                    </p>
                  </div>

                  {/* Simpanan Wajib */}
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4">
                    <p className="text-xs text-emerald-700 font-medium mb-1">Simpanan Wajib</p>
                    <p className="text-2xl font-bold text-emerald-900">
                      {formatCurrency(selectedMember.simpananWajib)}
                    </p>
                  </div>

                  {/* Simpanan Sukarela */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                    <p className="text-xs text-green-700 font-medium mb-1">Simpanan Sukarela</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(selectedMember.simpananSukarela)}
                    </p>
                  </div>
                </div>

                {/* Total Simpanan */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-300 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">Total Simpanan</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatCurrency(selectedMember.totalSimpanan)}
                    </p>
                  </div>
                </div>

                {/* Savings History */}
                {selectedMember.savings && selectedMember.savings.length > 0 && (
                  <div className="mt-6">
                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                      Riwayat Transaksi Simpanan
                    </h5>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <div className="space-y-2">
                        {selectedMember.savings
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((saving) => {
                            const isWithdrawal = saving.type === 'WITHDRAWAL';
                            const displayDate = new Date(saving.date).toLocaleDateString('id-ID', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            });
                            
                            let typeLabel = '';
                            let typeColor = '';
                            if (saving.type === 'POKOK') {
                              typeLabel = 'Pokok';
                              typeColor = 'bg-blue-100 text-blue-700';
                            } else if (saving.type === 'WAJIB') {
                              typeLabel = 'Wajib';
                              typeColor = 'bg-emerald-100 text-emerald-700';
                            } else if (saving.type === 'SUKARELA') {
                              typeLabel = 'Setor Sukarela';
                              typeColor = 'bg-green-100 text-green-700';
                            } else if (saving.type === 'WITHDRAWAL') {
                              typeLabel = 'Tarik Sukarela';
                              typeColor = 'bg-red-100 text-red-700';
                            }

                            return (
                              <div 
                                key={saving.id}
                                className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${typeColor}`}>
                                    {typeLabel}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                      <span className="text-sm text-gray-600">{displayDate}</span>
                                    </div>
                                    {saving.description && (
                                      <p className="text-xs text-gray-500 mt-0.5">{saving.description}</p>
                                    )}
                                  </div>
                                </div>
                                <div className={`text-right ${isWithdrawal ? 'text-red-600' : 'text-green-600'}`}>
                                  <p className="text-lg font-bold">
                                    {isWithdrawal ? '-' : '+'}{formatCurrency(saving.amount)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedMember(null)}
                >
                  Tutup
                </Button>
                <Button
                  onClick={() => {
                    handleEditMember(selectedMember);
                    setSelectedMember(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Anggota
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    {editingMember ? 'Update Anggota' : 'Tambah Anggota Baru'}
                  </h3>
                  <p className="text-blue-100 text-sm mt-1">
                    {editingMember ? 'Perbarui data anggota koperasi' : 'Daftarkan anggota baru untuk bergabung dengan koperasi'}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingMember(null);
                    resetForm();
                  }}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">

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
                      leftIcon={<User className="w-4 h-4 text-gray-400" />}
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
                      leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
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
                      leftIcon={<Phone className="w-4 h-4 text-gray-400" />}
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
                      leftIcon={<MapPin className="w-4 h-4 text-gray-400" />}
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
                      leftIcon={<CreditCard className="w-4 h-4 text-gray-400" />}
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
                      leftIcon={<CreditCard className="w-4 h-4 text-gray-400" />}
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
                      leftIcon={<CreditCard className="w-4 h-4 text-gray-400" />}
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
                    setEditingMember(null);
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
                  {isSubmitting ? (
                    editingMember ? 'Mengupdate...' : 'Menyimpan...'
                  ) : (
                    editingMember ? 'Update Anggota' : 'Simpan Anggota'
                  )}
                </Button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                  Import Data Anggota
                </h3>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Instructions */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-900 mb-3">Format File Excel:</p>
                
                <div className="space-y-3">
                  {/* Sheet ANGGOTA */}
                  <div className="bg-white/60 rounded p-3 border border-blue-100">
                    <p className="font-semibold text-blue-900 text-sm mb-2 flex items-center gap-2">
                      <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded">Sheet 1</span>
                      ANGGOTA
                    </p>
                    <ul className="text-xs text-blue-800 space-y-1 ml-4">
                      <li>• <strong>NO</strong> - Nomor urut</li>
                      <li>• <strong>NAMA ANGGOTA</strong> - Nama lengkap</li>
                      <li>• <strong>PENDAFTARAN ANGGOTA</strong> - Tanggal bergabung</li>
                      <li>• <strong>SIMPANAN POKOK</strong> - Nominal simpanan pokok</li>
                      <li>• <strong>TOTAL SIMPANAN WAJIB</strong> - Akumulasi simpanan wajib</li>
                    </ul>
                  </div>

                  {/* Sheet Data */}
                  <div className="bg-white/60 rounded p-3 border border-blue-100">
                    <p className="font-semibold text-blue-900 text-sm mb-2 flex items-center gap-2">
                      <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded">Sheet 2</span>
                      Data (History Transaksi)
                    </p>
                    <ul className="text-xs text-blue-800 space-y-1 ml-4">
                      <li>• <strong>NO, NAMA, TAHUN, BULAN, NOMINAL, TIPE</strong></li>
                      <li>• TIPE: <span className="font-semibold">SETOR</span> (setoran) atau <span className="font-semibold">TARIK</span> (penarikan)</li>
                      <li>• Akan diimport sebagai history simpanan sukarela</li>
                    </ul>
                  </div>
                </div>

                <p className="text-xs text-blue-700 italic mt-3">
                  💡 Tips: Anggota yang sudah ada akan di-skip otomatis. Transaksi akan di-match berdasarkan nama anggota.
                </p>
              </div>

              {/* File Input */}
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <label htmlFor="file-input-import" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">
                    Click to select file
                  </span>
                  <input
                    id="file-input-import"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {importFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: <strong>{importFile.name}</strong>
                  </p>
                )}
              </div>

              {/* Error */}
              {importError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{importError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportError(null);
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={isUploading}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!importFile || isUploading}
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
