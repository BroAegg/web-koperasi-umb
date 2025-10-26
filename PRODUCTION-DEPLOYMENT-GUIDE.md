# 🚀 PRODUCTION DEPLOYMENT GUIDE
## Koperasi Universitas Muhammadiyah Bandung

**Last Updated:** 25 Oktober 2025  
**Target Launch:** 27 Oktober 2025  
**System:** Web-based Digitalization System

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ **Before You Start**
- [ ] Read this entire document
- [ ] Prepare production server (VPS/Cloud)
- [ ] Prepare production domain (e.g., koperasi-umb.ac.id)
- [ ] Prepare SSL certificate (Let's Encrypt or purchased)
- [ ] Backup all development data
- [ ] Test all features in development mode

---

## 🔧 STEP 1: SERVER SETUP

### **Option A: Using Vercel (Recommended - Easiest)**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel --prod

# 4. Set environment variables in Vercel Dashboard
# Go to: Project Settings > Environment Variables
# Add all variables from .env.production
```

**Vercel Pros:**
- ✅ Auto SSL certificate
- ✅ CDN built-in
- ✅ Zero server maintenance
- ✅ Easy rollback

**Vercel Cons:**
- ❌ Need external PostgreSQL (use Railway/Supabase)
- ❌ Free tier has limits

---

### **Option B: Using Railway (Good Balance)**

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Create new project
railway init

# 4. Add PostgreSQL service
railway add --database postgresql

# 5. Deploy
railway up

# 6. Set custom domain
railway domain
```

**Railway Pros:**
- ✅ PostgreSQL included
- ✅ Easy setup
- ✅ Auto SSL
- ✅ Good free tier

---

### **Option C: Custom VPS (Full Control)**

**Requirements:**
- Ubuntu 22.04 LTS or newer
- 2GB RAM minimum (4GB recommended)
- 20GB storage
- Node.js 20+
- PostgreSQL 15+
- Nginx
- PM2

```bash
# 1. SSH to your server
ssh root@your-server-ip

# 2. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# 4. Install Nginx
sudo apt install nginx

# 5. Install PM2
npm install -g pm2

# 6. Create koperasi user
sudo adduser koperasi
sudo usermod -aG sudo koperasi
```

---

## 🗄️ STEP 2: DATABASE SETUP

### **Create Production Database**

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE koperasi_prod;

# Create dedicated user
CREATE USER koperasi_user WITH ENCRYPTED PASSWORD 'YOUR_STRONG_PASSWORD_HERE';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE koperasi_prod TO koperasi_user;

# Enable UUID extension (required)
\c koperasi_prod
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

# Exit
\q
```

### **Test Database Connection**

```bash
psql -h localhost -U koperasi_user -d koperasi_prod -W
# Enter password when prompted
# If connected successfully, you'll see: koperasi_prod=#
```

---

## 🔐 STEP 3: ENVIRONMENT VARIABLES

### **Generate Production JWT Secret**

```powershell
# Windows PowerShell
$secret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})
echo "JWT_SECRET=`"$secret`""

# Linux/Mac
openssl rand -base64 64
```

### **Create .env.production**

```bash
# Create file (DON'T commit this to Git!)
nano .env.production
```

**Content:**

```env
# ================================
# PRODUCTION ENVIRONMENT
# ================================
NODE_ENV="production"

# ================================
# DATABASE (PRODUCTION)
# ================================
DATABASE_URL="postgresql://koperasi_user:YOUR_STRONG_PASSWORD@localhost:5432/koperasi_prod?schema=public&sslmode=require"

# ================================
# JWT SECRET (PRODUCTION)
# ================================
# ⚠️ NEVER use development secret in production!
# This MUST be different from development
JWT_SECRET="YOUR_GENERATED_PRODUCTION_SECRET_FROM_ABOVE_STEP"

# ================================
# APPLICATION URL
# ================================
NEXT_PUBLIC_API_URL="https://koperasi-umb.ac.id"
NEXTAUTH_URL="https://koperasi-umb.ac.id"

# ================================
# FILE UPLOAD (If using Supabase)
# ================================
# STORAGE_URL="your-supabase-url"
# STORAGE_KEY="your-supabase-key"
# STORAGE_BUCKET="payments"
```

**Security Rules:**
```bash
# Set proper file permissions
chmod 600 .env.production
chown koperasi:koperasi .env.production
```

---

## 📦 STEP 4: DEPLOY APPLICATION

### **Clone Repository**

```bash
# Switch to koperasi user
su - koperasi

# Clone repo
cd /home/koperasi
git clone https://github.com/BroAegg/web-koperasi-umb.git
cd web-koperasi-umb

# Copy production env
cp .env.production .env

# Install dependencies
npm install
```

### **Run Database Migrations**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Verify migrations
npx prisma migrate status
```

### **Seed Initial Data (CRITICAL)**

⚠️ **DO NOT run demo seed scripts in production!**

Create production seed file:

```bash
# Create production seed
nano prisma/seed-production.ts
```

**Content:**

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding production database...');

  // 1. Create Super Admin
  const hashedPassword = await bcrypt.hash('Admin@UMB2025!', 10);
  
  const superAdmin = await prisma.users.upsert({
    where: { email: 'admin@koperasi-umb.ac.id' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Super Admin UMB',
      email: 'admin@koperasi-umb.ac.id',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Super Admin created:', superAdmin.email);

  // 2. Create default product categories
  const categories = [
    'Makanan & Minuman',
    'Perlengkapan Kantor',
    'Elektronik',
    'Kesehatan',
    'Lainnya',
  ];

  for (const category of categories) {
    await prisma.categories.upsert({
      where: { name: category },
      update: {},
      create: {
        id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: category,
        description: `Kategori ${category}`,
      },
    });
  }

  console.log('✅ Categories created');

  console.log('🎉 Production seeding completed!');
  console.log('');
  console.log('📝 IMPORTANT - Save these credentials:');
  console.log('Email: admin@koperasi-umb.ac.id');
  console.log('Password: Admin@UMB2025!');
  console.log('');
  console.log('⚠️  CHANGE PASSWORD IMMEDIATELY AFTER FIRST LOGIN!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run production seed:**

```bash
# Run seed
npx tsx prisma/seed-production.ts

# SAVE THE ADMIN CREDENTIALS SAFELY!
```

---

## 🏗️ STEP 5: BUILD & START

### **Build Production**

```bash
# Build Next.js app
npm run build

# Test production build locally
NODE_ENV=production npm run start

# Open browser: http://localhost:3000
# Test login with admin credentials
```

### **Setup PM2 (Process Manager)**

```bash
# Start with PM2
pm2 start npm --name "koperasi-web" -- start

# Save PM2 configuration
pm2 save

# Setup auto-start on reboot
pm2 startup
# Follow the command it shows

# Monitor app
pm2 logs koperasi-web
pm2 status
```

---

## 🌐 STEP 6: NGINX CONFIGURATION

### **Create Nginx Config**

```bash
sudo nano /etc/nginx/sites-available/koperasi-umb
```

**Content:**

```nginx
server {
    listen 80;
    server_name koperasi-umb.ac.id www.koperasi-umb.ac.id;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name koperasi-umb.ac.id www.koperasi-umb.ac.id;

    # SSL Certificate (update paths after getting certificate)
    ssl_certificate /etc/letsencrypt/live/koperasi-umb.ac.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/koperasi-umb.ac.id/privkey.pem;
    
    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers (redundant with Next.js but extra safety)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files cache
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
    }

    # File uploads location (if using local storage)
    location /uploads {
        alias /home/koperasi/web-koperasi-umb/public/uploads;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Max upload size
    client_max_body_size 10M;
}
```

### **Enable Site & SSL**

```bash
# Install Certbot (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d koperasi-umb.ac.id -d www.koperasi-umb.ac.id

# Enable site
sudo ln -s /etc/nginx/sites-available/koperasi-umb /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable auto-renewal
sudo systemctl enable certbot.timer
```

---

## 🔥 STEP 7: FIREWALL & SECURITY

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH (IMPORTANT - don't lock yourself out!)
sudo ufw allow 22/tcp

# Allow HTTP & HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Deny direct access to PostgreSQL from outside
sudo ufw deny 5432/tcp

# Check status
sudo ufw status
```

---

## ✅ STEP 8: POST-DEPLOYMENT TESTING

### **Critical Features to Test**

1. **Login System**
   ```
   ✓ Super Admin login works
   ✓ JWT token persists
   ✓ Logout works
   ```

2. **Supplier Management**
   ```
   ✓ New supplier registration
   ✓ Payment proof upload
   ✓ Admin verification
   ✓ Supplier login after approval
   ```

3. **Inventory**
   ```
   ✓ Add new product
   ✓ Update stock
   ✓ Stock alerts working
   ```

4. **POS System**
   ```
   ✓ Create transaction
   ✓ Print receipt
   ✓ Transaction history
   ```

5. **Analytics Dashboard**
   ```
   ✓ Best sellers loads
   ✓ Sales trends shows chart
   ✓ Peak hours analysis
   ✓ Customer analytics
   ```

### **Performance Testing**

```bash
# Test response times
curl -w "@curl-format.txt" -o /dev/null -s https://koperasi-umb.ac.id

# Load test (optional)
npm install -g autocannon
autocannon -c 10 -d 30 https://koperasi-umb.ac.id
```

---

## 📊 STEP 9: MONITORING SETUP

### **Setup PM2 Monitoring**

```bash
# PM2 monitoring dashboard
pm2 monitor

# Or use PM2 Plus (free tier)
pm2 link YOUR_SECRET_KEY YOUR_PUBLIC_KEY
```

### **Setup Log Rotation**

```bash
# Install PM2 log rotate
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### **Setup Database Backup**

```bash
# Create backup script
nano /home/koperasi/backup-db.sh
```

**Content:**

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/koperasi/backups"
DB_NAME="koperasi_prod"
DB_USER="koperasi_user"

mkdir -p $BACKUP_DIR

# Backup database
PGPASSWORD="YOUR_DB_PASSWORD" pg_dump -h localhost -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/koperasi_backup_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "koperasi_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: koperasi_backup_$DATE.sql.gz"
```

```bash
# Make executable
chmod +x /home/koperasi/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add line:
0 2 * * * /home/koperasi/backup-db.sh >> /home/koperasi/backup.log 2>&1
```

---

## 🎓 STEP 10: STAFF TRAINING

### **Create Training Accounts**

```sql
-- Login to database
psql -h localhost -U koperasi_user -d koperasi_prod

-- Create Admin account for training
INSERT INTO users (id, name, email, password, role, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Admin Pelatihan',
  'training@koperasi-umb.ac.id',
  '$2a$10$YourHashedPasswordHere', -- Use bcrypt hash
  'ADMIN',
  true,
  NOW(),
  NOW()
);

-- Create Kasir account
INSERT INTO users (id, name, email, password, role, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Kasir Pelatihan',
  'kasir@koperasi-umb.ac.id',
  '$2a$10$YourHashedPasswordHere',
  'KASIR',
  true,
  NOW(),
  NOW()
);
```

### **Training Checklist**

- [ ] Super Admin walkthrough (1 hour)
- [ ] Supplier verification process (30 mins)
- [ ] POS transaction tutorial (45 mins)
- [ ] Inventory management (30 mins)
- [ ] Analytics reports (30 mins)
- [ ] Print receipts training (15 mins)

---

## 🆘 TROUBLESHOOTING

### **Issue: Site not loading**

```bash
# Check if app is running
pm2 status

# Check logs
pm2 logs koperasi-web --lines 50

# Restart app
pm2 restart koperasi-web
```

### **Issue: Database connection failed**

```bash
# Test connection
psql -h localhost -U koperasi_user -d koperasi_prod -W

# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### **Issue: 502 Bad Gateway**

```bash
# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check if port 3000 is listening
sudo netstat -tlnp | grep 3000

# Restart both
pm2 restart koperasi-web
sudo systemctl restart nginx
```

### **Issue: JWT authentication failing**

1. Verify JWT_SECRET in .env.production
2. Check if it matches across all instances
3. Clear browser localStorage
4. Re-login

### **Issue: File upload not working**

```bash
# Check upload directory permissions
ls -la /home/koperasi/web-koperasi-umb/public/uploads

# Fix permissions
mkdir -p /home/koperasi/web-koperasi-umb/public/uploads/payments
chmod 755 /home/koperasi/web-koperasi-umb/public/uploads
chown -R koperasi:koperasi /home/koperasi/web-koperasi-umb/public/uploads
```

---

## 📞 EMERGENCY ROLLBACK

**If deployment fails:**

```bash
# Stop current deployment
pm2 stop koperasi-web

# Rollback database (if needed)
cd /home/koperasi/backups
gunzip < koperasi_backup_YYYYMMDD_HHMMSS.sql.gz | psql -h localhost -U koperasi_user -d koperasi_prod

# Rollback code
git reset --hard PREVIOUS_COMMIT_HASH
npm install
npm run build
pm2 restart koperasi-web
```

---

## 📝 POST-LAUNCH CHECKLIST

### **Day 1 (Launch Day)**
- [ ] Monitor error logs every hour
- [ ] Test all critical features
- [ ] Be available for immediate bug fixes
- [ ] Collect user feedback

### **Week 1**
- [ ] Daily log monitoring
- [ ] Performance optimization
- [ ] Fix reported bugs
- [ ] Update documentation

### **Week 2-4**
- [ ] Setup monitoring dashboards
- [ ] Implement rate limiting (if needed)
- [ ] Add API documentation
- [ ] Plan feature enhancements

---

## 🎯 SUCCESS METRICS

**Track these KPIs:**
- Response time < 2 seconds
- Uptime > 99%
- Zero security incidents
- User satisfaction > 4/5
- Transaction success rate > 99%

---

## 📚 ADDITIONAL RESOURCES

**Documentation:**
- Next.js Production Docs: https://nextjs.org/docs/deployment
- PostgreSQL Administration: https://www.postgresql.org/docs/
- Nginx Configuration: https://nginx.org/en/docs/

**Support:**
- Development Team: [Your Contact]
- Server Admin: [Your Contact]
- Emergency Hotline: [Your Number]

---

**Created:** 25 Oktober 2025  
**Version:** 1.0  
**Status:** ✅ READY FOR DEPLOYMENT
