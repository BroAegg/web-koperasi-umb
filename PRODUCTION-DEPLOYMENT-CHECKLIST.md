# 🚀 PRODUCTION DEPLOYMENT CHECKLIST
## Koperasi Universitas Muhammadiyah Bandung
**Target Deploy: 27 Oktober 2025 (2 HARI LAGI)**

---

## ❌ CRITICAL ISSUES (WAJIB DIPERBAIKI)

### 1. 🔐 **SECURITY - JWT_SECRET**
**Status:** ⚠️ **BERBAHAYA - Masih menggunakan development secret**

**Masalah:**
```env
# File: .env (CURRENT)
JWT_SECRET="koperasi-umb-dev-team-secret-2025-sync-required"
```
- Secret ini sudah ada di Git history dan bisa dilihat publik
- Sangat mudah ditebak penyerang
- Jika bocor, semua token bisa dipalsukan

**Action Required:**
```bash
# Generate production JWT secret (kompleks & random)
openssl rand -base64 64

# Hasil contoh:
# JWT_SECRET="xK9mP2vL8nR4tQ7wE3yU6hB1aS5dF0gH9jC8kL2mN5pO3qR6tU9vW2xZ4aB7cD1eF5gH8iJ0kL3mN6oP9qR2sT5uV8wX1yZ4"
```

**File yang harus dibuat:**
- `.env.production` (untuk hosting server)
- JANGAN commit JWT_SECRET production ke Git!

---

### 2. 🐛 **DEBUG LOGS - Masih banyak console.log**
**Status:** ⚠️ **Bocor sensitive data ke production logs**

**Ditemukan 60+ debug console.log di:**
- `lib/auth.ts` - Menampilkan token, userId, email
- `app/api/analytics/**/*.ts` - Token dan auth details
- `app/api/suppliers/register/route.ts` - Registration data
- `app/api/supplier/upload-payment/route.ts` - Payment data

**Bahaya:**
```typescript
// BAHAYA - Ini akan tampil di production logs!
console.log('[verifyToken] Token (first 50 chars):', token.substring(0, 50));
console.log('[getUserFromToken] User found:', user.email);
console.log('Registration data:', { name, email, phone, password: '[REDACTED]' }); // Password tetap berbahaya
```

**Action Required:**
1. Remove ALL debug console.log
2. Keep ONLY console.error for error tracking
3. Gunakan proper logging library (Winston/Pino)

---

### 3. 📁 **FILE UPLOAD - Belum ada storage production**
**Status:** ⚠️ **Upload payment proof tidak akan berfungsi**

**Masalah:**
```typescript
// app/api/suppliers/register/route.ts:116
// TODO: In production, upload file to cloud storage here
paymentProofUrl = `/uploads/payments/local-${Date.now()}.jpg`; // ❌ Fake path!
```

**File upload yang terpengaruh:**
- Bukti pembayaran supplier (`/api/supplier/upload-payment`)
- Bukti registrasi supplier (`/api/suppliers/register`)
- Payment proof admin verification

**Action Required:**
```bash
# Option 1: Cloud Storage (RECOMMENDED)
npm install @supabase/supabase-js
# Setup Supabase bucket untuk file uploads

# Option 2: Server Local Storage
mkdir -p public/uploads/payments
mkdir -p public/uploads/proofs
# Configure Nginx/Apache untuk serve static files
```

---

### 4. 🗄️ **DATABASE - Development credentials**
**Status:** ⚠️ **Masih pointing ke localhost**

**Current:**
```env
DATABASE_URL="postgresql://postgres:koperasi@localhost:5432/koperasi_dev?schema=public"
```

**Production needs:**
```env
# Production database (contoh)
DATABASE_URL="postgresql://koperasi_user:STRONG_PASSWORD@production-db-host:5432/koperasi_prod?schema=public&sslmode=require"
```

**Checklist:**
- [ ] Setup PostgreSQL di production server
- [ ] Buat database baru: `koperasi_prod`
- [ ] Buat user khusus dengan limited permissions
- [ ] Enable SSL connection
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] **JANGAN seed demo data di production!**

---

## ⚠️ HIGH PRIORITY (Sangat Disarankan)

### 5. 🔒 **Environment Variables**
**Missing Files:**
- `.env.production` ❌
- `.env.example` ❌ (untuk dokumentasi tim)

**Buat file ini:**
```bash
# .env.example (commit ke Git)
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
JWT_SECRET="your-secret-here-DO-NOT-USE-THIS"
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://your-domain.com"
```

### 6. 📊 **Seed Data - Jangan jalankan di production**
**File seed yang berbahaya:**
- `seed-demo-data.js` - 100+ fake transactions
- `seed-complete-demo.js` - Demo products & members
- `seed-consignment-data.js` - Fake consignment data

**Action Required:**
```json
// package.json - Separate seed commands
{
  "scripts": {
    "seed:dev": "node seed-demo-data.js",
    "seed:prod": "npx prisma db seed", // Only initial admin/categories
    "db:reset": "npx prisma migrate reset && npm run seed:dev", // DEV ONLY
    "db:deploy": "npx prisma migrate deploy" // PRODUCTION
  }
}
```

### 7. 🌐 **CORS & Security Headers**
**Missing:** Belum ada CORS configuration

**Add to `next.config.ts`:**
```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://koperasi-umb.ac.id' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};
```

### 8. 🔍 **Error Handling**
**Missing:** Tidak ada centralized error handler

**Buat file:**
```typescript
// lib/error-handler.ts
export function handleAPIError(error: unknown) {
  if (process.env.NODE_ENV === 'production') {
    // Send to error tracking service (Sentry)
    console.error('API Error:', error instanceof Error ? error.message : 'Unknown');
    return { success: false, error: 'Internal server error' };
  }
  // Development - show details
  return { success: false, error: String(error) };
}
```

---

## 📝 MEDIUM PRIORITY (Bisa nanti)

### 9. 📈 **Monitoring & Logging**
**Recommended Tools:**
- **Error Tracking:** Sentry (free tier)
- **Performance:** Vercel Analytics / Google Analytics
- **Uptime:** UptimeRobot (free)

### 10. 🧪 **Testing**
**Missing:** Belum ada automated tests

**Quick wins:**
```bash
# Test critical flows manually
1. Login Super Admin ✓
2. Create new supplier ✓
3. Verify supplier payment ✓
4. Add product to inventory ✓
5. Process POS transaction ✓
6. View analytics dashboard ✓
```

### 11. 🚀 **Performance**
**Check:**
- [ ] Enable Next.js image optimization
- [ ] Setup CDN untuk static assets
- [ ] Database indexes untuk queries yang lambat
- [ ] Enable gzip compression

---

## 🎯 DEPLOYMENT TIMELINE (2 HARI)

### **DAY 1 - Hari ini (25 Okt)**
**Pagi (4 jam):**
1. ✅ Generate production JWT_SECRET
2. ✅ Buat `.env.production` file
3. ✅ Remove ALL debug console.log
4. ✅ Setup file upload storage (Supabase/Local)

**Siang (4 jam):**
5. ✅ Setup production database
6. ✅ Run migrations di production
7. ✅ Seed initial admin user only
8. ✅ Test database connection

### **DAY 2 - Besok (26 Okt)**
**Pagi (4 jam):**
9. ✅ Add security headers
10. ✅ Configure CORS
11. ✅ Build production (`npm run build`)
12. ✅ Test production build locally

**Siang (4 jam):**
13. ✅ Deploy ke hosting server
14. ✅ Configure SSL certificate
15. ✅ Test all critical features
16. ✅ Create backup system

### **LAUNCH DAY (27 Okt)**
17. 🚀 Go live!
18. 👀 Monitor logs closely
19. 📞 Siap handle bug reports

---

## 🛠️ QUICK FIX COMMANDS

```powershell
# 1. Generate production JWT secret
$secret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})
echo "JWT_SECRET=`"$secret`"" > .env.production

# 2. Remove debug logs (run dengan hati-hati!)
# Manual review required - jangan hapus semua console.error

# 3. Build production
npm run build
npm run start # Test locally

# 4. Database production
npx prisma migrate deploy
npx prisma generate

# 5. Test endpoints
curl https://your-domain.com/api/health
```

---

## ✅ PRE-LAUNCH CHECKLIST

### **Security:**
- [ ] JWT_SECRET production ≠ development
- [ ] .env.production TIDAK di Git
- [ ] Remove ALL console.log sensitive data
- [ ] Enable HTTPS/SSL only
- [ ] Setup CORS properly
- [ ] Add security headers

### **Database:**
- [ ] Production database ready
- [ ] Migrations deployed
- [ ] Initial admin user created
- [ ] NO demo/seed data
- [ ] Backup strategy aktif

### **Files & Storage:**
- [ ] Payment proof upload works
- [ ] File storage configured (Supabase/Local)
- [ ] Public folder permissions correct

### **Testing:**
- [ ] Login flow works
- [ ] Supplier registration works
- [ ] POS transactions work
- [ ] Analytics dashboard loads
- [ ] Print receipts work
- [ ] Mobile responsive

### **Infrastructure:**
- [ ] SSL certificate installed
- [ ] Domain pointing correctly
- [ ] Server firewall configured
- [ ] Monitoring tools active

### **Documentation:**
- [ ] Admin login credentials saved
- [ ] Database backup credentials saved
- [ ] Emergency contact list ready

---

## 🆘 EMERGENCY CONTACTS

**Jika ada masalah saat deployment:**
1. **Database issues:** Rollback migrations
2. **Auth errors:** Regenerate JWT_SECRET
3. **File upload fails:** Switch to local storage temporarily
4. **Performance slow:** Check database indexes

---

## 📚 POST-LAUNCH

**Week 1:**
- Monitor error logs daily
- Collect user feedback
- Fix critical bugs immediately

**Week 2-4:**
- Add monitoring dashboards
- Setup automated backups
- Implement rate limiting
- Add API documentation

**Long-term:**
- Setup CI/CD pipeline
- Add automated tests
- Performance optimization
- Feature enhancements

---

## 🎓 TRAINING NOTES (Untuk Staff UMB)

**Penting untuk diajarkan:**
1. Cara login sebagai Super Admin
2. Cara verify supplier baru
3. Cara proses transaksi POS
4. Cara lihat laporan analytics
5. Cara backup database manual

**Video tutorial recommended:**
- 5 menit: Login & Dashboard overview
- 10 menit: Supplier verification workflow
- 15 menit: POS transaction complete flow
- 10 menit: Analytics & reports

---

**Created:** 25 Oktober 2025  
**Target Launch:** 27 Oktober 2025  
**Status:** 🔴 CRITICAL FIXES REQUIRED BEFORE DEPLOYMENT
