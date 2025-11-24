# 🚀 Cara Deploy & Make Repository Public

## ✅ Persiapan Sudah Selesai!

Changes yang sudah dilakukan:
- ✅ `.gitignore` updated untuk exclude sensitive files
- ✅ Backup SQL files removed dari git tracking
- ✅ Deployment alternatives guide created
- ✅ Railway configuration added
- ✅ README updated dengan deployment info
- ✅ Changes committed

---

## 📤 Step 1: Push ke GitHub

```powershell
# Push changes ke remote repository
git push origin feature/landing-pages

# Atau merge ke main branch dulu
git checkout main
git merge feature/landing-pages
git push origin main
```

---

## 🌐 Step 2: Make Repository Public di GitHub

### Via GitHub Website:

1. **Buka Repository** di browser:
   - Pakai HP/laptop lain tanpa proxy
   - URL: https://github.com/BroAegg/web-koperasi-umb

2. **Go to Settings**:
   - Klik tab **Settings** (di kanan atas)

3. **Scroll ke Danger Zone**:
   - Scroll ke bawah sampai ketemu **"Danger Zone"**

4. **Change Visibility**:
   - Klik **"Change repository visibility"**
   - Pilih **"Make public"**
   - Ketik nama repository untuk konfirmasi: `BroAegg/web-koperasi-umb`
   - Klik **"I understand, change repository visibility"**

### Via GitHub CLI (Alternative):

```powershell
# Install GitHub CLI (jika belum)
winget install --id GitHub.cli

# Login
gh auth login

# Make repository public
gh repo edit BroAegg/web-koperasi-umb --visibility public
```

---

## 🚀 Step 3: Deploy (Pilih Salah Satu)

### Option A: Railway (Recommended - Termudah)

**Why Railway?**
- ✅ Auto-detect Next.js
- ✅ Free $5 credit/month
- ✅ Built-in PostgreSQL/MySQL
- ✅ Automatic HTTPS
- ✅ CLI support

**Steps:**

1. **Login Railway** (via HP/laptop lain):
   ```powershell
   # Railway CLI sudah terinstall
   railway login
   ```
   Akan buka browser untuk login. Setelah login, copy token.

2. **Link Project**:
   ```powershell
   railway init
   ```

3. **Add MySQL Database**:
   - Buka Railway Dashboard
   - Klik "+ New" → "Database" → "MySQL"

4. **Set Environment Variables**:
   ```powershell
   # Atau set via Railway Dashboard
   railway variables set NEXTAUTH_SECRET="$(node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\")"
   railway variables set NEXTAUTH_URL="https://your-app.railway.app"
   ```

5. **Deploy**:
   ```powershell
   railway up
   ```

6. **Run Migrations**:
   ```powershell
   railway run npx prisma migrate deploy
   railway run npx prisma db seed
   ```

---

### Option B: Render

**Steps:**

1. **Sign Up** di https://render.com

2. **Create Web Service**:
   - Klik "New +" → "Web Service"
   - Connect GitHub repository: `BroAegg/web-koperasi-umb`
   - Region: Singapore
   - Branch: `main`

3. **Configure Service**:
   - Name: `koperasi-umb`
   - Runtime: `Node`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`
   - Instance Type: Free

4. **Add MySQL Database**:
   - Di Render Dashboard, klik "New +" → "MySQL"
   - Link ke Web Service

5. **Set Environment Variables**:
   ```
   DATABASE_URL=<from_render_mysql>
   NEXTAUTH_URL=https://koperasi-umb.onrender.com
   NEXTAUTH_SECRET=<generate_baru>
   NODE_ENV=production
   ```

6. **Deploy**: Click "Create Web Service"

---

### Option C: Vercel (Via Token)

Karena proxy issue, pakai token method:

1. **Generate Token**:
   - Buka di HP: https://vercel.com/account/tokens
   - Create token baru
   - Copy token

2. **Deploy via CLI**:
   ```powershell
   # Set token
   $env:VERCEL_TOKEN = "your_token_here"
   
   # Deploy
   vercel --token $env:VERCEL_TOKEN --prod
   ```

3. **Set Environment Variables** (via Vercel CLI):
   ```powershell
   vercel env add DATABASE_URL production
   vercel env add NEXTAUTH_SECRET production
   vercel env add NEXTAUTH_URL production
   ```

**Note**: Vercel perlu external database (PlanetScale, Railway, atau Supabase)

---

## 🎯 Recommended: Railway

Railway paling mudah dan support full-stack:

```powershell
# 1. Login (buka di HP untuk auth)
railway login

# 2. Initialize project
railway init

# 3. Deploy
railway up

# 4. Open in browser
railway open
```

Railway akan:
- ✅ Auto-detect Next.js
- ✅ Install dependencies
- ✅ Build project
- ✅ Deploy dengan HTTPS
- ✅ Generate URL otomatis

---

## 📝 Post-Deployment Checklist

After deployment:

- [ ] Set environment variables
- [ ] Run database migrations
- [ ] Seed initial data
- [ ] Test login functionality
- [ ] Verify all features working
- [ ] Setup custom domain (optional)
- [ ] Configure backups

---

## 🔧 Generate Secure Secrets

```powershell
# Generate NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or using OpenSSL (if installed)
openssl rand -base64 32
```

---

## 📚 Documentation

Lihat guides lengkap:
- **[DEPLOY_ALTERNATIVE.md](./DEPLOY_ALTERNATIVE.md)** - Platform comparison
- **[PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)** - VPS deployment
- **[SECURITY_HARDENING_GUIDE.md](./SECURITY_HARDENING_GUIDE.md)** - Security checklist

---

## ❓ Troubleshooting

### Proxy Issues?
- Use HP/laptop lain untuk web dashboard
- Use CLI dengan token authentication
- Deploy via Railway CLI (paling mudah)

### Database Connection Issues?
```powershell
# Test connection
railway run npx prisma db push

# Check logs
railway logs
```

### Build Failures?
```powershell
# Test build locally first
npm run build

# Check environment variables
railway variables
```

---

## 🎉 Done!

Repository ready untuk:
- ✅ Public viewing
- ✅ Easy deployment
- ✅ No sensitive data exposed

**Next Steps**: Push ke GitHub → Make public → Deploy!
