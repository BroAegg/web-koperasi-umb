"use client";

import MemberNavigation from '@/components/member/MemberNavigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    ArrowLeft,
    Calendar,
    Mail,
    MapPin,
    Phone,
    Save,
    User
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProfileData {
  id: string;
  nomorAnggota: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  gender: string;
  unitKerja: string;
  joinDate: string;
  status: string;
  tier: string;
  points: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.id) {
      fetchProfileData();
    }
  }, [status, session, router]);

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/member/profile');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      if (data.success) {
        setProfileData(data.data);
        setFormData({
          phone: data.data.phone || '',
          address: data.data.address || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/member/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Profil berhasil diperbarui!');
        setEditing(false);
        fetchProfileData();
      } else {
        alert(data.message || 'Gagal memperbarui profil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Terjadi kesalahan saat memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Password baru tidak cocok!');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('Password minimal 6 karakter!');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/member/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Password berhasil diubah!');
        setShowPasswordForm(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        alert(data.message || 'Gagal mengubah password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Terjadi kesalahan saat mengubah password');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getTierBadge = (tier: string) => {
    const badges: Record<string, { color: string; icon: string }> = {
      BRONZE: { color: 'bg-amber-50 text-amber-700 border border-amber-200', icon: '⬡' },
      SILVER: { color: 'bg-gray-50 text-gray-700 border border-gray-200', icon: '⬡' },
      GOLD: { color: 'bg-yellow-50 text-yellow-700 border border-yellow-200', icon: '⬡' },
      PLATINUM: { color: 'bg-purple-50 text-purple-700 border border-purple-200', icon: '⬡' },
    };
    const badge = badges[tier] || badges.BRONZE;
    return (
      <Badge className={`${badge.color} px-2 sm:px-3 py-1 text-xs font-semibold`}>
        {badge.icon} {tier}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const color = status === 'ACTIVE' 
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
      : 'bg-red-50 text-red-700 border border-red-200';
    return (
      <Badge className={`${color} px-2 sm:px-3 py-1 text-xs font-semibold`}>
        {status === 'ACTIVE' ? 'Aktif' : 'Tidak Aktif'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0055FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]">
        <Card className="p-8 text-center max-w-md shadow-lg border border-gray-200">
          <p className="text-red-600 mb-4 font-medium">Data profil tidak ditemukan</p>
          <Button onClick={() => router.push('/member/dashboard')} className="bg-[#0055FF] hover:bg-[#003DB3]">
            Kembali ke Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <MemberNavigation />

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/member/dashboard')}
            className="mb-3 sm:mb-4 text-gray-600 hover:text-gray-900 border-gray-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Profil Saya
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Kelola informasi dan keamanan akun Anda
          </p>
        </div>

        {/* Profile Card */}
        <Card className="p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-[#0055FF] to-[#003DB3] rounded-2xl flex items-center justify-center text-white text-3xl sm:text-4xl lg:text-5xl font-bold shadow-lg shadow-blue-500/20">
                {profileData.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {profileData.name}
                </h2>
                {getStatusBadge(profileData.status)}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 lg:gap-4 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                <span className="font-semibold">No. Anggota: {profileData.nomorAnggota}</span>
                <span className="hidden sm:inline text-gray-300">•</span>
                <span>Unit: {profileData.unitKerja}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {getTierBadge(profileData.tier)}
                <span className="text-xs sm:text-sm text-gray-600">
                  {profileData.points.toLocaleString()} points
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 sm:pt-6 space-y-3 sm:space-y-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Email</p>
                <p className="text-sm sm:text-base text-gray-900 truncate">{profileData.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Telepon</p>
                <p className="text-sm sm:text-base text-gray-900">{profileData.phone || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Alamat</p>
                <p className="text-sm sm:text-base text-gray-900">{profileData.address || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Jenis Kelamin</p>
                <p className="text-sm sm:text-base text-gray-900">{profileData.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Tanggal Bergabung</p>
                <p className="text-sm sm:text-base text-gray-900">{formatDate(profileData.joinDate)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Edit Profile Form */}
        <Card className="p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 shadow-sm border border-gray-200">
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Edit Informasi Kontak
          </h3>
          <form onSubmit={handleSaveProfile} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Nomor Telepon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!editing}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                placeholder="Contoh: 08123456789"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Alamat Lengkap
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={!editing}
                rows={3}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all resize-none"
                placeholder="Masukkan alamat lengkap..."
              />
            </div>

            <div className="flex gap-2 sm:gap-3 pt-2">
              {!editing ? (
                <Button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="bg-[#0055FF] hover:bg-[#003DB3] text-white text-sm"
                >
                  Edit Profil
                </Button>
              ) : (
                <>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-[#0055FF] hover:bg-[#003DB3] text-white text-sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        phone: profileData.phone || '',
                        address: profileData.address || '',
                      });
                    }}
                    className="border-gray-200 text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    Batal
                  </Button>
                </>
              )}
            </div>
          </form>
        </Card>

        {/* Change Password */}
        <Card className="p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200">
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Keamanan Akun
          </h3>
          
          {!showPasswordForm ? (
            <Button
              onClick={() => setShowPasswordForm(true)}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 text-sm"
            >
              Ubah Password
            </Button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Password Lama
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="Masukkan password lama"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Password Baru
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="Ulangi password baru"
                />
              </div>

              <div className="flex gap-2 sm:gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm"
                >
                  {saving ? 'Mengubah...' : 'Ubah Password'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Batal
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
