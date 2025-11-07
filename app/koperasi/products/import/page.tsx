'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/use-auth';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ImportResult {
  success: boolean;
  totalRows: number;
  imported: number;
  skipped: number;
  errors: Array<{ row: number; error: string }>;
  warnings: Array<{ row: number; warning: string }>;
}

export default function ImportProductsPage() {
  const { user, loading: authLoading, authorized } = useAuth(['SUPER_ADMIN']);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
      ];
      const isValid = validTypes.includes(selectedFile.type) ||
        selectedFile.name.endsWith('.xlsx') ||
        selectedFile.name.endsWith('.xls') ||
        selectedFile.name.endsWith('.csv');

      if (!isValid) {
        setError('Invalid file type. Please upload .xlsx, .xls, or .csv file');
        return;
      }

      setFile(selectedFile);
      setError('');
      setResult(null);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/admin/products/import');
      if (!response.ok) throw new Error('Failed to download template');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'import-template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Failed to download template');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import products');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to import products');
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || !authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Import Products</h1>
            <p className="text-blue-100">Upload Excel file to import multiple products at once</p>
          </div>
        </div>
      </div>

      {/* Download Template */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Step 1: Download Template</h2>
            <p className="text-gray-600 mb-4">
              Download our Excel template with sample data and column definitions.
            </p>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>• Pre-configured with correct column names</li>
              <li>• Includes 3 sample products as examples</li>
              <li>• Ready to use - just replace sample data with your products</li>
            </ul>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Template
          </button>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-purple-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Step 2: Upload Your File</h2>

        {/* File Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Excel File (.xlsx, .xls, .csv)
          </label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
        </div>

        {/* Selected File Info */}
        {file && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-600">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Importing Products...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Import Products
            </>
          )}
        </button>
      </div>

      {/* Import Result */}
      {result && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Import Results</h2>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Total Rows</p>
              <p className="text-3xl font-bold text-blue-900">{result.totalRows}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Imported</p>
              <p className="text-3xl font-bold text-green-900">{result.imported}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-600 font-medium">Skipped</p>
              <p className="text-3xl font-bold text-yellow-900">{result.skipped}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium">Success Rate</p>
              <p className="text-3xl font-bold text-purple-900">
                {result.totalRows > 0
                  ? ((result.imported / result.totalRows) * 100).toFixed(0)
                  : 0}%
              </p>
            </div>
          </div>

          {/* Errors */}
          {result.errors.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-red-700 mb-2 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Errors ({result.errors.length})
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                {result.errors.map((err, idx) => (
                  <div key={idx} className="text-sm text-red-800 mb-2">
                    <span className="font-semibold">Row {err.row}:</span> {err.error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Warnings ({result.warnings.length})
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                {result.warnings.map((warn, idx) => (
                  <div key={idx} className="text-sm text-yellow-800 mb-2">
                    <span className="font-semibold">Row {warn.row}:</span> {warn.warning}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Message */}
          {result.imported > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">
                    Successfully imported {result.imported} products!
                  </p>
                  <p className="text-sm text-green-700">
                    You can now view them in the Products list.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">📋 Important Notes:</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• <strong>Required columns:</strong> name, category, buyPrice, sellPrice</li>
          <li>• <strong>Category names</strong> must match exactly (case-insensitive)</li>
          <li>• <strong>Barcode</strong> must be unique if provided</li>
          <li>• <strong>Prices</strong> must be numbers without currency symbols</li>
          <li>• <strong>Stock</strong> defaults to 0 if not provided</li>
          <li>• <strong>Suppliers</strong> will be created automatically if they don't exist</li>
        </ul>
        
        <div className="mt-4 pt-4 border-t border-purple-300">
          <p className="text-sm text-gray-600">
            <strong>Need help?</strong> Check the{' '}
            <a href="/docs/IMPORT_TEMPLATE_GUIDE.md" className="text-purple-600 hover:underline">
              Import Guide Documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
