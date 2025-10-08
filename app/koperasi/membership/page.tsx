'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Loading, TableSkeleton } from '@/components/ui/loading';
import { formatCurrency } from '@/lib/utils';
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
    if (confirm('Apakah Anda yakin ingin menghapus anggota ini?')) {
      try {
        const response = await fetch(`/api/members/${memberId}`, {
          method: 'DELETE',
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Refresh member list
          fetchMembers();
        } else {
          alert('Error: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('Error deleting member');
      }
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
    </div>
  );
}
