'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Upload, CheckCircle, AlertTriangle, Users, FileSpreadsheet } from 'lucide-react';

export default function MembershipImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setError('Please upload an Excel file (.xlsx or .xls)');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/members/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data);
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError(data.error || 'Failed to import members');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-600" />
          Import Data Anggota Koperasi
        </h1>
        <p className="text-slate-600 mt-2">
          Upload file Excel (.xlsx) untuk import data anggota simpan pinjam
        </p>
      </div>

      {/* Instructions */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardHeader>
          <h3 className="font-semibold text-blue-900 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Format File Excel
          </h3>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-800 space-y-2">
            <p className="font-medium">Sheet: ANGGOTA</p>
            <p>Kolom yang diperlukan:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>NO</strong> - Nomor urut anggota</li>
              <li><strong>NAMA ANGGOTA</strong> - Nama lengkap anggota</li>
              <li><strong>PENDAFTARAN ANGGOTA</strong> - Tanggal pendaftaran (format Excel date)</li>
              <li><strong>SIMPANAN POKOK</strong> - Jumlah simpanan pokok</li>
              <li><strong>TOTAL SIMPANAN WAJIB</strong> - Total simpanan wajib</li>
            </ul>
            <p className="text-xs italic mt-2">
              * Anggota yang sudah ada (berdasarkan nama) akan di-skip secara otomatis
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Upload Form */}
      <Card>
        <CardContent className="py-6">
          <div className="space-y-4">
            {/* File Input */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-8 hover:border-blue-500 transition-colors">
              <Upload className="h-12 w-12 text-slate-400 mb-4" />
              <label htmlFor="file-input" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700 font-medium">
                  Click to select file
                </span>
                <input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {file && (
                <p className="mt-2 text-sm text-slate-600">
                  Selected: <strong>{file.name}</strong>
                </p>
              )}
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full"
              size="lg"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Uploading & Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Members
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Success Result */}
      {result && (
        <Card className="mt-6 border-green-200 bg-green-50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="font-semibold text-green-900 mb-2">{result.message}</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-white rounded p-3 border border-green-200">
                    <p className="text-slate-600">Total Rows</p>
                    <p className="text-2xl font-bold text-slate-900">{result.stats.total}</p>
                  </div>
                  <div className="bg-white rounded p-3 border border-green-200">
                    <p className="text-slate-600">Imported</p>
                    <p className="text-2xl font-bold text-green-600">{result.stats.imported}</p>
                  </div>
                  <div className="bg-white rounded p-3 border border-yellow-200">
                    <p className="text-slate-600">Skipped</p>
                    <p className="text-2xl font-bold text-yellow-600">{result.stats.skipped}</p>
                  </div>
                </div>
                {result.stats.errors && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="font-semibold text-yellow-900 mb-2">Errors:</p>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      {result.stats.errors.slice(0, 5).map((err: string, i: number) => (
                        <li key={i} className="text-xs">{err}</li>
                      ))}
                      {result.stats.errors.length > 5 && (
                        <li className="text-xs italic">...and {result.stats.errors.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="mt-6 border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
