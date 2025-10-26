# 🚀 TERMINAL DEPLOYMENT GUIDE - KOPERASI UMB
## SAYA SUDAH SIAPKAN SEMUA - TINGGAL COPY PASTE!

### 📁 FILES READY FOR UPLOAD:
- `complete-database-setup.sql` - Complete database schema
- `.env.production.ready` - Production environment (rename to .env)
- `deploy.sh` - Automated deployment script

---

## 🎯 DEPLOYMENT STEPS (COPY-PASTE READY):

### STEP 1: UPLOAD FILES TO CPANEL
Upload these files to public_html:
- All files from cpanel-deployment-package/
- complete-database-setup.sql
- .env.production.ready
- deploy.sh

### STEP 2: SETUP DATABASE (COPY-PASTE IN PHPMYADMIN)
```sql
-- Copy entire content of complete-database-setup.sql and paste in phpMyAdmin
```

### STEP 3: CONFIGURE ENVIRONMENT (CPANEL FILE MANAGER)
```bash
# Rename file in cPanel File Manager:
.env.production.ready → .env
```

### STEP 4: RUN AUTOMATED DEPLOYMENT (CPANEL TERMINAL)
```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

---

## 🆘 IF TERMINAL NOT AVAILABLE - MANUAL STEPS:

### ALTERNATIVE: NODE.JS APP SETUP (CPANEL INTERFACE)
1. Go to cPanel → Node.js Apps
2. Create App:
   - Version: 18.x or latest
   - Root: /public_html
   - URL: mekarmukti.id
   - Startup: server.js
3. Install dependencies: `npm install --production`
4. Start app

---

## ✅ VERIFICATION:

### Check if running:
```bash
# In cPanel Terminal
ps aux | grep node
netstat -tulpn | grep :3000
```

### Test application:
- Visit: https://mekarmukti.id
- Login: admin@mekarmukti.id / admin123

### Check logs:
```bash
tail -f /home/mekh7277/public_html/app.log
```

---

## 🔧 TROUBLESHOOTING:

### If app won't start:
```bash
# Check dependencies
npm list --depth=0

# Check environment
cat .env

# Manual start with logs
node server.js
```

### If database issues:
- Verify DATABASE_URL in .env
- Check MySQL user privileges in cPanel
- Test connection in phpMyAdmin

---

## 🎉 SUCCESS CRITERIA:
- ✅ https://mekarmukti.id loads
- ✅ Login page accessible
- ✅ Admin login works
- ✅ POS system functional
- ✅ Inventory system working

---

**READY FOR DEPLOYMENT! 🚀**