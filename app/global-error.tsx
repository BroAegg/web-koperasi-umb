'use client';

export const dynamic = 'force-dynamic';

import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
          <div className="text-center px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mt-4">Terjadi Kesalahan</h1>
            <p className="text-gray-600 mt-2 max-w-md mx-auto">
              Maaf, terjadi kesalahan pada aplikasi. Silakan coba lagi.
            </p>
            <button
              onClick={reset}
              className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
