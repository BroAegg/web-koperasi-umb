# 📋 Panduan Pengisian Data Barang Minimarket

**File Template:** `template-data-barang.csv`

---

## 📝 **Kolom-Kolom CSV**

### **Kolom Wajib Diisi:**

1. **nama_produk** - Nama lengkap produk
   - Contoh: "Beras Premium 5kg", "Indomie Goreng", "Aqua 600ml"

2. **kategori** - Pilihan: `Sembako`, `Minuman`, `Makanan Ringan`, `Gorengan`
   - **Sembako**: Beras, minyak, gula, telur, dll
   - **Minuman**: Air mineral, teh, kopi, susu, dll  
   - **Makanan Ringan**: Keripik, biskuit, permen, dll
   - **Gorengan**: Risol, pisang goreng, tahu isi, dll

3. **harga_jual** - Harga jual ke konsumen (dalam Rupiah)
   - Contoh: 15000 (tanpa titik/koma)

4. **satuan** - Unit produk
   - Contoh: `pcs`, `pack`, `botol`, `kg`, `sak`, `kotak`

5. **jenis_kepemilikan** - Pilihan: `TOKO` atau `TITIPAN`
   - **TOKO**: Barang milik koperasi (beli dari supplier)
   - **TITIPAN**: Barang konsinyasi (dari penitip)

6. **siklus_stok** - Pilihan: `HARIAN`, `MINGGUAN`, `DUA_MINGGUAN`
   - **HARIAN**: Reset stok setiap hari (gorengan segar)
   - **MINGGUAN**: Restock seminggu sekali
   - **DUA_MINGGUAN**: Restock 2 minggu sekali

### **Kolom Opsional:**

7. **deskripsi** - Deskripsi produk (boleh kosong)
8. **sku** - Kode produk unik (auto-generate jika kosong)
9. **harga_beli** - Harga beli dari supplier (kosong untuk TITIPAN)
10. **stok_awal** - Jumlah stok awal (default: 0)
11. **minimum_stok** - Alert stok minimum (default: 5)
12. **kontak_supplier** - No. WhatsApp supplier/penitip
13. **keterangan** - Catatan tambahan (fee konsinyasi, dll)

---

## 🎯 **Contoh Pengisian**

### **Produk Toko (Milik Koperasi):**
```csv
Indomie Goreng 5pcs,Mie instan goreng,Makanan Ringan,IDM-001,12000,14000,100,20,pack,TOKO,MINGGUAN,081234567890,Supplier PT Indofood
```

### **Produk Titipan (Konsinyasi):**
```csv
Risol Mayo,Risol segar dengan mayo,Gorengan,RSL-001,,3000,0,15,pcs,TITIPAN,HARIAN,081234567891,Bu Sari - Fee 20%
```

---

## ⚠️ **Penting Diperhatikan:**

### **Untuk Produk TOKO:**
- ✅ **harga_beli** WAJIB diisi
- ✅ **harga_jual** harus lebih besar dari harga_beli
- ✅ **stok_awal** boleh diisi sesuai inventory fisik

### **Untuk Produk TITIPAN:**
- ✅ **harga_beli** dikosongkan (atau isi dengan tanda -)
- ✅ **stok_awal** biasanya 0 (karena belum ada yang dititipkan)
- ✅ **kontak_supplier** diisi dengan nomor penitip
- ✅ **keterangan** diisi dengan detail fee (contoh: "Fee 20%" atau "Fee Rp 2000/pack")

### **Format Angka:**
- Harga dalam Rupiah tanpa titik/koma: `15000` bukan `15.000`
- Stok dalam angka bulat: `50` bukan `50.0`

### **SKU (Kode Produk):**
- Format bebas, tapi sebaiknya konsisten
- Contoh: `BRS-001`, `IDM-GOR`, `RSL-001`
- Jika kosong, sistem akan auto-generate

---

## 🚀 **Cara Import ke Sistem:**

1. **Isi file CSV** sesuai panduan di atas
2. **Save sebagai .csv** (bukan .xlsx)
3. **Upload via sistem** atau berikan ke developer
4. **Data akan di-import** ke database
5. **Verifikasi** melalui halaman inventory

---

## 📞 **Bantuan:**

Jika ada pertanyaan tentang pengisian, hubungi tim developer atau admin sistem.

**Tips:** Mulai dengan produk-produk utama dulu (10-20 item), baru kemudian tambahkan yang lain secara bertahap.