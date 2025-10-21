'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function SupplierPendingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get email from sessionStorage
    const pendingEmail = sessionStorage.getItem('pendingSupplierEmail');
    if (pendingEmail) {
      setEmail(pendingEmail);
    }
  }, []);

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
            {email && (
              <p className="text-gray-700">
                <span className="font-medium">Email:</span> {email}
              </p>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Kami akan menghubungi Anda melalui email setelah persetujuan admin.
          </p>
          <Button 
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push('/login')}
          >
            Kembali ke Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
