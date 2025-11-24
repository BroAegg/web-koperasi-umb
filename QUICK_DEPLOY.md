# 🚀 QUICK DEPLOYMENT - 5 Menit ke Public UAT

## Cara Tercepat (Vercel + PlanetScale):

### 1️⃣ Setup Database (3 menit)
```
1. Buka https://planetscale.com
2. Sign up dengan GitHub
3. Create database: "koperasi-umb-uat"
4. Copy connection string dari dashboard
```

### 2️⃣ Deploy ke Vercel (2 menit)
```
1. Push code ke GitHub (jika belum)
2. Buka https://vercel.com
3. Import repository
4. Set Environment Variables:
   - DATABASE_URL = [paste dari PlanetScale]
   - NEXTAUTH_URL = https://[akan-di-isi-otomatis]
   - NEXTAUTH_SECRET = [generate: openssl rand -base64 32]
   - NODE_ENV = production
5. Click Deploy
```

### 3️⃣ Setup Database Schema (30 detik)
```bash
# Update .env dengan DATABASE_URL cloud
npx prisma db push
```

### ✅ DONE!
Link UAT: `https://web-koperasi-umb.vercel.app`

---

## Environment Variables Template

Copy-paste ini ke Vercel:

```env
DATABASE_URL=mysql://[user]:[pass]@[host].us-east-1.psdb.cloud/koperasi-umb-uat?sslaccept=strict
NEXTAUTH_URL=https://[your-project].vercel.app
NEXTAUTH_SECRET=[run: openssl rand -base64 32]
NODE_ENV=production
```

---

## Generate NEXTAUTH_SECRET

**Windows PowerShell:**
```powershell
.\deploy-uat.ps1
```

**Mac/Linux:**
```bash
chmod +x deploy-uat.sh
./deploy-uat.sh
```

**Manual:**
```bash
openssl rand -base64 32
```

---

## Testing URL

Setelah deploy, test di:
```
https://[your-project].vercel.app/
```

Login default (jika seed data):
```
Email: admin@koperasi.com
Password: admin123
```

---

## Troubleshooting

**Build gagal?**
- Check `package.json` ada `"postinstall": "prisma generate"`

**Database connection error?**
- Pastikan DATABASE_URL format benar
- PlanetScale butuh `?sslaccept=strict` di akhir URL

**Login tidak bisa?**
- NEXTAUTH_SECRET harus 32+ karakter
- NEXTAUTH_URL harus sama dengan deployed URL
- Pastikan database sudah di-push schema

---

## Update Code

Setelah push ke GitHub:
```bash
git add .
git commit -m "Update feature"
git push
```

Vercel auto-deploy dalam 1-2 menit ✨

---

Baca guide lengkap: **DEPLOYMENT_UAT_GUIDE.md**
