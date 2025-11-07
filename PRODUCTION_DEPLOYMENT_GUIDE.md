# 🚀 PRODUCTION DEPLOYMENT GUIDE
**Koperasi UMB - Complete Deployment Manual**

**Target**: Ubuntu 22.04 LTS VPS  
**Stack**: Docker + Docker Compose + Nginx + SSL  
**Estimated Time**: 2-3 hours

---

## 📋 Pre-Deployment Checklist

- [ ] VPS ready (minimum 2GB RAM, 2 CPU cores, 20GB disk)
- [ ] Domain name configured (e.g., koperasi.umb.ac.id)
- [ ] DNS A record pointing to VPS IP
- [ ] SSH access to VPS
- [ ] Root or sudo privileges

---

## 🔧 STEP 1: VPS Initial Setup

### 1.1 Connect to VPS
```bash
ssh root@your-vps-ip
# Or with key:
ssh -i your-key.pem ubuntu@your-vps-ip
```

### 1.2 Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git wget ufw
```

### 1.3 Setup Firewall
```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

### 1.4 Create Non-Root User (Recommended)
```bash
sudo adduser koperasi
sudo usermod -aG sudo koperasi
sudo usermod -aG docker koperasi
su - koperasi
```

---

## 🐳 STEP 2: Install Docker & Docker Compose

### 2.1 Install Docker
```bash
# Remove old versions
sudo apt remove docker docker-engine docker.io containerd runc

# Install prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify installation
sudo docker --version
sudo docker compose version
```

### 2.2 Configure Docker (Optional but Recommended)
```bash
# Add current user to docker group (no sudo needed)
sudo usermod -aG docker $USER
newgrp docker

# Enable Docker on boot
sudo systemctl enable docker
sudo systemctl start docker

# Test Docker
docker run hello-world
```

---

## 📦 STEP 3: Deploy Application

### 3.1 Clone Repository
```bash
cd /opt
sudo mkdir koperasi-umb
sudo chown $USER:$USER koperasi-umb
cd koperasi-umb

# Clone from GitHub
git clone https://github.com/BroAegg/web-koperasi-umb.git .

# Or upload via SCP from local:
# scp -r . user@vps:/opt/koperasi-umb/
```

### 3.2 Create Production Environment File
```bash
# Create .env.production
nano .env.production
```

**Copy this content** (edit values):
```bash
# Database Configuration
DATABASE_URL="mysql://koperasi_user:CHANGE_THIS_STRONG_PASSWORD@mysql:3306/koperasi_umb"

# NextAuth Configuration
NEXTAUTH_URL="https://koperasi.umb.ac.id"
NEXTAUTH_SECRET="GENERATE_RANDOM_32CHAR_SECRET_HERE_USE_openssl_rand_base64_32"

# Application Environment
NODE_ENV="production"

# MySQL Root Password (for Docker)
MYSQL_ROOT_PASSWORD="CHANGE_THIS_ROOT_PASSWORD"
MYSQL_DATABASE="koperasi_umb"
MYSQL_USER="koperasi_user"
MYSQL_PASSWORD="CHANGE_THIS_STRONG_PASSWORD"

# Optional: Logging
LOG_LEVEL="info"
```

**Generate secure secrets**:
```bash
# Generate NEXTAUTH_SECRET (32 characters)
openssl rand -base64 32

# Generate database password (24 characters)
openssl rand -base64 24
```

### 3.3 Create Production Docker Compose
```bash
nano docker-compose.production.yml
```

```yaml
version: '3.8'

services:
  # MySQL Database
  mysql:
    image: mysql:8.0
    container_name: koperasi-mysql-prod
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backups:/backups
    ports:
      - "127.0.0.1:3306:3306"  # Only localhost access
    networks:
      - koperasi-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Next.js Application
  app:
    build:
      context: .
      dockerfile: Dockerfile.production
    container_name: koperasi-app-prod
    restart: always
    env_file:
      - .env.production
    ports:
      - "127.0.0.1:3000:3000"  # Only localhost access (Nginx will proxy)
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - koperasi-network
    volumes:
      - ./public/uploads:/app/public/uploads
      - ./backups:/app/backups
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

networks:
  koperasi-network:
    driver: bridge

volumes:
  mysql_data:
    driver: local
```

### 3.4 Create Production Dockerfile
```bash
nano Dockerfile.production
```

```dockerfile
# Base image
FROM node:20-alpine AS base
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

# Builder stage
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM base AS runner
ENV NODE_ENV=production

# Copy necessary files
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/.env.production ./

# Create uploads directory
RUN mkdir -p /app/public/uploads && chmod 777 /app/public/uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["npm", "start"]
```

### 3.5 Build and Start
```bash
# Build images
docker compose -f docker-compose.production.yml build

# Start services
docker compose -f docker-compose.production.yml up -d

# Check logs
docker compose -f docker-compose.production.yml logs -f app

# Check health
docker ps
curl http://localhost:3000/api/health
```

---

## 🌐 STEP 4: Setup Nginx Reverse Proxy

### 4.1 Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 4.2 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/koperasi-umb
```

```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name koperasi.umb.ac.id www.koperasi.umb.ac.id;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS - Main configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name koperasi.umb.ac.id www.koperasi.umb.ac.id;

    # SSL Configuration (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/koperasi.umb.ac.id/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/koperasi.umb.ac.id/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Client body size (for file uploads)
    client_max_body_size 10M;

    # Proxy to Next.js app
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, immutable";
    }

    # Images caching
    location ~* \.(jpg|jpeg|png|gif|ico|webp)$ {
        proxy_pass http://localhost:3000;
        expires 7d;
        add_header Cache-Control "public";
    }

    # Access and error logs
    access_log /var/log/nginx/koperasi-umb-access.log;
    error_log /var/log/nginx/koperasi-umb-error.log;
}
```

### 4.3 Enable Site
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/koperasi-umb /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔒 STEP 5: Setup SSL Certificate (Let's Encrypt)

### 5.1 Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 5.2 Obtain SSL Certificate
```bash
# Get certificate (Certbot will auto-configure Nginx)
sudo certbot --nginx -d koperasi.umb.ac.id -d www.koperasi.umb.ac.id

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose redirect to HTTPS (recommended)
```

### 5.3 Test Auto-Renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot will auto-renew every 60 days via cron
```

---

## 🗄️ STEP 6: Database Migration & Seeding

### 6.1 Run Migrations
```bash
cd /opt/koperasi-umb

# Enter app container
docker exec -it koperasi-app-prod sh

# Inside container:
npx prisma migrate deploy
npx prisma db seed

# Exit container
exit
```

### 6.2 Verify Database
```bash
# Connect to MySQL
docker exec -it koperasi-mysql-prod mysql -u koperasi_user -p koperasi_umb

# Inside MySQL:
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM products;
EXIT;
```

---

## 🔄 STEP 7: Setup Automated Backups

### 7.1 Create Backup Script
```bash
sudo nano /opt/koperasi-umb/scripts/backup-production.sh
```

```bash
#!/bin/bash
# Production Backup Script

BACKUP_DIR="/opt/koperasi-umb/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="koperasi_umb_prod_${TIMESTAMP}.sql"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Backup database
docker exec koperasi-mysql-prod mysqldump \
  -u koperasi_user \
  -p${MYSQL_PASSWORD} \
  koperasi_umb \
  > ${BACKUP_DIR}/${BACKUP_FILE}

# Compress backup
gzip ${BACKUP_DIR}/${BACKUP_FILE}

# Keep only last 30 backups
cd $BACKUP_DIR
ls -t | tail -n +31 | xargs -r rm

echo "Backup completed: ${BACKUP_FILE}.gz"
```

### 7.2 Make Executable
```bash
chmod +x /opt/koperasi-umb/scripts/backup-production.sh
```

### 7.3 Setup Cron Job (Daily at 2 AM)
```bash
# Edit crontab
crontab -e

# Add this line:
0 2 * * * /opt/koperasi-umb/scripts/backup-production.sh >> /var/log/koperasi-backup.log 2>&1
```

---

## 📊 STEP 8: Monitoring & Logging

### 8.1 Check Application Logs
```bash
# Real-time logs
docker compose -f docker-compose.production.yml logs -f app

# Last 100 lines
docker compose -f docker-compose.production.yml logs --tail=100 app

# Nginx access logs
sudo tail -f /var/log/nginx/koperasi-umb-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/koperasi-umb-error.log
```

### 8.2 System Monitoring
```bash
# Docker stats
docker stats

# Disk usage
df -h

# Memory usage
free -h

# Check running services
docker ps
sudo systemctl status nginx
```

---

## ✅ STEP 9: Post-Deployment Verification

### 9.1 Test All Features
- [ ] Visit https://koperasi.umb.ac.id
- [ ] Test login (kasir1@umb.ac.id / Kasir123)
- [ ] Test POS system
- [ ] Test product management
- [ ] Test reports
- [ ] Test backup restoration

### 9.2 Security Checklist
- [ ] SSL certificate valid
- [ ] Firewall configured
- [ ] Strong passwords set
- [ ] Database not publicly accessible
- [ ] NEXTAUTH_SECRET changed
- [ ] Root login disabled (optional)

### 9.3 Performance Check
```bash
# Test response time
curl -o /dev/null -s -w "Time: %{time_total}s\n" https://koperasi.umb.ac.id

# Check SSL grade
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=koperasi.umb.ac.id
```

---

## 🆘 TROUBLESHOOTING

### Issue: App won't start
```bash
# Check logs
docker compose -f docker-compose.production.yml logs app

# Rebuild
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml build --no-cache
docker compose -f docker-compose.production.yml up -d
```

### Issue: Database connection failed
```bash
# Check MySQL logs
docker logs koperasi-mysql-prod

# Verify credentials
docker exec -it koperasi-mysql-prod mysql -u koperasi_user -p
```

### Issue: SSL not working
```bash
# Check certificate
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check Nginx config
sudo nginx -t
```

### Issue: 502 Bad Gateway
```bash
# Check if app is running
curl http://localhost:3000/api/health

# Restart services
docker compose -f docker-compose.production.yml restart app
```

---

## 🚀 MAINTENANCE COMMANDS

```bash
# Restart all services
cd /opt/koperasi-umb
docker compose -f docker-compose.production.yml restart

# Stop all services
docker compose -f docker-compose.production.yml down

# Update application
git pull origin main
docker compose -f docker-compose.production.yml build --no-cache
docker compose -f docker-compose.production.yml up -d

# View resource usage
docker stats

# Clean up old images
docker image prune -a

# Backup manually
/opt/koperasi-umb/scripts/backup-production.sh
```

---

## 📞 SUPPORT & NOTES

**Deployed By**: Aegner Billik  
**Date**: November 6, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

**Important Files**:
- Application: `/opt/koperasi-umb`
- Backups: `/opt/koperasi-umb/backups`
- Nginx Config: `/etc/nginx/sites-available/koperasi-umb`
- SSL Certs: `/etc/letsencrypt/live/koperasi.umb.ac.id/`
- Logs: `/var/log/nginx/koperasi-umb-*.log`

**Default Credentials** (CHANGE AFTER FIRST LOGIN):
- Super Admin: manager@umb.ac.id / KoperasiUMB2025
- Kasir: kasir1@umb.ac.id / Kasir123
- Developer: aegner@umb.ac.id / Dev@Secure2025!

🎉 **DEPLOYMENT COMPLETE!**
