# 🚀 COMPLETE CPANEL DEPLOYMENT GUIDE
## Koperasi UMB - Production Ready Package

**Updated:** October 27, 2025  
**Version:** 2.0 - Complete Package

### 📦 **DEPLOYMENT PACKAGE CONTENTS**
Location: `cpanel-deployment-package/`

#### ✅ **All Files Included:**
```
📁 cpanel-deployment-package/
├── 📄 server.js                       (Standalone Node.js server)
├── 📁 .next/                          (Next.js production build)
│   ├── server/                        (API routes & pages)
│   └── static/                        (Static assets)
├── 📁 public/                         (Public assets & uploads)
├── � prisma/                         (✨ NEW - Database schema)
│   └── schema.prisma                  (MySQL-compatible schema)
├── �📄 package.json                    (Dependencies list)
├── 📄 .env.production                 (Environment template)
├── 📄 mysql-complete-schema.sql       (✨ NEW - Full database schema)
├── 📄 mysql-setup-script.sql          (Old - basic setup only)
├── 📄 env-production-ready.txt        (Environment reference)
└── 📄 DEPLOYMENT-STEPS.md             (This guide)
```

**⚠️ IMPORTANT:** Use `mysql-complete-schema.sql` (NOT mysql-setup-script.sql)

---

## 🌐 **STEP-BY-STEP CPANEL DEPLOYMENT**

### **1️⃣ ACCESS CPANEL**
- **URL:** https://mekarmukti.id:2083/cpsess3133363942/frontend/jupiter/filemanager/index.html
- **Login:** Use your cPanel credentials

### **2️⃣ UPLOAD FILES TO CPANEL**

#### **Upload via File Manager:**
1. **Navigate to `public_html`**
2. **Upload ALL files from `cpanel-deployment-package/`:**
   - `server.js` → Root of public_html
   - `.next/` folder → Root of public_html  
   - `public/` folder → Root of public_html
   - `package.json` → Root of public_html

3. **Rename Environment File:**
   - `env-production-ready.txt` → `.env`

#### **Set File Permissions:**
- **Files:** `644`
- **Directories:** `755` 
- **server.js:** `755` (executable)

### **3️⃣ DATABASE SETUP** (MOST IMPORTANT!)

#### **Create MySQL Database:**
1. **cPanel → MySQL Databases**
2. **Create Database:** `mekarmuk_koperasi`
3. **Create User:** `mekarmuk_admin`
4. **Set Strong Password:** `[SAVE_THIS_PASSWORD_SECURELY]`
5. **Grant ALL privileges** to user

#### **Import COMPLETE Database Schema:**
1. **cPanel → phpMyAdmin**
2. **Select database:** `mekarmuk_koperasi`
3. **Import → Choose file:** `mysql-complete-schema.sql` ✅ (NOT mysql-setup-script.sql)
4. **Click "Go"** and wait for completion (~30 seconds)
5. **Verify:** Should see message "Import successfully finished"

#### **Verify Database Import:**
```sql
-- Run in phpMyAdmin SQL tab
SHOW TABLES;
-- Should show 23 tables including: users, products, transactions, suppliers, etc.

SELECT * FROM users WHERE role = 'SUPER_ADMIN';
-- Should return 1 row: admin@koperasi-umb.ac.id

SELECT COUNT(*) FROM categories;
-- Should return 5 categories
```

#### **Update Environment Variables:**
1. **Edit `.env` file in File Manager**
2. **Update DATABASE_URL:**
   ```env
   DATABASE_URL="mysql://mekarmuk_admin:[YOUR_ACTUAL_PASSWORD]@localhost:3306/mekarmuk_koperasi"
   ```
   
   **Example:**
   ```env
   DATABASE_URL="mysql://mekarmuk_admin:MySecurePass123!@localhost:3306/mekarmuk_koperasi"
   ```

### **4️⃣ NODE.JS & DEPENDENCIES SETUP**

#### **Enable Node.js:**
1. **cPanel → Node.js Apps** (or "Setup Node.js App")
2. **Create App:**
   - **Node.js Version:** `18.19.0` (or latest LTS available)
   - **Application Root:** `/public_html` (or `/public_html/koperasi`)
   - **Application URL:** `https://mekarmukti.id`
   - **Application Startup File:** `server.js`
   - **Environment:** Production

#### **Install Dependencies:**
1. **In Node.js app terminal** (click "Enter to virtual environment")
   ```bash
   # Navigate to app directory
   cd /home/mekarmuk/public_html
   
   # Install production dependencies (this will take 3-5 minutes)
   npm install --production
   
   # Generate Prisma Client for MySQL
   npx prisma generate
   ```

2. **Wait for installation** - Should install ~50+ packages
3. **Verify Prisma:**
   ```bash
   # Test Prisma connection
   npx prisma db pull
   # Should show: "Introspected 23 tables"
   ```

#### **Important Notes:**
- `npm install` will download ~150MB of dependencies
- Prisma generate creates database client based on schema.prisma
- If memory error occurs, use: `npm install --production --no-optional`

### **5️⃣ START APPLICATION**

#### **Start via cPanel:**
1. **Click "START APP"** in Node.js interface
2. **Monitor logs** for any errors
3. **Application should start on port assigned by cPanel**

### **6️⃣ CONFIGURE SSL & DOMAIN**

#### **Enable SSL:**
1. **cPanel → SSL/TLS**
2. **Let's Encrypt → Enable** for mekarmukti.id
3. **Force HTTPS redirect**

---

## ✅ **POST-DEPLOYMENT VERIFICATION**

### **Test Application Access:**
- [ ] **Homepage:** https://mekarmukti.id
- [ ] **Login Page:** https://mekarmukti.id/login
- [ ] **Admin Dashboard accessible**

### **Test Database Connection:**
- [ ] **Login with admin credentials:**
  - Email: `admin@mekarmukti.id`
  - Password: `admin123`
- [ ] **Change admin password immediately**

### **Test Core Features:**
- [ ] **POS System works**
- [ ] **Inventory management**
- [ ] **User authentication**
- [ ] **API endpoints respond**

### **Performance Check:**
- [ ] **Page load time < 3 seconds**
- [ ] **No console errors**
- [ ] **Mobile responsive**
- [ ] **SSL certificate active**

---

## 🚨 **TROUBLESHOOTING**

### **App Won't Start:**
```bash
# Check cPanel Node.js logs
# Verify server.js exists and is executable
# Check .env configuration
# Verify all files uploaded correctly
```

### **Database Connection Error:**
```bash
# Verify DATABASE_URL in .env
# Check MySQL user privileges in cPanel
# Test connection in phpMyAdmin
# Confirm database name matches
```

### **500 Internal Server Error:**
```bash
# Check cPanel error logs
# Verify Node.js app is running
# Check .env file syntax
# Verify file permissions
```

### **Static Files Not Loading:**
```bash
# Check .next/static folder uploaded
# Verify public/ folder uploaded
# Check file permissions (644/755)
```

---

## 📞 **FINAL STEPS AFTER SUCCESSFUL DEPLOYMENT**

### **Security Tasks:**
1. **Change admin password** from default `admin123`
2. **Setup regular database backups**
3. **Configure cPanel security settings**
4. **Monitor application logs**

### **Performance Optimization:**
1. **Enable cPanel caching** if available
2. **Monitor resource usage**
3. **Setup automated backups**

### **Success Confirmation:**
- ✅ **Application accessible at https://mekarmukti.id**
- ✅ **Admin can login and access dashboard**
- ✅ **All major features working**
- ✅ **SSL certificate active**
- ✅ **Database operations successful**

---

## 🎉 **DEPLOYMENT COMPLETE!**

**🌟 Your Koperasi UMB application is now LIVE at:**
**https://mekarmukti.id**

**Admin Login:**
- **Email:** admin@mekarmukti.id
- **Password:** admin123 (CHANGE IMMEDIATELY)

**Total Deployment Time:** ~30-45 minutes
**Status:** READY FOR PRODUCTION USE! 🚀