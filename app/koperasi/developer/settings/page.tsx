"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, Save, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
}

export default function DeveloperSettings() {
  const [profile, setProfile] = useState<ProfileData>({ name: "", email: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setProfile({ name: data.name || "", email: data.email || "" });
        setProfileForm({ name: data.name || "", email: data.email || "" });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/developer/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileForm.name,
          email: profileForm.email,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
        setProfile({ name: profileForm.name, email: profileForm.email });
      } else {
        setMessage({ type: "error", text: data.error || "Gagal memperbarui profil" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan. Coba lagi." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Password baru dan konfirmasi tidak cocok" });
      setIsSaving(false);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: "error", text: "Password minimal 8 karakter" });
      setIsSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/developer/settings/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Password berhasil diubah!" });
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMessage({ type: "error", text: data.error || "Gagal mengubah password" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan. Coba lagi." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="pl-4 pr-6 pt-6 pb-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Akun Developer</h1>
          <p className="text-gray-600">Kelola informasi akun dan keamanan Anda</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`rounded-lg p-4 flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Profile Settings */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Informasi Profil</h2>
                <p className="text-sm text-gray-600">Perbarui nama dan email Anda</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <Input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  className="rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="email@example.com"
                  className="rounded-lg"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Lock className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Ubah Password</h2>
                <p className="text-sm text-gray-600">Perbarui password untuk keamanan akun</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Saat Ini
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Masukkan password saat ini"
                    className="rounded-lg pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Baru
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Minimal 8 karakter"
                    className="rounded-lg pr-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Ketik ulang password baru"
                    className="rounded-lg pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
              >
                <Lock className="w-4 h-4 mr-2" />
                {isSaving ? "Mengubah..." : "Ubah Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
