# ✅ PRE-UPLOAD CHECKLIST
## Before Uploading to cPanel

**Print this checklist and mark each item as you complete it!**

---

## 📋 PACKAGE VERIFICATION

### **Check Files Exist:**
- [ ] `server.js` file present
- [ ] `.next/` folder present (with server/ and static/ subfolders)
- [ ] `public/` folder present
- [ ] `prisma/` folder present with `schema.prisma`
- [ ] `package.json` file present
- [ ] `mysql-complete-schema.sql` file present ✅ (MOST IMPORTANT!)
- [ ] `env-production-ready.txt` template present
- [ ] `README.md` guide present
- [ ] `DEPLOYMENT-STEPS.md` guide present

### **Package Size Check:**
```
Expected size: ~40-50 MB (without node_modules)
- .next/ folder: ~35 MB
- public/: ~5 MB
- Others: ~1-2 MB
```

Run this to check:
```powershell
# In PowerShell
cd cpanel-deployment-package
(Get-ChildItem -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
# Should show: 40-50 MB
```

---

## 🔐 SECURITY PREPARATION

### **Generate Production JWT Secret:**
- [ ] Run: `openssl rand -base64 64` (or use Node.js command)
- [ ] Copy generated secret
- [ ] Save securely (password manager or notepad)
- [ ] Will update `.env` file on server with this secret

### **Plan Database Credentials:**
- [ ] Database name: `mekarmuk_koperasi` (write this down)
- [ ] Database user: `mekarmuk_admin` (write this down)
- [ ] Database password: [Choose strong password now, write it down]
- [ ] Keep credentials in safe place

**Strong password generator:**
```
Example: K0p3r@s1_UMB_2025_S3cure!Pass#
Minimum: 16 characters, mix of upper/lower/numbers/symbols
```

---

## 📦 UPLOAD PREPARATION

### **Compress Package (Optional but Recommended):**
- [ ] Compress `cpanel-deployment-package/` to ZIP
- [ ] Name it: `koperasi-umb-production-v2.zip`
- [ ] Verify ZIP size: ~40 MB
- [ ] Test extract ZIP locally to verify integrity

**Windows compress:**
```powershell
# Right-click cpanel-deployment-package folder
# Send to → Compressed (zipped) folder
```

### **cPanel Access Ready:**
- [ ] cPanel URL: https://mekarmukti.id:2083
- [ ] Username: [Your cPanel username]
- [ ] Password: [Your cPanel password]
- [ ] Test login to cPanel now (before upload!)

---

## 🗄️ DATABASE PREP

### **Verify SQL File:**
```powershell
# Check file exists and size
ls cpanel-deployment-package\mysql-complete-schema.sql
# Should show: ~50-70 KB file size

# Check content (first few lines)
Get-Content cpanel-deployment-package\mysql-complete-schema.sql -First 20
# Should see: "MYSQL DATABASE SCHEMA" and "23 tables"
```

- [ ] SQL file is `mysql-complete-schema.sql` (NOT mysql-setup-script.sql)
- [ ] File size: 50-70 KB
- [ ] Opens in text editor without errors

---

## ⚙️ ENVIRONMENT VARIABLES

### **Create Production .env File:**

1. **Copy template:**
   ```powershell
   Copy-Item cpanel-deployment-package\env-production-ready.txt cpanel-deployment-package\.env-PRODUCTION-READY
   ```

2. **Edit `.env-PRODUCTION-READY` with YOUR values:**
   ```env
   DATABASE_URL="mysql://mekarmuk_admin:[YOUR_DB_PASSWORD]@localhost:3306/mekarmuk_koperasi"
   JWT_SECRET="[YOUR_GENERATED_JWT_SECRET_64_CHARS]"
   NODE_ENV="production"
   NEXT_PUBLIC_API_URL="https://mekarmukti.id"
   ```

3. **Verify format:**
   - [ ] No spaces around `=` sign
   - [ ] Database password inside quotes
   - [ ] JWT_SECRET is 64+ characters
   - [ ] No trailing spaces or newlines

4. **Upload plan:**
   - [ ] Will rename `.env-PRODUCTION-READY` to `.env` on server

---

## 📝 DEPLOYMENT NOTES

### **Write Down Important Info:**

```
=== DEPLOYMENT INFO ===
Date: October 27, 2025
Target URL: https://mekarmukti.id
cPanel Username: _________________
cPanel Password: [saved in password manager]

Database Name: mekarmuk_koperasi
Database User: mekarmuk_admin  
Database Password: _________________

JWT Secret: [saved in password manager]

Node.js Version: 18.19.0 (or latest LTS)
Application Root: /public_html
Startup File: server.js

Default Admin:
Email: admin@koperasi-umb.ac.id
Password: Admin@UMB2025!
[CHANGE IMMEDIATELY AFTER LOGIN!]
```

---

## 🚀 UPLOAD ORDER

### **Follow this sequence:**

1. **Phase 1: Upload Files** (15 min)
   - [ ] Login to cPanel File Manager
   - [ ] Navigate to `/public_html`
   - [ ] Upload `koperasi-umb-production-v2.zip`
   - [ ] Extract ZIP on server
   - [ ] Verify all files present

2. **Phase 2: Setup Database** (10 min)
   - [ ] cPanel → MySQL Databases
   - [ ] Create database `mekarmuk_koperasi`
   - [ ] Create user `mekarmuk_admin`
   - [ ] Set password (from notes above)
   - [ ] Grant ALL privileges
   - [ ] Go to phpMyAdmin
   - [ ] Select database
   - [ ] Import `mysql-complete-schema.sql`
   - [ ] Verify 23 tables created

3. **Phase 3: Configure Environment** (5 min)
   - [ ] Edit `.env-PRODUCTION-READY` file
   - [ ] Update DATABASE_URL with actual password
   - [ ] Update JWT_SECRET with generated secret
   - [ ] Rename to `.env`
   - [ ] Set file permissions: 600

4. **Phase 4: Install Dependencies** (10 min)
   - [ ] cPanel → Node.js Apps
   - [ ] Create app (Node 18.19.0, startup: server.js)
   - [ ] Enter terminal
   - [ ] Run: `npm install --production`
   - [ ] Wait for completion (~200 packages)
   - [ ] Run: `npx prisma generate`
   - [ ] Verify success

5. **Phase 5: Start & Test** (5 min)
   - [ ] Click "START APP" in cPanel
   - [ ] Wait for app to start
   - [ ] Visit https://mekarmukti.id
   - [ ] Verify homepage loads
   - [ ] Go to /login
   - [ ] Login with admin credentials
   - [ ] Change admin password!
   - [ ] Test POS, inventory, analytics

**Total estimated time: 45 minutes**

---

## ✅ SUCCESS CRITERIA

**Deployment is successful when:**
- ✅ Homepage loads without errors
- ✅ Admin can login
- ✅ Dashboard displays correctly
- ✅ Can create test transaction
- ✅ Database queries work
- ✅ SSL certificate active (green padlock)
- ✅ No console errors in browser
- ✅ Mobile responsive works

---

## 🆘 EMERGENCY CONTACTS

**Before deployment, have these ready:**

- [ ] **Hosting Support:** [Provider phone/email]
- [ ] **Developer Contact:** [Your contact]
- [ ] **Database Backup:** [Backup plan if fails]
- [ ] **Rollback Plan:** [How to revert if issues]

---

## 📸 DOCUMENTATION

**Take screenshots of:**
- [ ] cPanel File Manager showing uploaded files
- [ ] phpMyAdmin showing 23 tables
- [ ] Node.js Apps dashboard showing "Running" status
- [ ] Homepage loaded successfully
- [ ] Admin dashboard after login

**Save for reference and proof of deployment!**

---

## 🎯 FINAL CHECK

Before clicking "START APP":

- [ ] All files uploaded ✅
- [ ] Database created & imported ✅
- [ ] .env file configured ✅
- [ ] Dependencies installed ✅
- [ ] Prisma client generated ✅
- [ ] SSL certificate active ✅
- [ ] Backup plan ready ✅

**Ready to deploy? GO! 🚀**

---

**Checklist Version:** 1.0  
**Last Updated:** October 27, 2025  
**Print and use during deployment!**
