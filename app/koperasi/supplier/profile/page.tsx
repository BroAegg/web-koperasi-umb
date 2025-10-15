"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  FileText,
  Lock,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";

// Dummy data profil
const dummyProfile = {
  id: "SUP-001",
  businessName: "Warung Makan Barokah",
  ownerName: "Budi Santoso",
  email: "supplier@test.com",
  phone: "081234567890",
  address: "Jl. Merdeka No. 123, Jakarta Pusat",
  productCategory: "Makanan & Minuman",
  description: "Supplier makanan dan minuman berkualitas untuk kebutuhan koperasi",
  npwp: "12.345.678.9-012.345",
  bankName: "Bank Mandiri",
  accountNumber: "1234567890",
  accountHolder: "Budi Santoso",
  status: "ACTIVE",
  paymentStatus: "PAID",
  memberSince: "2024-01-15",
};

export default function SupplierProfile() {
  const [profile, setProfile] = useState(dummyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: profile.businessName,
    ownerName: profile.ownerName,
    phone: profile.phone,
    address: profile.address,
    description: profile.description,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setFormData({
        businessName: profile.businessName,
        ownerName: profile.ownerName,
        phone: profile.phone,
        address: profile.address,
        description: profile.description,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = () => {
    setProfile({ ...profile, ...formData });
    setIsEditing(false);
    alert("Profil berhasil diperbarui!");
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert("Semua field password harus diisi!");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert("Password baru minimal 8 karakter!");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Password baru dan konfirmasi tidak cocok!");
      return;
    }

    // Implement password change logic
    alert("Password berhasil diubah!");
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700";
      case "UNPAID":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Profil Supplier</h1>
          <p className="text-slate-600 mt-1">Kelola informasi perusahaan Anda</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowPasswordModal(true)}
            variant="outline"
            className="rounded-xl"
          >
            <Lock className="w-4 h-4 mr-2" />
            Ubah Password
          </Button>
          {isEditing ? (
            <>
              <Button 
                onClick={handleEditToggle}
                variant="outline"
                className="rounded-xl"
              >
                Batal
              </Button>
              <Button 
                onClick={handleSaveProfile}
                className="bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                Simpan
              </Button>
            </>
          ) : (
            <Button 
              onClick={handleEditToggle}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              Edit Profil
            </Button>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl shadow-md border-0">
          <CardContent className="p-6">
            <p className="text-slate-600 text-sm mb-2">Status Akun</p>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(profile.status)}`}>
              {profile.status === "ACTIVE" ? "Aktif" : "Pending"}
            </span>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-md border-0">
          <CardContent className="p-6">
            <p className="text-slate-600 text-sm mb-2">Status Pembayaran</p>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getPaymentStatusColor(profile.paymentStatus)}`}>
              {profile.paymentStatus === "PAID" ? "Lunas" : "Belum Bayar"}
            </span>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-md border-0">
          <CardContent className="p-6">
            <p className="text-slate-600 text-sm mb-2">Bergabung Sejak</p>
            <p className="text-xl font-bold text-slate-800">{profile.memberSince}</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Information */}
      <Card className="rounded-2xl shadow-md border-0">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Informasi Perusahaan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Bisnis */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                Nama Bisnis
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="rounded-xl"
                />
              ) : (
                <p className="text-slate-800 font-medium p-3 bg-slate-50 rounded-xl">{profile.businessName}</p>
              )}
            </div>

            {/* Nama Pemilik */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nama Pemilik
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="rounded-xl"
                />
              ) : (
                <p className="text-slate-800 font-medium p-3 bg-slate-50 rounded-xl">{profile.ownerName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <p className="text-slate-800 font-medium p-3 bg-slate-50 rounded-xl">{profile.email}</p>
              <p className="text-xs text-slate-500 mt-1">Email tidak dapat diubah</p>
            </div>

            {/* Telepon */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Nomor Telepon
              </label>
              {isEditing ? (
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="rounded-xl"
                />
              ) : (
                <p className="text-slate-800 font-medium p-3 bg-slate-50 rounded-xl">{profile.phone}</p>
              )}
            </div>

            {/* Alamat */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Alamat Lengkap
              </label>
              {isEditing ? (
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-slate-800 font-medium p-3 bg-slate-50 rounded-xl">{profile.address}</p>
              )}
            </div>

            {/* Kategori Produk */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Kategori Produk
              </label>
              <p className="text-slate-800 font-medium p-3 bg-slate-50 rounded-xl">{profile.productCategory}</p>
            </div>

            {/* Deskripsi */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Deskripsi
              </label>
              {isEditing ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-slate-800 font-medium p-3 bg-slate-50 rounded-xl">{profile.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card className="rounded-2xl shadow-md border-0">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3 mb-4">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-slate-800">Informasi Keuangan</h2>
              <p className="text-sm text-slate-600 mt-1">
                Perubahan NPWP dan rekening bank memerlukan persetujuan admin
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NPWP */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">NPWP</label>
              <p className="text-slate-800 font-medium p-3 bg-slate-50 rounded-xl">{profile.npwp}</p>
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nama Bank</label>
              <p className="text-slate-800 font-medium p-3 bg-slate-50 rounded-xl">{profile.bankName}</p>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nomor Rekening</label>
              <p className="text-slate-800 font-medium p-3 bg-slate-50 rounded-xl">{profile.accountNumber}</p>
            </div>

            {/* Account Holder */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Atas Nama</label>
              <p className="text-slate-800 font-medium p-3 bg-slate-50 rounded-xl">{profile.accountHolder}</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-800">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              Untuk mengubah informasi keuangan, silakan hubungi admin koperasi
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md rounded-2xl shadow-xl border-0">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Ubah Password</h2>

              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password Lama
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="rounded-xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    >
                      {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password Baru
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="rounded-xl pr-10"
                      placeholder="Minimal 8 karakter"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    >
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="rounded-xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  onClick={() => setShowPasswordModal(false)}
                  variant="outline"
                  className="rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleChangePassword}
                  className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  Simpan Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
