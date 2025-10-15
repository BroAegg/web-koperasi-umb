"use client";

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, User, Mail, Phone, MapPin, Package, FileText, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SupplierRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    address: '',
    description: ''
  });
  const [error, setError] = useState('');

  const categories = [
    'Makanan',
    'Minuman',
    'Alat Tulis Kantor',
    'Bahan Pokok',
    'Snack & Makanan Ringan',
    'Lainnya'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Submitting supplier registration:', formData);

      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);

      if (!data.success) {
        setError(data.error || 'Gagal mendaftar sebagai supplier');
        setIsLoading(false);
        return;
      }

      // Success
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Terjadi kesalahan saat mendaftar. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <Card className="shadow-lg border-0 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Pendaftaran Berhasil!
            </h2>
            <p className="text-gray-600 mb-4">
              Pendaftaran Anda sebagai supplier telah berhasil dikirim.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 text-left space-y-2 text-sm">
              <p className="text-gray-700">
                <span className="font-medium">Status:</span> Menunggu persetujuan admin
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Email:</span> {formData.email}
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Kami akan menghubungi Anda melalui email setelah persetujuan admin.
            </p>
            <Button 
              className="w-full mt-6"
              onClick={() => router.push('/login')}
            >
              Kembali ke Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white-50 via-white to-emerald-50">
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* Left Side - Logo & Branding */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-center space-y-6 px-8">
            <div className="mb-8">
              <Image 
                src="/logo-umb.png" 
                alt="Logo UMB" 
                width={120} 
                height={120} 
                className="mx-auto rounded-full border-4 border-white/20 shadow-xl"
              />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold">Daftar Sebagai Supplier</h1>
              <p className="text-blue-100 text-lg max-w-md">
                Bergabunglah dengan Koperasi UM BANDUNG sebagai supplier resmi
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 text-blue-200">
              <Building2 className="w-5 h-5" />
              <span className="text-sm">Universitas Muhammadiyah Bandung</span>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full"></div>
          <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/5 rounded-full"></div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md space-y-6">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <Image 
                src="/logo-umb.png" 
                alt="Logo UMB" 
                width={80} 
                height={80} 
                className="mx-auto rounded-full shadow-lg"
              />
              <h1 className="text-2xl font-bold text-gray-900 mt-4">Daftar Sebagai Supplier</h1>
            </div>

            <Card className="shadow-lg border-0">
              <CardContent className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Form Pendaftaran
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Lengkapi data di bawah untuk mendaftar sebagai supplier
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Nama Lengkap / Nama Bisnis"
                    type="text"
                    placeholder="Masukkan nama Anda atau nama bisnis"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
                    leftIcon={<User className="w-4 h-4 text-gray-400" />}
                    required
                    className="text-base"
                  />

                  <Input
                    label="Email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
                    leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
                    required
                    className="text-base"
                  />

                  <Input
                    label="Nomor Telepon"
                    type="tel"
                    placeholder="08123456789"
                    value={formData.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, phone: e.target.value})}
                    leftIcon={<Phone className="w-4 h-4 text-gray-400" />}
                    required
                    className="text-base"
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Kategori Produk
                    </label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      >
                        <option value="">Pilih kategori produk</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Alamat Lengkap
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="Masukkan alamat lengkap"
                        required
                        rows={3}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Deskripsi (Opsional)
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Ceritakan tentang bisnis Anda..."
                        rows={3}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Button
                      type="submit"
                      className="w-full text-base py-3"
                      loading={isLoading}
                      disabled={isLoading || !formData.name || !formData.email || !formData.phone || !formData.category || !formData.address}
                    >
                      {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
                    </Button>
                  </div>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Sudah punya akun?{' '}
                    <Link 
                      href="/login" 
                      className="text-blue-700 hover:text-blue-800 font-medium"
                    >
                      Masuk di sini
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
                    
            {/* Footer */}
            <div className="text-center text-xs text-gray-500 space-y-1">
              <p>© 2024 Universitas Muhammadiyah Bandung</p>
              <p className="text-gray-400">
                Dengan mendaftar, Anda menyetujui syarat dan ketentuan yang berlaku
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
