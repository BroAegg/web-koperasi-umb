export const dynamic = 'force-dynamic';

import { Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mt-4">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-600 mt-2 max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
