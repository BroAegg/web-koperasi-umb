# 🐳 Docker Hub Deployment Guide - Web Koperasi UMB

## 📋 Prerequisites

1. **Docker Hub Account**
   - Sign up at: https://hub.docker.com/
   - Choose a username (e.g., `broaegg`)

2. **Docker Desktop Running**
   - Make sure Docker Desktop is installed and running

---

## 🚀 Step-by-Step: Push to Docker Hub

### Step 1: Login to Docker Hub

```powershell
# Login dengan username dan password
docker login

# Enter your Docker Hub username
# Enter your Docker Hub password/token
```

**Expected output:**
```
Login Succeeded
```

### Step 2: Build Production Image

```powershell
# Build dengan tag yang sesuai username Docker Hub
# Format: username/repository:tag
docker build -f Dockerfile.production -t broaegg/web-koperasi-umb:latest .

# Buat tag additional untuk versioning
docker tag broaegg/web-koperasi-umb:latest broaegg/web-koperasi-umb:v1.0
```

**Note:** Ganti `broaegg` dengan username Docker Hub Anda!

### Step 3: Push to Docker Hub

```powershell
# Push latest version
docker push broaegg/web-koperasi-umb:latest

# Push versioned tag
docker push broaegg/web-koperasi-umb:v1.0
```

**Upload time:** ~5-15 minutes (tergantung koneksi)

---

## 📦 For Others to Use Your Image

Setelah image di-push, orang lain bisa menggunakannya dengan:

### Pull Image
```powershell
docker pull broaegg/web-koperasi-umb:latest
```

### Run Container
```powershell
# Basic run
docker run -d -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e NEXTAUTH_SECRET="your-secret" \
  broaegg/web-koperasi-umb:latest

# With database (full stack)
docker-compose -f docker-compose.hub.yml up -d
```

---

## 🔧 Create Docker Compose for Public Use

Mari buat docker-compose yang menggunakan image dari Docker Hub:

**docker-compose.hub.yml:**
```yaml
services:
  database:
    image: mysql:8.0
    container_name: koperasi-db
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword123
      MYSQL_DATABASE: koperasi_umb
      MYSQL_USER: koperasi_user
      MYSQL_PASSWORD: KoperasiUMB2025!
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - koperasi-net

  app:
    image: broaegg/web-koperasi-umb:latest
    container_name: koperasi-app
    restart: unless-stopped
    environment:
      - DATABASE_URL=mysql://koperasi_user:KoperasiUMB2025!@database:3306/koperasi_umb
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=your-secret-here
      - NODE_ENV=production
    ports:
      - "3000:3000"
    depends_on:
      - database
    networks:
      - koperasi-net

  adminer:
    image: adminer:latest
    container_name: koperasi-adminer
    restart: unless-stopped
    ports:
      - "8080:8080"
    networks:
      - koperasi-net

volumes:
  mysql_data:

networks:
  koperasi-net:
    driver: bridge
```

---

## 📊 Image Size Optimization

### Check Image Size
```powershell
docker images broaegg/web-koperasi-umb
```

### Tips untuk Reduce Size
1. ✅ Multi-stage build (already implemented)
2. ✅ Alpine Linux base (smaller than ubuntu)
3. ✅ Remove dev dependencies
4. ✅ Standalone Next.js build

**Expected size:** ~200-300MB (sudah optimal)

---

## 🔐 Security Best Practices

### 1. Use Docker Hub Access Token (Recommended)
```powershell
# Create token di: https://hub.docker.com/settings/security
# Login dengan token instead of password
docker login -u broaegg
# Paste token instead of password
```

### 2. Private vs Public Repository

**Public Repository (Free):**
- ✅ Anyone can pull
- ✅ Good untuk open source
- ✅ No limits on pulls

**Private Repository (Paid/Limited Free):**
- 🔒 Only authorized users
- 🔒 Require authentication to pull
- 🔒 1 private repo free

### 3. Environment Variables
```powershell
# NEVER commit .env with real secrets!
# Use .env.example for public sharing
```

---

## 📖 Documentation for Users

Create README.md section:

```markdown
## 🐳 Docker Quick Start

Pull and run from Docker Hub:

\`\`\`bash
# Pull image
docker pull broaegg/web-koperasi-umb:latest

# Run with docker-compose
curl -O https://raw.githubusercontent.com/BroAegg/web-koperasi-umb/main/docker-compose.hub.yml
docker-compose -f docker-compose.hub.yml up -d

# Access
http://localhost:3000
\`\`\`

Default credentials:
- Email: admin@mekarmukti.id
- Password: admin123
```

---

## 🔄 Update Workflow

When you update the app:

```powershell
# 1. Build new version
docker build -f Dockerfile.production -t broaegg/web-koperasi-umb:v1.1 .

# 2. Tag as latest
docker tag broaegg/web-koperasi-umb:v1.1 broaegg/web-koperasi-umb:latest

# 3. Push both tags
docker push broaegg/web-koperasi-umb:v1.1
docker push broaegg/web-koperasi-umb:latest
```

---

## 📈 Monitor Stats

Check your image on Docker Hub:
```
https://hub.docker.com/r/broaegg/web-koperasi-umb
```

You can see:
- 📊 Pull count
- 📅 Last updated
- 💬 User feedback

---

## ❓ Troubleshooting

### Login Failed
```powershell
# Clear credentials
docker logout

# Login again
docker login
```

### Push Failed
```powershell
# Check tag format (must include username)
docker images

# Retag if needed
docker tag web-koperasi-umb:latest broaegg/web-koperasi-umb:latest
```

### Large Upload Time
```powershell
# Build with better compression
docker build --compress -f Dockerfile.production -t broaegg/web-koperasi-umb:latest .
```

---

## 🎯 Quick Commands Summary

```powershell
# Login
docker login

# Build
docker build -f Dockerfile.production -t broaegg/web-koperasi-umb:latest .

# Push
docker push broaegg/web-koperasi-umb:latest

# Others pull & run
docker pull broaegg/web-koperasi-umb:latest
docker run -d -p 3000:3000 broaegg/web-koperasi-umb:latest
```

---

**🎉 Your Docker image will be public at:**
```
docker pull broaegg/web-koperasi-umb:latest
```

Share this command with others to let them use your application! 🚀