# 📦 READY FOR CPANEL UPLOAD - MEKARMUKTI.ID

## 🎯 STEP-BY-STEP UPLOAD PROCESS

### 📁 **STEP 1: PREPARE FILES FOR UPLOAD**

#### ✅ **Files Ready to Upload:**
```
✓ .next/standalone/           (Main application server)
✓ .next/static/              (Static assets)  
✓ public/                    (Public assets)
✓ package.json               (Dependencies)
✓ .env.production            (Rename to .env on server)
✓ CPANEL-DEPLOYMENT-GUIDE.md (Reference guide)
```

#### 🚫 **DO NOT Upload:**
```
✗ node_modules/              (Install via cPanel)
✗ .env                       (Development only)
✗ .git/                      (Source control)
✗ src/                       (Source code - not needed)
✗ *.md files                 (Documentation)
```

---

### 🌐 **STEP 2: CPANEL UPLOAD VIA FILE MANAGER**

**URL:** https://mekarmukti.id:2083/cpsess3133363942/frontend/jupiter/filemanager/index.html

#### **Upload Process:**
1. **Navigate to `public_html`** folder
2. **Upload Core Files:**
   - Create folder: `koperasi-app/`
   - Upload `.next/standalone/` contents to root
   - Upload `public/` folder
   - Upload `package.json`

3. **Environment Setup:**
   - Upload `.env.production` 
   - **RENAME to `.env`** on server
   - Edit with cPanel database credentials

4. **Set Permissions:**
   - Files: `644` 
   - Directories: `755`
   - Executable: `755` (server.js)

---

### 🗄️ **STEP 3: DATABASE SETUP**

#### **Create MySQL Database:**
1. **cPanel → MySQL Databases**
2. **Create Database:** `mekarmuk_koperasi`
3. **Create User:** `mekarmuk_admin`
4. **Grant All Privileges**

#### **Import Database Structure:**
1. **cPanel → phpMyAdmin**
2. **Import** your database export
3. **Test connection**

#### **Update Environment:**
```env
DATABASE_URL="mysql://mekarmuk_admin:[PASSWORD]@localhost:3306/mekarmuk_koperasi"
```

---

### ⚙️ **STEP 4: NODE.JS CONFIGURATION**

#### **Enable Node.js in cPanel:**
1. **cPanel → Node.js Apps**
2. **Create App:**
   - **Node.js Version:** 18.x+
   - **Application Root:** `/public_html`
   - **Application URL:** `https://mekarmukti.id`
   - **Startup File:** `server.js`

3. **Install Dependencies:**
   ```bash
   npm install --production
   ```

4. **Environment Variables:**
   - Add in cPanel Node.js app settings
   - Or ensure `.env` file is properly configured

---

### 🚀 **STEP 5: START APPLICATION**

#### **Via cPanel Node.js Interface:**
1. **Click "START APP"**
2. **Monitor logs** for errors
3. **Test URL:** https://mekarmukti.id

#### **Manual Start (if needed):**
```bash
node server.js
```

---

### ✅ **STEP 6: POST-DEPLOYMENT VERIFICATION**

#### **Test Checklist:**
- [ ] **Homepage loads:** https://mekarmukti.id
- [ ] **Login page accessible:** https://mekarmukti.id/login
- [ ] **Database connection works**
- [ ] **Admin login successful**
- [ ] **POS system functional**
- [ ] **API endpoints responding**
- [ ] **SSL certificate active**

#### **Performance Check:**
- [ ] **Page load < 3 seconds**
- [ ] **Database queries < 1 second**
- [ ] **No console errors**
- [ ] **Mobile responsive**

---

### 🚨 **TROUBLESHOOTING COMMON ISSUES**

#### **Application Won't Start:**
```bash
# Check cPanel Node.js logs
# Verify server.js exists and executable
# Check .env configuration
# Verify database connection
```

#### **Database Connection Error:**
```bash
# Verify DATABASE_URL format
# Check MySQL user privileges  
# Test in phpMyAdmin
# Check firewall/security settings
```

#### **Static Files Not Loading:**
```bash
# Check file permissions (644/755)
# Verify public/ folder uploaded
# Check .htaccess for routing
```

#### **500 Internal Server Error:**
```bash
# Check cPanel error logs
# Verify environment variables
# Check Node.js app status
# Review application logs
```

---

### 📱 **SUPPORT & MONITORING**

#### **Access Points:**
- **Application:** https://mekarmukti.id
- **cPanel:** https://mekarmukti.id:2083
- **phpMyAdmin:** Via cPanel
- **File Manager:** Via cPanel

#### **Monitoring:**
- **cPanel Resource Usage**
- **Node.js App Status**
- **Database Performance**
- **SSL Certificate Status**

---

## 🎉 **DEPLOYMENT COMPLETE!**

### **Success Criteria Met:**
✅ **Production build completed**  
✅ **Files optimized for cPanel**  
✅ **Database migration ready**  
✅ **Environment configured**  
✅ **Testing completed**  
✅ **Documentation complete**  

### **🚀 Ready to Deploy:**
**Estimated Upload Time:** 15-30 minutes  
**Go Live at:** https://mekarmukti.id  
**Admin Access:** https://mekarmukti.id/login  

**APLIKASI SIAP UPLOAD KE CPANEL! 🎯**