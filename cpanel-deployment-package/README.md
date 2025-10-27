# 📦 CPANEL DEPLOYMENT PACKAGE - README
## Koperasi UMB Production System

**Version:** 2.0 Complete  
**Date:** October 27, 2025  
**Status:** ✅ READY FOR DEPLOYMENT

---

## 🎯 WHAT IS THIS PACKAGE?

This is a **COMPLETE, PRODUCTION-READY** deployment package for cPanel hosting that includes:

✅ Compiled Next.js application (`.next/` folder)  
✅ Standalone Node.js server (`server.js`)  
✅ MySQL database schema (ALL 23 tables)  
✅ Prisma ORM configuration  
✅ Environment templates  
✅ Step-by-step deployment guide

---

## 🚀 QUICK START (5 STEPS)

### 1️⃣ **Upload Files to cPanel**
- Upload entire `cpanel-deployment-package/` contents to `/public_html`
- Rename `env-production-ready.txt` → `.env`

### 2️⃣ **Create MySQL Database**
- Database name: `mekarmuk_koperasi`
- Username: `mekarmuk_admin`
- Grant ALL privileges

### 3️⃣ **Import Database**
- Use phpMyAdmin
- Import `mysql-complete-schema.sql` ✅ (NOT mysql-setup-script.sql!)
- Verify 23 tables created

### 4️⃣ **Install Dependencies**
```bash
cd /public_html
npm install --production
npx prisma generate
```

### 5️⃣ **Start Application**
- cPanel → Node.js Apps → Start
- Test: https://mekarmukti.id

---

## 📁 FILES EXPLAINED

### **MUST USE (Critical):**
| File | Purpose | Action Required |
|------|---------|-----------------|
| `mysql-complete-schema.sql` | ✅ Full database (23 tables) | Import this in phpMyAdmin |
| `prisma/schema.prisma` | MySQL-compatible schema | Copy to server, run `prisma generate` |
| `server.js` | Standalone Node server | Set as startup file in cPanel |
| `.next/` folder | Compiled Next.js app | Upload entire folder |
| `package.json` | Dependencies list | Run `npm install` |

### **SKIP (Old/Deprecated):**
| File | Status | Why Skip? |
|------|--------|-----------|
| `mysql-setup-script.sql` | ❌ Incomplete | Only creates 2 tables + admin user |
| `env-production-ready.txt` | ⚠️ Template | Rename to `.env` and edit |

---

## ⚙️ ENVIRONMENT VARIABLES

### **Required Variables in `.env`:**

```env
# Database Connection (UPDATE THIS!)
DATABASE_URL="mysql://mekarmuk_admin:YOUR_PASSWORD@localhost:3306/mekarmuk_koperasi"

# JWT Secret (GENERATE NEW ONE!)
JWT_SECRET="your-super-secure-random-64-char-string-here"

# Node Environment
NODE_ENV="production"

# Application URL
NEXT_PUBLIC_API_URL="https://mekarmukti.id"
```

### **Generate JWT Secret:**
```bash
# Option 1: OpenSSL (Linux/Mac)
openssl rand -base64 64

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"

# Option 3: Online
# Visit: https://generate-secret.vercel.app/64
```

---

## 🗄️ DATABASE DETAILS

### **What's Included in `mysql-complete-schema.sql`:**

✅ **23 Tables Created:**
- users (authentication & roles)
- suppliers (3-stage verification system)
- products (inventory management)
- transactions (POS & sales)
- transaction_items (cart items)
- stock_movements (inventory tracking)
- consignment_batches (consignment products)
- consignment_sales (revenue sharing)
- consignment_payments (supplier payments)
- supplier_payments (monthly fees)
- members (customer management)
- loans (pinjaman koperasi)
- savings (simpanan)
- purchases (pembelian supplier)
- categories (product categories)
- activity_logs (user activity tracking)
- broadcasts (announcement system)
- ... and 6 more tables

✅ **Initial Data:**
- 1 Super Admin user (email: admin@koperasi-umb.ac.id, pass: Admin@UMB2025!)
- 5 Product categories

✅ **All Foreign Keys & Indexes** properly configured

---

## 🔐 DEFAULT LOGIN CREDENTIALS

**After importing database, you can login with:**

```
Email: admin@koperasi-umb.ac.id
Password: Admin@UMB2025!
```

⚠️ **CRITICAL:** Change this password immediately after first login!

---

## 🛠️ TROUBLESHOOTING

### **Problem: "Cannot connect to database"**
**Solution:**
1. Verify DATABASE_URL in `.env` file
2. Check MySQL user has ALL privileges
3. Test connection in phpMyAdmin

### **Problem: "Prisma Client not generated"**
**Solution:**
```bash
cd /public_html
npx prisma generate
```

### **Problem: "Module not found"**
**Solution:**
```bash
npm install --production
# If fails, try:
npm install --production --legacy-peer-deps
```

### **Problem: "Port already in use"**
**Solution:**
- cPanel automatically assigns port
- Check Node.js Apps dashboard for assigned port
- Restart app if needed

### **Problem: "500 Internal Server Error"**
**Solution:**
1. Check cPanel error logs
2. Verify `.env` file exists and has correct format
3. Ensure `server.js` is set as startup file
4. Restart Node.js app

---

## 📊 VERIFY DEPLOYMENT SUCCESS

### **Checklist:**
- [ ] Homepage loads: https://mekarmukti.id
- [ ] Login page accessible: https://mekarmukti.id/login
- [ ] Can login with super admin credentials
- [ ] Dashboard shows no errors
- [ ] Database connection working (check transactions page)
- [ ] SSL certificate active (green padlock in browser)

### **Quick Tests:**
```bash
# 1. Test database
npx prisma db pull
# Should show: "Introspected 23 tables"

# 2. Check tables
# In phpMyAdmin, run:
SHOW TABLES;
# Should list 23 tables

# 3. Verify admin user
# In phpMyAdmin, run:
SELECT email, role FROM users WHERE role = 'SUPER_ADMIN';
# Should return: admin@koperasi-umb.ac.id
```

---

## 📈 PERFORMANCE EXPECTATIONS

**After successful deployment:**
- **Initial load:** 2-3 seconds
- **API response:** < 500ms
- **Database queries:** < 100ms
- **Page navigation:** Instant (client-side routing)

**If slower:**
- Check cPanel resource limits
- Enable caching in cPanel
- Upgrade hosting plan if needed

---

## 🔄 UPDATE / RE-DEPLOY

**To update the application:**

1. **Backup current database:**
   ```bash
   mysqldump -u mekarmuk_admin -p mekarmuk_koperasi > backup_$(date +%Y%m%d).sql
   ```

2. **Stop Node.js app** (cPanel dashboard)

3. **Upload new files** (overwrite existing)

4. **Restart Node.js app**

5. **Verify** everything works

---

## 📞 SUPPORT

**If you encounter issues:**

1. **Check logs:**
   - cPanel → Node.js Apps → View Logs
   - cPanel → Errors (last 300 entries)

2. **Common fixes:**
   - Restart Node.js app
   - Clear browser cache
   - Verify `.env` file
   - Re-run `npm install`

3. **Still stuck?**
   - Contact hosting support
   - Check cPanel resource usage
   - Review deployment guide again

---

## ✅ DEPLOYMENT COMPLETE!

**When everything works:**
- ✅ Site accessible at https://mekarmukti.id
- ✅ Admin can login and access dashboard
- ✅ All 23 database tables created
- ✅ Prisma Client generated
- ✅ SSL certificate active
- ✅ Node.js app running

**Next steps:**
1. Change default admin password
2. Setup automated backups
3. Monitor performance & errors
4. Train staff on system usage

---

**Deployment Package Version:** 2.0  
**Last Updated:** October 27, 2025  
**Compatibility:** cPanel with Node.js 18+ support  
**Database:** MySQL 5.7+ or MariaDB 10.3+
