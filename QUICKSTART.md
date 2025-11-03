# 🚀 Quick Start - Web Koperasi UMB

## Local Development (Fastest)

```powershell
npm run dev
```
**Access:** http://localhost:3000

---

## Docker Deployment

### 1. Build Image
```powershell
docker build -f Dockerfile.fast -t web-koperasi-umb:fast .
```

### 2. Start Services
```powershell
docker-compose -f docker-compose.fast.yml up -d
```

### 3. Access
- **App:** http://localhost:3002
- **Adminer:** http://localhost:8082
- **Database:** localhost:3308

---

## Management Commands

```powershell
# PowerShell Script
.\docker-manage.ps1 build      # Build image
.\docker-manage.ps1 start      # Start services
.\docker-manage.ps1 stop       # Stop services
.\docker-manage.ps1 status     # Check status
.\docker-manage.ps1 logs       # View logs

# Docker Compose
docker-compose -f docker-compose.fast.yml up -d     # Start
docker-compose -f docker-compose.fast.yml down      # Stop
docker-compose -f docker-compose.fast.yml ps        # Status

# Database
docker start koperasi-mysql                         # Start DB
docker stop koperasi-mysql                          # Stop DB
npx prisma studio                                   # Database UI
```

---

## Login Credentials

```
Email: admin@mekarmukti.id
Password: admin123
```

---

## Need Help?

- **Full Guide:** DOCKER_README.md
- **Setup Status:** SETUP_COMPLETE.md
- **Cleanup Info:** CLEANUP_SUMMARY.md