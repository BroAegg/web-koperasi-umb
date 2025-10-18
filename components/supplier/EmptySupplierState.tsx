import { Card, CardContent } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

export default function EmptySupplierState() {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Tidak ada supplier untuk filter ini</p>
        <p className="text-sm text-gray-500 mt-1">Coba ubah filter untuk melihat supplier lain</p>
      </CardContent>
    </Card>
  );
}
