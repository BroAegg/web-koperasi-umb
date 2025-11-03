# 🐳 Web Koperasi UMB - Docker Setup Guide

## ✅ Status Sistem

**Application**: ✅ Ready  
**Database**: ✅ MySQL 8.0  
**Authentication**: ✅ NextAuth configured  
**Build**: ✅ Optimized  

## 🚀 Quick Start

### 1. Persiapan
```powershell
# Pastikan Docker Desktop running
# Buka PowerShell di folder project
cd "d:\Sisinfo\web-koperasi-umb"
```

### 2. Build & Start (Pilih salah satu)

**Option A: Fast Build (Recommended)**
```powershell
# Build image
docker build -f Dockerfile.fast -t web-koperasi-umb:fast .

# Start services
docker-compose -f docker-compose.fast.yml up -d
```

**Option B: Standard Build**
```powershell
# Build & start in one command
docker-compose up --build -d
```

**Option C: Management Script**
```powershell
# Build
.\docker-manage.ps1 build

# Start all services
.\docker-manage.ps1 start
```

## 🌐 Service URLs

### Docker Services (Port berbeda untuk menghindari konflik)
- **Web Application**: http://localhost:3002
- **Database Admin**: http://localhost:8082
- **Database Direct**: localhost:3308

### Local Development (tetap bisa jalan bersamaan)
- **Local Dev Server**: http://localhost:3000
- **Local Adminer**: http://localhost:8080
- **Local Database**: localhost:3306

### Login Credentials
```
Email: admin@mekarmukti.id
Password: admin123
```

## �️ Management Commands

### Using PowerShell Script (Easiest)
```powershell
.\docker-manage.ps1 build      # Build image
.\docker-manage.ps1 start      # Start services
.\docker-manage.ps1 stop       # Stop services
.\docker-manage.ps1 restart    # Restart services
.\docker-manage.ps1 logs       # View logs
.\docker-manage.ps1 status     # Check status
.\docker-manage.ps1 shell      # Access container
.\docker-manage.ps1 db         # Access database
.\docker-manage.ps1 clean      # Clean resources
```

### Using Docker Compose Directly
```powershell
# Fast version (recommended)
docker-compose -f docker-compose.fast.yml up -d
docker-compose -f docker-compose.fast.yml down
docker-compose -f docker-compose.fast.yml logs -f

# Standard version
docker-compose up -d
docker-compose down
docker-compose logs -f app
```

## 🗄️ Database Operations

### Local Development (No Docker)
```powershell
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# View database
npx prisma studio
```

### Docker Container
```powershell
# Inside container
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma generate

# Direct database access
docker-compose exec database mysql -u koperasi_user -pKoperasiUMB2025! koperasi_umb
```
Host: localhost:3306
User: koperasi_user  
Password: KoperasiUMB2025!
Database: koperasi_umb

# Root Access
User: root
Password: rootpassword123
```

## 📊 Monitoring

```powershell
# Check resource usage
docker stats

# View all containers
docker ps

# Clean unused resources
docker system prune
```

## 🐛 Troubleshooting

### Jika Port 3000 sudah digunakan:
## 🐛 Troubleshooting

### Build Errors

**npm timeout atau network issues:**
```powershell
# Option 1: Use registry mirror
npm config set registry https://registry.npmmirror.com/
docker build -f Dockerfile.fast -t web-koperasi-umb:fast .

# Option 2: Build locally first
npm install
npm run build
# Then copy built files to Docker

# Option 3: Clear and rebuild
docker system prune -a -f
docker build --no-cache -f Dockerfile.fast -t web-koperasi-umb:fast .
```

**Build context too large:**
```powershell
# Already optimized with .dockerignore
# Build context should be ~3MB
# If larger, check .dockerignore includes necessary exclusions
```

### Runtime Errors

**Port already in use:**
```powershell
# Check what's using the port
netstat -an | findstr :3002

# Stop conflicting service or change port in docker-compose.fast.yml
```

**Database connection error:**
```powershell
# Check database is healthy
docker-compose ps

# Restart database
docker-compose restart database

# View database logs
docker-compose logs database
```

**Application won't start:**
```powershell
# Check logs
docker-compose logs app

# Common fixes:
# 1. Regenerate Prisma client
docker-compose exec app npx prisma generate

# 2. Check environment variables
docker-compose exec app env | grep DATABASE_URL

# 3. Restart app container
docker-compose restart app
```

### Complete Reset
```powershell
# Stop all containers
docker-compose -f docker-compose.fast.yml down -v

# Remove images
docker rmi web-koperasi-umb:fast

# Clean system
docker system prune -a -f

# Rebuild from scratch
docker build -f Dockerfile.fast -t web-koperasi-umb:fast .
docker-compose -f docker-compose.fast.yml up -d
```

### Alternative: Local Development
```powershell
# If Docker continues to have issues, use local development:
npm install
npm run dev
# Access: http://localhost:3000

# Database already running in Docker container (koperasi-mysql)
# Connection: localhost:3306
```

## 📋 Production Checklist

- [ ] Update `NEXTAUTH_URL` ke domain production
- [ ] Generate `NEXTAUTH_SECRET` baru yang aman
- [ ] Ubah password database default
- [ ] Setup SSL certificate  
- [ ] Configure backup strategy
- [ ] Setup monitoring & logging
- [ ] Test all features thoroughly
- [ ] Setup CI/CD pipeline
- [ ] Configure firewall rules
- [ ] Setup automated backups

## 📚 File Structure

```
web-koperasi-umb/
├── Dockerfile              # Standard multi-stage build
├── Dockerfile.fast         # Optimized single-stage build
├── docker-compose.yml      # Standard compose file
├── docker-compose.fast.yml # Fast compose with different ports
├── docker-manage.ps1       # PowerShell management script
├── .dockerignore          # Optimized ignore patterns
└── DOCKER_README.md       # This file
```

---

**🎉 Setup Complete!** 

Untuk memulai:
1. Start Docker Desktop
2. Run: `.\docker-manage.ps1 build`
3. Run: `.\docker-manage.ps1 start`
4. Access: http://localhost:3002

Happy coding! 💻