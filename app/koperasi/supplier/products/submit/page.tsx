"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft,
  Upload,
  Package,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface SupplierLimits {
  maxActiveProducts: number;
  currentActiveProducts: number;
  remaining: number;
}

export default function SubmitProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [limits, setLimits] = useState<SupplierLimits | null>(null);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    price: "",
    stockInitial: "",
    unit: "pcs",
    image: "",
  });

  useEffect(() => {
    fetchCategories();
    fetchLimits();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };

  const fetchLimits = async () => {
    try {
      const res = await fetch("/api/supplier/products/submit");
      const data = await res.json();
      if (data.success) {
        setLimits(data.data.limits);
      }
    } catch (error) {
      console.error("Fetch limits error:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran file maksimal 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setFormData({ ...formData, image: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name || !formData.categoryId || !formData.price || !formData.stockInitial) {
      setError("Harap lengkapi semua field yang wajib diisi");
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      setError("Harga harus lebih dari 0");
      return;
    }

    if (parseInt(formData.stockInitial) < 0) {
      setError("Stok awal tidak boleh negatif");
      return;
    }

    if (limits && limits.remaining <= 0) {
      setError(`Anda telah mencapai batas maksimal ${limits.maxActiveProducts} produk aktif`);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/supplier/products/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          categoryId: formData.categoryId,
          price: parseFloat(formData.price),
          stockInitial: parseInt(formData.stockInitial),
          unit: formData.unit,
          image: formData.image,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Terjadi kesalahan");
        return;
      }

      // Success
      alert("✅ Produk berhasil diajukan! Menunggu persetujuan admin.");
      router.push("/koperasi/supplier/products/submissions");
    } catch (error) {
      console.error("Submit error:", error);
      setError("Terjadi kesalahan saat mengirim data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                Ajukan Produk Baru
              </h1>
              <p className="text-slate-600 mt-2">
                Isi formulir di bawah untuk mengajukan produk baru ke koperasi
              </p>
            </div>

            {limits && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <div className="text-xs text-blue-600 font-medium">Limit Produk</div>
                <div className="text-2xl font-bold text-blue-700">
                  {limits.remaining} <span className="text-sm font-normal">/ {limits.maxActiveProducts}</span>
                </div>
                <div className="text-xs text-blue-600">tersisa</div>
              </div>
            )}
          </div>
        </div>

        {/* Info Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">Informasi Penting:</p>
            <ul className="list-disc list-inside space-y-1 text-amber-700">
              <li>Produk yang diajukan akan ditinjau oleh admin</li>
              <li>Proses persetujuan memakan waktu 1-3 hari kerja</li>
              <li>Pastikan data yang diisi akurat dan lengkap</li>
              <li>Anda dapat mengajukan maksimal {limits?.maxActiveProducts || 10} produk aktif</li>
            </ul>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informasi Produk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nama Produk */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Minyak Goreng Bimoli 1L"
                  required
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Deskripsi Produk
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan detail produk, spesifikasi, atau informasi penting lainnya..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Harga & Stok */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Harga Jual <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="15000"
                    min="0"
                    step="100"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Dalam Rupiah</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Stok Awal <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.stockInitial}
                    onChange={(e) => setFormData({ ...formData, stockInitial: e.target.value })}
                    placeholder="100"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Satuan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pcs">Pcs</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                    <option value="kg">Kg</option>
                    <option value="liter">Liter</option>
                    <option value="gram">Gram</option>
                  </select>
                </div>
              </div>

              {/* Upload Gambar */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Gambar Produk (Opsional)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData({ ...formData, image: "" });
                        }}
                      >
                        Hapus Gambar
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 mb-1">
                        Klik untuk upload gambar produk
                      </p>
                      <p className="text-xs text-slate-500">
                        PNG, JPG, WebP (Max 2MB)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload">
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-4"
                          onClick={() => document.getElementById("image-upload")?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Pilih Gambar
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || (limits ? limits.remaining <= 0 : false)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Ajukan Produk
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
