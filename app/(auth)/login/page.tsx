"use client";

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, Building2 } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

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
              <h1 className="text-4xl font-bold">Sistem Koperasi UMB</h1>
              <p className="text-blue-100 text-lg max-w-md">
                Platform digital untuk mengelola aktivitas koperasi dengan mudah dan efisien
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

        {/* Right Side - Login Form */}
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
              <h1 className="text-2xl font-bold text-gray-900 mt-4">Sistem Koperasi UMB</h1>
            </div>

            <Card className="shadow-lg border-0">
              <CardContent className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Masuk ke Akun Anda
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Selamat datang kembali, silakan masuk untuk melanjutkan
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="Masukkan email Anda"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
                    leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
                    required
                    className="text-base"
                  />

                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password Anda"
                    value={formData.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, password: e.target.value})}
                    leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    }
                    required
                    className="text-base"
                  />

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-600">Ingat saya</span>
                    </label>
                    <Link 
                      href="/forgot-password" 
                      className="text-blue-700 hover:text-blue-800 font-medium"
                    >
                      Lupa password?
                    </Link>
                  </div>

                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className="w-full text-base py-3"
                      loading={isLoading}
                      disabled={isLoading || !formData.email || !formData.password}
                    >
                      {isLoading ? 'Memproses...' : 'Masuk'}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">atau</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full text-base py-3"
                      disabled={isLoading}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>Masuk dengan Google</span>
                      </div>
                    </Button>
                  </div>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Belum punya akun?{' '}
                    <Link 
                      href="/signup" 
                      className="text-blue-700 hover:text-blue-800 font-medium"
                    >
                      Daftar sekarang
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
                    
            {/* Footer */}
            <div className="text-center text-xs text-gray-500 space-y-1">
              <p>© 2024 Universitas Muhammadiyah Bandung</p>
              <div className="space-x-4">
                <Link href="/privacy" className="hover:text-gray-700">Kebijakan Privasi</Link>
                <Link href="/terms" className="hover:text-gray-700">Syarat & Ketentuan</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
