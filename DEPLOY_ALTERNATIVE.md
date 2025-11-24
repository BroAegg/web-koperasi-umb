# Alternative Deployment Options

## 1. Railway (Recommended)

Railway support Next.js dan PostgreSQL built-in.

### Setup Railway:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Environment Variables:
Set di Railway Dashboard atau via CLI:
```bash
railway variables set DATABASE_URL="your_database_url"
railway variables set NEXTAUTH_SECRET="your_secret"
railway variables set NEXTAUTH_URL="https://your-app.railway.app"
```

Railway akan auto-detect Next.js dan deploy dengan port yang sesuai.

---

## 2. Render

### Setup Render:
1. Push ke GitHub (public repo)
2. Connect GitHub ke Render
3. Deploy sebagai "Web Service"
4. Set environment variables

Build Command: `npm install && npx prisma generate && npm run build`
Start Command: `npm start`

---

## 3. Fly.io

### Setup Fly.io:
```bash
# Install flyctl
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Login
fly auth login

# Launch app
fly launch

# Deploy
fly deploy
```

Create `fly.toml`:
```toml
app = "web-koperasi-umb"
primary_region = "sin"

[build]
  [build.args]
    NODE_VERSION = "20"

[env]
  PORT = "3000"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  memory = "1gb"
  cpu_kind = "shared"
  cpus = 1
```

---

## 4. DigitalOcean App Platform

1. Push ke GitHub
2. Create new App di DigitalOcean
3. Connect repository
4. Add PostgreSQL database
5. Set environment variables
6. Deploy

Build Command: `npm install && npx prisma generate && npm run build`
Run Command: `npm start`

---

## 5. Netlify (Dengan Serverless)

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## 6. Self-Host dengan Docker + Nginx

Deploy ke VPS sendiri (DigitalOcean Droplet, AWS EC2, dll):

```bash
# Build Docker image
docker build -t web-koperasi-umb .

# Run container
docker run -d -p 3000:3000 \
  -e DATABASE_URL="your_db_url" \
  -e NEXTAUTH_SECRET="your_secret" \
  web-koperasi-umb
```

Gunakan Nginx sebagai reverse proxy + SSL (Let's Encrypt).

---

## Comparison:

| Platform | Free Tier | Database | Custom Domain | Difficulty |
|----------|-----------|----------|---------------|------------|
| Railway | $5 credit/month | ✅ PostgreSQL | ✅ | Easy |
| Render | ✅ Limited | ✅ PostgreSQL | ✅ | Easy |
| Fly.io | ✅ Limited | ✅ PostgreSQL | ✅ | Medium |
| DigitalOcean | $200 credit (60 days) | ✅ Managed DB | ✅ | Easy |
| Netlify | ✅ Good | ❌ (External) | ✅ | Easy |
| Self-Host VPS | From $4/month | Manual setup | ✅ | Hard |

---

## Recommended: Railway

Paling simple dan support full Next.js + PostgreSQL:

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login` (buka browser untuk auth)
3. Deploy: `railway up`

Railway akan auto-detect Next.js dan setup semuanya.
