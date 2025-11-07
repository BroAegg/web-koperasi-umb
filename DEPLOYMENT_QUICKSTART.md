# 🚀 Quick Production Deployment Guide

**Target**: Deploy to VPS with SSL in 30 minutes

---

## Prerequisites

- ✅ VPS with Ubuntu 22.04 LTS (min 2GB RAM)
- ✅ Domain name (e.g., koperasi.umb.ac.id)
- ✅ DNS A record pointing to VPS IP
- ✅ SSH access to VPS

---

## Step 1: Prepare VPS (5 minutes)

```bash
# Connect to VPS
ssh root@your-vps-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install -y docker-compose-plugin

# Verify installation
docker --version
docker compose version

# Setup firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## Step 2: Clone Repository (2 minutes)

```bash
# Create application directory
sudo mkdir -p /opt/koperasi-umb
cd /opt/koperasi-umb

# Clone repository
git clone https://github.com/BroAegg/web-koperasi-umb.git .

# Make scripts executable
chmod +x deploy-production.sh
chmod +x setup-ssl.sh
```

---

## Step 3: Configure Environment (5 minutes)

```bash
# Copy environment template
cp .env.production.example .env.production

# Generate secure passwords
echo "MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)"
echo "MYSQL_PASSWORD=$(openssl rand -base64 32)"
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"

# Edit .env.production
nano .env.production
```

**Update these values:**
```env
MYSQL_ROOT_PASSWORD=<generated-password-1>
MYSQL_PASSWORD=<generated-password-2>
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=https://your-domain.com
DATABASE_URL="mysql://koperasi_app:<generated-password-2>@mysql:3306/koperasi_umb_production"
```

---

## Step 4: Update Domain Configuration (2 minutes)

```bash
# Update Nginx configuration
nano nginx/conf.d/koperasi.conf
```

**Replace all instances of `koperasi.umb.ac.id` with your domain:**
- Line 7: `server_name YOUR_DOMAIN www.YOUR_DOMAIN;`
- Line 25: `server_name YOUR_DOMAIN www.YOUR_DOMAIN;`
- Line 28-29: SSL certificate paths

---

## Step 5: Setup SSL Certificate (5 minutes)

```bash
# Edit SSL setup script
nano setup-ssl.sh
```

**Update these values:**
```bash
DOMAIN="your-domain.com"
EMAIL="your-email@domain.com"
```

**Run SSL setup:**
```bash
sudo ./setup-ssl.sh
```

This will:
- Start temporary Nginx
- Request SSL certificate from Let's Encrypt
- Verify certificate
- Setup auto-renewal

---

## Step 6: Deploy Application (10 minutes)

```bash
# Run deployment script
sudo ./deploy-production.sh
```

This will:
1. ✅ Check prerequisites
2. ✅ Setup application directory
3. ✅ Create environment file
4. ✅ Build Docker containers
5. ✅ Start all services
6. ✅ Run database migrations
7. ✅ Seed initial users
8. ✅ Setup automated backups

---

## Step 7: Verify Deployment (5 minutes)

### Check containers are running:
```bash
docker ps
```

You should see:
- `koperasi-app-prod` (Next.js application)
- `koperasi-mysql-prod` (MySQL database)
- `koperasi-nginx-prod` (Nginx reverse proxy)

### Check logs:
```bash
# All logs
docker-compose -f docker-compose.production.yml logs -f

# App logs only
docker-compose -f docker-compose.production.yml logs -f app

# Nginx logs only
docker-compose -f docker-compose.production.yml logs -f nginx
```

### Test application:
1. Visit `https://your-domain.com`
2. You should see the login page
3. Try logging in with default credentials:
   - Email: `admin@umb.ac.id`
   - Password: `Admin123!@#`

### Check health endpoint:
```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "uptime": 123
}
```

---

## 🔐 Default Credentials

**⚠️ CHANGE THESE IMMEDIATELY AFTER FIRST LOGIN!**

### Super Admin
- Email: `super@umb.ac.id`
- Password: `Super123!@#`
- Access: Full system control

### Admin (Kasir)
- Email: `admin@umb.ac.id`
- Password: `Admin123!@#`
- Access: POS, inventory, reports

### Developer
- URL: `https://your-domain.com/dev/login`
- Email: `dev@umb.ac.id`
- Password: `Dev123!@#`
- Access: Developer tools, system logs

---

## 🔧 Post-Deployment Tasks

### 1. Change All Passwords
```bash
# Login to application
# Go to Settings > Change Password
# Update all default accounts
```

### 2. Import Initial Data
```bash
# Upload product CSV
# Create categories
# Setup suppliers
```

### 3. Test All Features
- [ ] Login/logout
- [ ] POS transactions
- [ ] Product management
- [ ] Inventory tracking
- [ ] Financial reports
- [ ] Settlement calculations
- [ ] Member registration
- [ ] Backup/restore

### 4. Setup Monitoring

**UptimeRobot (Free):**
1. Sign up at https://uptimerobot.com
2. Add HTTP(s) monitor
3. URL: `https://your-domain.com/api/health`
4. Check interval: 5 minutes
5. Email alerts: your-email@domain.com

### 5. Setup Email Notifications (Optional)
```bash
# Edit .env.production
nano .env.production
```

Add SMTP configuration:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@your-domain.com
```

---

## 🔄 Useful Commands

### View Logs
```bash
# All logs
docker-compose -f docker-compose.production.yml logs -f

# Last 100 lines
docker-compose -f docker-compose.production.yml logs --tail=100

# Specific service
docker-compose -f docker-compose.production.yml logs -f app
```

### Restart Services
```bash
# Restart all
docker-compose -f docker-compose.production.yml restart

# Restart specific service
docker-compose -f docker-compose.production.yml restart app
docker-compose -f docker-compose.production.yml restart nginx
```

### Stop/Start Services
```bash
# Stop all
docker-compose -f docker-compose.production.yml down

# Start all
docker-compose -f docker-compose.production.yml up -d

# Rebuild and start
docker-compose -f docker-compose.production.yml up -d --build
```

### Database Operations
```bash
# Backup database
docker exec koperasi-mysql-prod mysqldump -u root -p<password> koperasi_umb_production > backup.sql

# Restore database
docker exec -i koperasi-mysql-prod mysql -u root -p<password> koperasi_umb_production < backup.sql

# Access MySQL shell
docker exec -it koperasi-mysql-prod mysql -u root -p
```

### Update Application
```bash
cd /opt/koperasi-umb

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build

# Run migrations
docker-compose -f docker-compose.production.yml exec app npx prisma migrate deploy
```

---

## 🐛 Troubleshooting

### Application not accessible
```bash
# Check containers
docker ps

# Check logs
docker-compose -f docker-compose.production.yml logs -f

# Check Nginx
docker-compose -f docker-compose.production.yml logs -f nginx

# Test internal connection
curl http://localhost:3000/api/health
```

### Database connection error
```bash
# Check MySQL container
docker ps | grep mysql

# Check database logs
docker-compose -f docker-compose.production.yml logs -f mysql

# Test database connection
docker exec -it koperasi-mysql-prod mysql -u root -p
```

### SSL certificate issues
```bash
# Check certificate
sudo certbot certificates

# Renew certificate manually
sudo certbot renew --force-renewal

# Re-run SSL setup
sudo ./setup-ssl.sh
```

### Port already in use
```bash
# Check what's using port 80/443
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# Kill process (if needed)
sudo kill -9 <PID>
```

---

## 📊 Performance Optimization

### Enable Redis Cache (Optional)
```bash
# Add Redis to docker-compose.production.yml
# Update app environment with Redis URL
# Restart services
```

### Database Optimization
```bash
# Access MySQL
docker exec -it koperasi-mysql-prod mysql -u root -p

# Run these commands:
OPTIMIZE TABLE products;
OPTIMIZE TABLE transactions;
OPTIMIZE TABLE transaction_items;
ANALYZE TABLE products;
ANALYZE TABLE transactions;
```

### Monitor Resource Usage
```bash
# Check container stats
docker stats

# Check disk usage
df -h

# Check memory usage
free -h
```

---

## 🛡️ Security Checklist

- [ ] Changed all default passwords
- [ ] SSL certificate installed and working
- [ ] Firewall configured (only ports 22, 80, 443)
- [ ] Automated backups running
- [ ] Monitoring setup (UptimeRobot)
- [ ] Rate limiting enabled (Nginx)
- [ ] Security headers configured
- [ ] Database access restricted to localhost
- [ ] Regular updates scheduled

---

## 📞 Support

**For Issues:**
- Check logs: `docker-compose -f docker-compose.production.yml logs -f`
- Review documentation: `PRODUCTION_DEPLOYMENT_GUIDE.md`
- Contact: aegner@umb.ac.id

---

## ✅ Deployment Complete!

Your Koperasi UMB system is now live at:
**https://your-domain.com**

**Next Steps:**
1. ✅ Change all default passwords
2. ✅ Import initial data
3. ✅ Test all features
4. ✅ Train users
5. ✅ Monitor system

**Congratulations! 🎉**
