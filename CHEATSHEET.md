# 🚀 Cheat Sheet - Web Koperasi UMB

## 📋 Daily Commands

### Start Development
```bash
npm run dev                  # Start dev server (http://localhost:3000)
```

### Database Management
```bash
npx prisma studio           # Open database GUI (http://localhost:5555)
npx prisma generate         # Regenerate Prisma Client (after schema changes)
npx prisma db push          # Sync schema to database
npx tsx prisma/seed-auth.ts # Seed default users
```

### XAMPP Control (Linux)
```bash
sudo /opt/lampp/lampp start        # Start all services
sudo /opt/lampp/lampp startmysql   # Start MySQL only
sudo /opt/lampp/lampp stop         # Stop all services
sudo /opt/lampp/lampp status       # Check status
```

---

## 🔧 Troubleshooting Commands

### Check Node.js & npm
```bash
node --version              # Should be v18+ or v20+
npm --version               # Should be 9+ or 10+
```

### Check MySQL Status
```bash
# Linux
sudo /opt/lampp/lampp status
sudo netstat -tulpn | grep mysql
ps aux | grep mysql

# Windows
netstat -ano | findstr :3306
tasklist | findstr mysql
```

### Fix Port 3000 in Use
```bash
# Linux
sudo lsof -ti:3000 | xargs kill -9
# Or change port in .env.local: PORT=3001

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Clear & Reinstall Dependencies
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Clear Next.js Cache
```bash
rm -rf .next
npm run dev
```

### Reset Database (⚠️ WARNING: Deletes all data!)
```bash
# Drop and recreate database in phpMyAdmin, then:
npx prisma db push
npx tsx prisma/seed-auth.ts
```

---

## 🗄️ Database Commands

### Backup Database
```bash
# Linux
sudo /opt/lampp/bin/mysqldump -u root koperasi_umb > backup_$(date +%Y%m%d).sql

# Windows (dari xampp/mysql/bin folder)
mysqldump -u root koperasi_umb > backup.sql
```

### Restore Database
```bash
# Linux
sudo /opt/lampp/bin/mysql -u root koperasi_umb < backup.sql

# Windows
mysql -u root koperasi_umb < backup.sql
```

### Access MySQL CLI
```bash
# Linux
sudo /opt/lampp/bin/mysql -u root -p

# Windows (dari xampp/mysql/bin)
mysql -u root -p

# Then:
USE koperasi_umb;
SHOW TABLES;
SELECT * FROM users;
```

---

## 🔐 Default Login Credentials (UPDATED - Simple!)

| Username | Password | Role | Access |
|----------|----------|------|--------|
| **superadmin** | password | SUPER_ADMIN | Full system control |
| **admin** | password | ADMIN | Management & oversight |
| **kasir1** | password | KASIR | POS & store operations |
| **kasir2** | password | KASIR | POS & store operations |
| **developer** | password | DEVELOPER | God mode + dev tools |

**Login URL:** http://localhost:3000/login  
**Developer Login:** http://localhost:3000/dev/login

**Role Hierarchy:**
1. SUPER_ADMIN - Full access (except POS checkout)
2. ADMIN - Products, inventory, reports, settings
3. KASIR - POS operations only
4. DEVELOPER - All features + technical access

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| **App** | http://localhost:3000 |
| **Login** | http://localhost:3000/login |
| **Dashboard** | http://localhost:3000/koperasi/dashboard |
| **Prisma Studio** | http://localhost:5555 |
| **phpMyAdmin** | http://localhost/phpmyadmin |

---

## 📦 NPM Scripts

```bash
npm run dev              # Development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
```

---

## ⚡ Quick Fixes

### "Can't reach database server"
1. Check MySQL running: `sudo /opt/lampp/lampp status`
2. Check .env.local DATABASE_URL
3. Test: Open phpMyAdmin

### "Module not found" errors
```bash
npm install
npx prisma generate
```

### TypeScript errors
```bash
npx prisma generate
rm -rf .next
npm run dev
```

### Login tidak bisa
1. Check database ada data users: phpMyAdmin > users table
2. Re-seed: `npx tsx prisma/seed-auth.ts`
3. Clear browser cookies
4. Check browser console (F12) for errors

### Port 3000 sudah dipakai
Edit `.env.local`:
```
PORT=3001
```
Lalu akses: http://localhost:3001

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `.env.local` | Environment config (JANGAN COMMIT!) |
| `prisma/schema.prisma` | Database schema |
| `package.json` | Dependencies & scripts |
| `next.config.ts` | Next.js configuration |

---

## 🔍 Debugging

### View Server Logs
- Check terminal tempat `npm run dev` berjalan
- Errors akan muncul di sini

### View Browser Console
- Press F12
- Tab "Console" - lihat JavaScript errors
- Tab "Network" - lihat API requests

### View Database Data
- Prisma Studio: `npx prisma studio`
- phpMyAdmin: http://localhost/phpmyadmin

---

## 🚨 Emergency Recovery

### Complete Reset (⚠️ Deletes everything!)
```bash
# 1. Stop server (Ctrl+C)
# 2. Drop database di phpMyAdmin
# 3. Recreate database 'koperasi_umb'
# 4. Clear everything
rm -rf node_modules package-lock.json .next

# 5. Fresh install
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed-auth.ts

# 6. Start again
npm run dev
```

---

## 💡 Tips

- **Auto-reload:** Save file = page auto refresh
- **Prisma Studio:** GUI untuk edit data tanpa SQL
- **Browser DevTools:** F12 untuk debug
- **Terminal errors:** Baca dari bawah ke atas
- **Git:** Jangan commit `.env.local` dan `node_modules/`

---

**Need help?** Check SETUP_GUIDE_LOCAL.md untuk troubleshooting lengkap!


```bash
node -r dotenv/config scripts/clear-and-seed.js dotenv_config_path=.env.local
```