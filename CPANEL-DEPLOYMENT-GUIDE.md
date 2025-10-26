# 🚀 CPANEL DEPLOYMENT GUIDE - MEKARMUKTI.ID
## Web Koperasi UMB Production Deployment

### 📋 PRE-DEPLOYMENT CHECKLIST

#### ✅ Required Files Ready:
- [x] Production build completed (`npm run build`)
- [x] `.env.production` configured
- [x] `next.config.ts` optimized for cPanel
- [x] Database migration script ready
- [x] All TypeScript errors resolved

---

## 🗃️ FILES TO UPLOAD TO CPANEL

### 📁 Main Application Files:
```
📦 Upload these folders/files to public_html:
├── .next/                 (Production build output)
├── public/               (Static assets)
├── node_modules/         (Dependencies - may need separate install)
├── package.json          (Dependencies list)
├── package-lock.json     (Lock file)
├── next.config.ts        (Next.js configuration)
├── .env.production       (Production environment - RENAME to .env)
├── tsconfig.json         (TypeScript config)
└── app/                  (Application source - if needed)
```

### ⚠️ IMPORTANT: DO NOT UPLOAD:
- `.env` (development environment)
- `.env.local`
- `node_modules/` (if installing via cPanel)
- `.git/`
- `README.md`
- Development scripts

---

## 🛠️ CPANEL SETUP STEPS

### 1️⃣ **Database Setup**
1. **Create MySQL Database** in cPanel
   - Database Name: `mekarmuk_koperasi_prod`
   - Username: `mekarmuk_koperasi_user`
   - Password: `[SECURE_PASSWORD]`

2. **Import Database Structure**
   - Use phpMyAdmin in cPanel
   - Import from your existing database export
   - Or run migration scripts

3. **Update Database URL**
   ```env
   DATABASE_URL="mysql://mekarmuk_koperasi_user:[PASSWORD]@localhost:3306/mekarmuk_koperasi_prod"
   ```

### 2️⃣ **Environment Configuration**
1. **Rename `.env.production` to `.env`**
2. **Update these values in .env:**
   ```env
   # Database (from step 1)
   DATABASE_URL="mysql://[USERNAME]:[PASSWORD]@localhost:3306/[DATABASE_NAME]"
   
   # JWT Secret (generate new)
   JWT_SECRET="[64-character-random-string]"
   
   # Domain
   NEXTAUTH_URL="https://mekarmukti.id"
   NEXTAUTH_SECRET="[another-secure-secret]"
   
   # Production settings
   NODE_ENV="production"
   ENABLE_DEVELOPER_MODE="false"
   ```

### 3️⃣ **Node.js Setup in cPanel**
1. **Enable Node.js** in cPanel
   - Version: 18.x or higher
   - Application Root: `/public_html`
   - Application URL: `https://mekarmukti.id`

2. **Install Dependencies**
   ```bash
   npm install --production
   ```

3. **Start Application**
   ```bash
   npm run start:production
   ```

### 4️⃣ **SSL & Domain Configuration**
1. **Enable SSL** in cPanel (Let's Encrypt)
2. **Setup Domain Redirects** if needed
3. **Configure .htaccess** for Next.js routing

---

## 🔧 POST-DEPLOYMENT TASKS

### ✅ Verification Checklist:
1. **Test Database Connection**
   - Login page accessible
   - Database queries working

2. **Test Core Features**
   - User authentication
   - POS transactions
   - Inventory management
   - Supplier payments

3. **Test Production Features**
   - Payment processing
   - File uploads
   - API endpoints

4. **Performance Check**
   - Page load times
   - Database query performance
   - Memory usage

### 🚨 Troubleshooting Common Issues:

**Issue: 500 Internal Server Error**
- Check `.env` file configuration
- Verify database credentials
- Check cPanel error logs

**Issue: Database Connection Failed**
- Verify DATABASE_URL format
- Check database user privileges
- Test connection in phpMyAdmin

**Issue: Static Files Not Loading**
- Check file permissions (644 for files, 755 for directories)
- Verify public/ folder uploaded correctly

**Issue: API Routes Not Working**
- Check Node.js is enabled in cPanel
- Verify Next.js standalone build
- Check application logs

---

## 📞 SUPPORT CONTACTS

**Technical Issues:**
- cPanel Support: Contact mekarmukti.id hosting
- Application Issues: Check error logs in cPanel

**Backup Strategy:**
- Database: Daily automatic backups via cPanel
- Files: Weekly full site backups
- Code: Git repository maintained

---

## 🎯 SUCCESS CRITERIA

### Application is successfully deployed when:
- ✅ Login page loads at https://mekarmukti.id
- ✅ Admin can log in with credentials
- ✅ POS system accepts transactions
- ✅ Database operations work correctly
- ✅ All major features functional
- ✅ SSL certificate active
- ✅ Performance meets requirements

---

**🚀 READY FOR DEPLOYMENT!**
**Estimated Deployment Time: 30-60 minutes**
**Go live at: https://mekarmukti.id**