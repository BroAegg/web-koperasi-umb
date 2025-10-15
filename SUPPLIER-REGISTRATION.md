# Supplier Registration & Settings - Feature Documentation

## 📋 Overview
Fitur baru yang telah diimplementasikan untuk sistem Koperasi UMB:
1. **Pendaftaran Supplier** - Supplier dapat mendaftar sendiri melalui halaman registrasi
2. **Settings Page** - User dapat mengubah profil dan password
3. **Enhanced Logout** - Konfirmasi logout sebelum keluar

---

## 🚀 Fitur 1: Pendaftaran Supplier

### 1.1 Link Pendaftaran di Login Page
**Lokasi**: `app/(auth)/login/page.tsx`

Ditambahkan link "Ingin jadi supplier? **Daftar di sini**" di bawah link signup yang ada.

```tsx
<p className="text-sm text-gray-600">
  Ingin jadi supplier?{' '}
  <Link href="/supplier/register" className="text-blue-700 hover:text-blue-800 font-medium">
    Daftar di sini
  </Link>
</p>
```

### 1.2 Halaman Registrasi Supplier
**Lokasi**: `app/supplier/register/page.tsx`

**Form Fields:**
- ✅ Nama Lengkap (required)
- ✅ Email (required)
- ✅ Nomor Telepon (required)
- ✅ Kategori Produk (required, dropdown)
  - Makanan
  - Minuman
  - Alat Tulis Kantor (ATK)
  - Bahan Pokok
  - Snack & Makanan Ringan
  - Lainnya
- ✅ Alamat (required, textarea)
- ✅ Deskripsi (optional, textarea)

**Design:**
- Konsisten dengan login page (blue gradient kiri, white card kanan)
- Logo UMB dan branding "KOPERASI UM BANDUNG"
- Responsive untuk mobile dan desktop

**Success State:**
- Icon CheckCircle hijau
- Pesan: "Pendaftaran Berhasil! Pendaftaran Anda sedang diproses. Silakan tunggu konfirmasi dari admin."
- Auto-redirect ke login setelah 3 detik

### 1.3 API Endpoint Supplier Registration
**Lokasi**: `app/api/suppliers/route.ts`

#### POST /api/suppliers
Membuat akun supplier baru dengan status PENDING.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "category": "string",
  "address": "string",
  "description": "string (optional)"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Pendaftaran berhasil. Menunggu persetujuan admin.",
  "data": {
    "id": "cuid",
    "name": "Nama Supplier",
    "email": "email@example.com",
    "status": "PENDING"
  }
}
```

**Error Responses:**
- `400` - Field wajib tidak diisi
- `409` - Email sudah terdaftar
- `500` - Server error

**Proses di Backend:**
1. Validasi input (semua field kecuali description)
2. Check email uniqueness
3. Generate default password: `Supplier123!`
4. Hash password menggunakan bcrypt
5. Buat User dengan role SUPPLIER dan isActive=false
6. Buat SupplierProfile dengan status PENDING
7. Return success response

**Note:** Default password `Supplier123!` (dalam production nanti dikirim via email)

#### GET /api/suppliers
Mendapatkan daftar supplier (untuk admin).

**Query Parameters:**
- `status` (optional): Filter by status (PENDING, APPROVED, ACTIVE, etc.)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid",
      "businessName": "string",
      "ownerName": "string",
      "phone": "string",
      "status": "PENDING",
      "user": {
        "id": "cuid",
        "email": "string",
        "name": "string",
        "isActive": boolean
      },
      "payments": []
    }
  ]
}
```

---

## ⚙️ Fitur 2: Settings Page

### 2.1 Settings Page UI
**Lokasi**: `app/koperasi/settings/page.tsx`

**Sections:**

#### A. Informasi Profil
- Nama Lengkap (editable)
- Email (editable, check uniqueness)
- Role (read-only, disabled field)

#### B. Ubah Password
- Password Saat Ini (required, with show/hide toggle)
- Password Baru (required, min 8 characters, with show/hide toggle)
- Konfirmasi Password Baru (required, must match, with show/hide toggle)

**Features:**
- Success messages (green banner)
- Error messages (red banner)
- Loading states during save
- Auto-dismiss messages after 3 seconds

### 2.2 Settings API Endpoints

#### PUT /api/auth/profile
**Lokasi**: `app/api/auth/profile/route.ts`

Update nama dan email user.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "string",
  "email": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profil berhasil diperbarui",
  "user": {
    "id": "cuid",
    "name": "string",
    "email": "string",
    "role": "SUPER_ADMIN|ADMIN|SUPPLIER|USER",
    "isActive": boolean
  }
}
```

**Error Cases:**
- `400` - Nama atau email kosong
- `401` - Token invalid/expired
- `409` - Email sudah digunakan user lain

---

#### POST /api/auth/change-password
**Lokasi**: `app/api/auth/change-password/route.ts`

Ubah password user dengan verifikasi password lama.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password berhasil diubah"
}
```

**Error Cases:**
- `400` - Field kosong / password baru < 8 karakter / password lama salah
- `401` - Token invalid/expired

**Security:**
- Verifikasi current password menggunakan bcrypt
- Hash new password sebelum disimpan
- Minimum 8 characters untuk password baru

---

## 🚪 Fitur 3: Enhanced Logout

### 3.1 Logout Confirmation Modal
**Lokasi**: `app/koperasi/layout.tsx`

**Features:**
- Modal dialog dengan backdrop overlay
- Icon LogOut merah dalam circle
- Heading: "Konfirmasi Logout"
- Subtext: "Anda yakin ingin keluar?"
- Tombol "Batal" (outline)
- Tombol "Ya, Logout" (red, primary)

**Functionality:**
1. User klik tombol Logout di sidebar
2. Modal muncul dengan overlay
3. User bisa:
   - Klik "Batal" → modal tutup
   - Klik "Ya, Logout" → hapus token, redirect ke `/login`
   - Klik overlay → modal tutup

### 3.2 Settings Navigation Link
Ditambahkan menu Settings di sidebar:
- Icon: Settings (gear)
- Label: "Settings"
- Route: `/koperasi/settings`
- Active state highlighting

**Position:** Di atas tombol Logout, dalam section border-top

---

## 🔐 Security & Best Practices

### Password Security
- ✅ Bcrypt hashing dengan 10 salt rounds
- ✅ Minimum 8 characters untuk password baru
- ✅ Current password verification sebelum change
- ✅ Password tidak pernah di-return dalam API responses

### Email Uniqueness
- ✅ Check di database sebelum create/update
- ✅ Proper error handling dengan status code 409 (Conflict)
- ✅ Case-sensitive email comparison

### Token Security
- ✅ JWT dengan 7 days expiry
- ✅ Token disimpan di localStorage
- ✅ Bearer token authentication di semua protected endpoints
- ✅ Token verification di setiap API call

### Input Validation
- ✅ Required field validation di frontend
- ✅ Server-side validation di API endpoints
- ✅ Proper error messages untuk user
- ✅ TypeScript type safety

---

## 📱 Responsive Design

Semua fitur baru fully responsive:

### Mobile (< 768px)
- Form fields stack vertically
- Sidebar slide-in dengan overlay
- Touch-friendly button sizes
- Optimized padding dan spacing

### Tablet (768px - 1024px)
- Balanced layout
- Sidebar bisa toggle atau fixed

### Desktop (> 1024px)
- Fixed sidebar navigation
- Multi-column layouts where appropriate
- Optimal form width (max-w-4xl)

---

## 🧪 Testing Guide

### Test Supplier Registration

1. **Go to Login Page**: http://localhost:3000/login
2. **Click**: "Ingin jadi supplier? Daftar di sini"
3. **Fill Form**:
   ```
   Nama: Supplier Test
   Email: supplier.test@example.com
   Telepon: 081234567890
   Kategori: Makanan
   Alamat: Jl. Test No. 123, Bandung
   Deskripsi: Testing pendaftaran supplier
   ```
4. **Submit**: Klik "Daftar Sebagai Supplier"
5. **Verify**: 
   - Success message muncul
   - Auto-redirect ke login setelah 3 detik
   - Check database: `SELECT * FROM users WHERE email = 'supplier.test@example.com'`
   - Check supplier_profiles untuk entry baru dengan status PENDING

### Test Settings - Profile Update

1. **Login** sebagai user mana saja
2. **Navigate**: Click Settings di sidebar
3. **Update Profile**:
   - Change nama: "John Doe Updated"
   - Change email: "john.updated@example.com"
   - Click "Simpan Perubahan"
4. **Verify**:
   - Green success message muncul
   - Sidebar user info updated
   - Database updated

### Test Settings - Change Password

1. **Di Settings Page**, scroll ke section "Ubah Password"
2. **Fill Form**:
   ```
   Password Saat Ini: [current password]
   Password Baru: NewPassword123!
   Konfirmasi: NewPassword123!
   ```
3. **Submit**: Klik "Ubah Password"
4. **Verify**:
   - Success message muncul
   - Form cleared
   - Logout dan login dengan password baru

### Test Logout Confirmation

1. **Click** tombol Logout di sidebar
2. **Verify**:
   - Modal muncul dengan overlay
   - "Konfirmasi Logout" heading visible
3. **Test Cancel**: Click "Batal" → modal closes
4. **Test Confirm**: 
   - Click Logout lagi
   - Click "Ya, Logout"
   - Verify redirect ke `/login`
   - Verify token dihapus dari localStorage
   - Try access protected page → redirected to login

---

## 🗃️ Database Schema Updates

### SupplierProfile Model
```prisma
model SupplierProfile {
  id              String              @id @default(cuid())
  userId          String              @unique
  businessName    String
  ownerName       String
  phone           String
  address         String
  productCategory String
  description     String?
  status          SupplierStatus      @default(PENDING)
  monthlyFee      Decimal             @default(25000)
  // ... other fields
}

enum SupplierStatus {
  PENDING
  APPROVED
  REJECTED
  SUSPENDED
  ACTIVE
}
```

---

## 📝 Credentials for Testing

### Existing Test Accounts
```
SUPER ADMIN:
Email: superadmin@koperasi.com
Password: Password123!

ADMIN:
Email: admin@koperasi.com
Password: Password123!

SUPPLIER (existing):
Email: supplier@koperasi.com
Password: Password123!
```

### New Supplier Registration
Default password yang di-generate: `Supplier123!`
(Supplier akan login dengan email yang didaftarkan + password default ini)

---

## 🔄 Flow Diagram

### Supplier Registration Flow
```
User di Login Page
    ↓
Click "Daftar di sini"
    ↓
Fill Registration Form
    ↓
Submit → POST /api/suppliers
    ↓
Validation & Email Check
    ↓
Create User (role=SUPPLIER, isActive=false)
    ↓
Create SupplierProfile (status=PENDING)
    ↓
Return Success
    ↓
Show Success Message
    ↓
Auto-redirect to Login (3s)
    ↓
Supplier Login dengan password default
    ↓
Dashboard shows "Menunggu Persetujuan"
```

### Settings Update Flow
```
User di Dashboard
    ↓
Click Settings di Sidebar
    ↓
Update Profile / Change Password
    ↓
Submit → PUT /api/auth/profile atau POST /api/auth/change-password
    ↓
Token Verification
    ↓
Validation
    ↓
Update Database
    ↓
Return Success
    ↓
Show Success Message
    ↓
Update UI State
```

---

## 🚧 Future Enhancements

### Supplier Registration
- [ ] Email verification sebelum approval
- [ ] Email notification ke admin saat ada pendaftaran baru
- [ ] SMS verification untuk nomor telepon
- [ ] File upload untuk dokumen (KTP, SIUP, dll)
- [ ] Auto-generate username dari nama bisnis

### Settings
- [ ] Avatar upload
- [ ] Notification preferences
- [ ] Two-factor authentication
- [ ] Account activity log
- [ ] Download account data (GDPR)

### Logout
- [ ] Remember device option
- [ ] Session timeout warning
- [ ] Activity tracking

---

## ✅ Checklist Completion

- [x] Supplier registration link di login page
- [x] Supplier registration form dengan 6 fields
- [x] Supplier registration API endpoint
- [x] Email uniqueness validation
- [x] Settings page UI (profile + password)
- [x] Update profile API endpoint
- [x] Change password API endpoint
- [x] Logout confirmation modal
- [x] Settings link di navigation
- [x] Responsive design untuk semua pages
- [x] Error handling dan validation
- [x] Success/error messages
- [x] Loading states
- [x] Documentation

---

## 📚 File Changes Summary

### New Files Created
```
app/supplier/register/page.tsx           - Supplier registration form
app/api/suppliers/route.ts               - Supplier registration API
app/koperasi/settings/page.tsx           - Settings page
app/api/auth/profile/route.ts            - Update profile API
app/api/auth/change-password/route.ts    - Change password API
SUPPLIER-REGISTRATION.md                 - This documentation
```

### Modified Files
```
app/(auth)/login/page.tsx                - Added supplier registration link
app/koperasi/layout.tsx                  - Added logout modal, settings link
```

---

## 🎯 Conclusion

Semua fitur yang diminta telah berhasil diimplementasikan:
1. ✅ **Supplier Registration** - Supplier dapat mendaftar sendiri dengan form lengkap
2. ✅ **Settings Page** - User dapat update profile dan change password
3. ✅ **Sign Out** - Enhanced logout dengan confirmation modal

Sistem sekarang siap untuk:
- Menerima pendaftaran supplier baru
- User management yang lebih lengkap
- Better UX dengan confirmation dialogs

**Next Steps:**
1. Test semua fitur secara menyeluruh
2. Implement admin approval interface untuk supplier PENDING
3. Setup email notifications
4. Add more security features (2FA, etc.)
