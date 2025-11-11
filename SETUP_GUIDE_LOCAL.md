# 🚀 Panduan Setup Web Koperasi UMB (Local - XAMPP)

> **Panduan lengkap dari instalasi hingga running di local menggunakan XAMPP MySQL**

---

## 📋 Prerequisites

Sebelum memulai, pastikan sudah install:

### 1. Node.js (v18 atau lebih tinggi)
```bash
# Check apakah sudah terinstall
node --version

# Jika belum, download dari:
# https://nodejs.org/ (pilih LTS version)
```

### 2. XAMPP
```bash
# Download dari: https://www.apachefriends.org/
# Install dan pastikan MySQL service berjalan
```

### 3. Git (optional, untuk clone repository)
```bash
git --version
```

---

## 🛠️ Step-by-Step Installation

### Step 1: Install Node.js

**Untuk Linux (Ubuntu/Debian):**
```bash
# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

**Untuk Windows:**
1. Download installer dari https://nodejs.org/
2. Jalankan installer
3. Restart terminal/cmd
4. Verify: `node --version` dan `npm --version`

---

### Step 2: Start XAMPP MySQL

**Linux:**
```bash
# Start XAMPP
sudo /opt/lampp/lampp start

# Atau hanya MySQL
sudo /opt/lampp/lampp startmysql

# Check MySQL status
sudo /opt/lampp/lampp status
```

**Windows:**
1. Buka XAMPP Control Panel
2. Klik **Start** pada MySQL
3. Pastikan status MySQL = **Running** (hijau)

**Verify MySQL berjalan:**
- Buka browser: http://localhost/phpmyadmin
- Seharusnya bisa akses phpMyAdmin

---

### Step 3: Install Dependencies

```bash
# Masuk ke folder project
cd /home/alexa/web-koperasi-umb

# Install semua dependencies
npm install

# Tunggu sampai selesai (akan download ~200MB)
# Jika error, coba jalankan lagi: npm install
```

**Expected output:**
```
added 500+ packages in 2m
```

---

### Step 4: Setup Database

#### 4.1 Buat Database di MySQL

**Option 1: Lewat phpMyAdmin**
1. Buka http://localhost/phpmyadmin
2. Klik **New** (sidebar kiri)
3. Database name: `koperasi_umb`
4. Collation: `utf8mb4_unicode_ci`
5. Klik **Create**

**Option 2: Lewat Terminal**
```bash
# Linux
sudo /opt/lampp/bin/mysql -u root -p

# Windows (dari XAMPP Shell atau CMD di folder xampp\mysql\bin)
mysql -u root -p

# Jika tidak ada password, tekan Enter saja
# Lalu jalankan:
CREATE DATABASE koperasi_umb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### 4.2 Update .env.local

File `.env.local` sudah dibuat otomatis. Verify isinya:

```bash
# Lihat isi file
cat .env.local
```

**Jika MySQL XAMPP pakai password**, edit DATABASE_URL:
```bash
# Edit file
nano .env.local

# Ubah baris DATABASE_URL jadi:
DATABASE_URL="mysql://root:PASSWORD_KAMU@localhost:3306/koperasi_umb"

# Ganti PASSWORD_KAMU dengan password MySQL kamu
# Save: Ctrl+O, Enter, Exit: Ctrl+X
```

**Port MySQL berbeda?** (misalnya 3307):
```
DATABASE_URL="mysql://root@localhost:3307/koperasi_umb"
```

---

### Step 5: Generate Prisma Client & Migrate Database

```bash
# Generate Prisma Client (TypeScript types)
npx prisma generate

# Push schema ke database (buat semua tabel)
npx prisma db push

# Output yang diharapkan:
# ✔ Generated Prisma Client
# Your database is now in sync with your Prisma schema.
```

**Verify di phpMyAdmin:**
- Refresh phpMyAdmin
- Klik database `koperasi_umb`
- Seharusnya ada ~20+ tabel (users, products, transactions, dll)

---

### Step 6: Seed Database (Data Awal)

```bash
# Seed users default
npx tsx prisma/seed-auth.ts

# Expected output:
# ✅ Created: manager@umb.ac.id (SUPER_ADMIN)
# ✅ Created: kasir1@umb.ac.id (ADMIN)
# ✅ Created: kasir2@umb.ac.id (ADMIN)  
# ✅ Created: aegner@umb.ac.id (DEVELOPER)
```

**Optional: Seed categories**
```bash
npx tsx prisma/seed-categories.ts
```

---

### Step 7: Start Development Server

```bash
# Jalankan server development
npm run dev

# Output:
#   ▲ Next.js 15.x
#   - Local:        http://localhost:3000
#   - Ready in 2.5s
```

**Buka browser:** http://localhost:3000

---

## 🎉 Testing & Login

### Default Users

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Super Admin** | manager@umb.ac.id | KoperasiUMB2025 | Full access |
| **Kasir 1** | kasir1@umb.ac.id | Kasir123 | POS & transactions |
| **Kasir 2** | kasir2@umb.ac.id | Kasir123 | POS & transactions |
| **Developer** | aegner@umb.ac.id | Dev@Secure2025! | God mode |

### Test Login

1. **Buka:** http://localhost:3000/login
2. **Email:** `manager@umb.ac.id`
3. **Password:** `KoperasiUMB2025`
4. **Klik:** Login

**Expected:**
- Redirect ke dashboard: http://localhost:3000/koperasi/dashboard
- Muncul sidebar dengan menu

---

## 🔧 Common Issues & Solutions

### Issue 1: MySQL Connection Error

**Error:**
```
Can't reach database server at `localhost:3306`
```

**Solution:**
```bash
# Check MySQL status
sudo /opt/lampp/lampp status  # Linux
# Atau cek XAMPP Control Panel (Windows)

# Restart MySQL
sudo /opt/lampp/lampp restart  # Linux

# Check port yang digunakan
sudo netstat -tulpn | grep mysql  # Linux
netstat -ano | findstr :3306      # Windows
```

### Issue 2: Port 3000 Already in Use

**Error:**
```
Port 3000 is already in use
```

**Solution:**
```bash
# Linux - kill process di port 3000
sudo lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Atau ubah port di .env.local:
PORT=3001
```

### Issue 3: TypeScript Errors

**Solution:**
```bash
# Regenerate Prisma Client
npx prisma generate

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue 4: npm install Gagal

**Error:**
```
ECONNREFUSED or timeout errors
```

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Install ulang
rm -rf node_modules package-lock.json
npm install

# Atau coba pakai registry alternatif
npm install --registry=https://registry.npmmirror.com
```

### Issue 5: Prisma Client Not Found

**Error:**
```
Cannot find module '@prisma/client'
```

**Solution:**
```bash
# Install Prisma Client
npm install @prisma/client

# Generate client
npx prisma generate

# Restart dev server
npm run dev
```

---

## 📂 Project Structure

```
web-koperasi-umb/
├── .env.local              # ⚙️ Environment config (JANGAN COMMIT!)
├── .env.example            # 📝 Template environment
├── package.json            # 📦 Dependencies
├── prisma/
│   ├── schema.prisma       # 🗄️ Database schema
│   └── seed-auth.ts        # 🌱 Seed users
├── app/                    # 📱 Next.js App Router
│   ├── api/                # 🔌 API endpoints
│   ├── koperasi/           # 🏪 Main app pages
│   └── login/              # 🔐 Auth pages
├── components/             # 🧩 React components
├── lib/                    # 🛠️ Utilities
└── public/                 # 📁 Static files
```

---

## 🚀 Development Workflow

### Start Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Database Management

**Open Prisma Studio:**
```bash
npx prisma studio
# Buka: http://localhost:5555
```

**View/Edit data via GUI:**
- phpMyAdmin: http://localhost/phpmyadmin
- Prisma Studio: http://localhost:5555

**Backup Database:**
```bash
# Linux
sudo /opt/lampp/bin/mysqldump -u root koperasi_umb > backup_$(date +%Y%m%d).sql

# Windows (dari xampp/mysql/bin)
mysqldump -u root koperasi_umb > backup.sql
```

**Restore Database:**
```bash
# Linux
sudo /opt/lampp/bin/mysql -u root koperasi_umb < backup.sql

# Windows
mysql -u root koperasi_umb < backup.sql
```

---

## 📊 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open database GUI |
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma db push` | Sync schema to database |

---

## 🔐 Security Notes

⚠️ **IMPORTANT:**
- **JANGAN commit** file `.env.local` ke Git
- **Ganti semua password default** untuk production
- **Set NODE_ENV=production** untuk production deployment

---

## 📞 Support

**Stuck atau ada error?**

1. Check error message di terminal
2. Lihat browser console (F12)
3. Refer ke section "Common Issues" di atas
4. Check database connection di phpMyAdmin

---

## ✅ Quick Checklist

Pastikan semua step sudah dilakukan:

- [ ] Node.js terinstall (v18+)
- [ ] XAMPP MySQL running
- [ ] Database `koperasi_umb` sudah dibuat
- [ ] `npm install` selesai tanpa error
- [ ] `.env.local` configured dengan benar
- [ ] `npx prisma generate` sukses
- [ ] `npx prisma db push` sukses
- [ ] `npx tsx prisma/seed-auth.ts` sukses
- [ ] `npm run dev` running tanpa error
- [ ] Browser bisa akses http://localhost:3000
- [ ] Bisa login dengan user default

---

**🎉 Selamat! Aplikasi seharusnya sudah running di http://localhost:3000**

**Built with ❤️ for Koperasi UMB**
