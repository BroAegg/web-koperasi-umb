# UAT DEPLOYMENT GUIDE - Koperasi UMB

## 🚀 Quick Deploy ke Vercel (Recommended)

### Prerequisites
1. ✅ Akun GitHub (push code ke repo)
2. ✅ Akun Vercel (gratis di vercel.com)
3. ✅ Database MySQL cloud (PlanetScale/Railway)

---

## Step 1: Setup Database Cloud

### Option A: PlanetScale (Recommended - Gratis)
1. Daftar di https://planetscale.com
2. Create new database: `koperasi-umb-uat`
3. Get connection string:
   ```
   mysql://[username]:[password]@[host]/koperasi-umb-uat?sslaccept=strict
   ```
4. Copy connection string untuk nanti

### Option B: Railway (Alternative)
1. Daftar di https://railway.app
2. New Project → Add MySQL
3. Copy `DATABASE_URL` dari settings

---

## Step 2: Push Code ke GitHub

```bash
# Di folder project
git init
git add .
git commit -m "Initial commit for UAT deployment"

# Create repo di GitHub, lalu:
git remote add origin https://github.com/[username]/web-koperasi-umb.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy ke Vercel

### Via Dashboard (Easy):
1. Login ke https://vercel.com
2. Click **"Add New Project"**
3. Import GitHub repository `web-koperasi-umb`
4. Configure:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. **Environment Variables** (PENTING!):
   ```
   DATABASE_URL = [connection string dari Step 1]
   NEXTAUTH_URL = https://[your-project].vercel.app
   NEXTAUTH_SECRET = [generate random 32+ chars string]
   NODE_ENV = production
   ```

6. Click **Deploy**

### Via CLI (Advanced):
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts, set env variables
```

---

## Step 4: Setup Database Schema

Setelah deploy berhasil:

```bash
# Local terminal, update .env dengan DATABASE_URL cloud
DATABASE_URL="[cloud database url]"

# Push schema ke cloud database
npx prisma db push

# Atau migrate jika ada migration files
npx prisma migrate deploy
```

---

## Step 5: Seed Initial Data (Optional)

Jika perlu data dummy untuk testing:

```bash
# Create seed script (jika belum ada)
# prisma/seed.ts

# Run seed
npx prisma db seed
```

---

## 🔗 Access UAT Environment

Setelah deploy selesai, Vercel akan kasih URL:
```
https://web-koperasi-umb.vercel.app
```

Atau custom domain:
```
https://uat-koperasi-umb.vercel.app
```

---

## 🔐 Environment Variables Reference

### Production UAT:
```env
# Database (PlanetScale/Railway)
DATABASE_URL="mysql://[user]:[pass]@[host]/koperasi_umb_uat?sslaccept=strict"

# NextAuth
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="[generate with: openssl rand -base64 32]"

# Environment
NODE_ENV="production"
```

### Generate NEXTAUTH_SECRET:
```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online
# https://generate-secret.vercel.app/32
```

---

## 🎯 Testing Checklist

Setelah deploy, test fitur-fitur ini:

- [ ] Login page accessible
- [ ] Login dengan akun super admin
- [ ] Dashboard loads correctly
- [ ] Kelola Supplier page works
- [ ] Simulate Supplier creates data
- [ ] PENDING_REVIEW tab shows suppliers
- [ ] Evaluate modal opens
- [ ] Star rating works
- [ ] Approve/Reject supplier works
- [ ] Database persists data

---

## 🔄 Update Deployment

Setelah push code baru ke GitHub:

```bash
git add .
git commit -m "Update feature X"
git push origin main
```

Vercel akan **auto-deploy** dalam 1-2 menit.

---

## 🐛 Troubleshooting

### Build Failed - Prisma Error:
```bash
# Ensure postinstall script exists in package.json
"postinstall": "prisma generate"
```

### Database Connection Failed:
- ✅ Check DATABASE_URL format
- ✅ Ensure SSL is enabled (PlanetScale requires `?sslaccept=strict`)
- ✅ Check database is accessible from public internet

### 500 Error on API Routes:
- Check Vercel logs: Project → Deployments → [latest] → Functions
- Verify all environment variables set correctly
- Check Prisma schema pushed to database

### Authentication Not Working:
- ✅ NEXTAUTH_URL must match deployed URL
- ✅ NEXTAUTH_SECRET must be 32+ characters
- ✅ Check users table has data

---

## 📊 Monitoring & Logs

### Vercel Dashboard:
- Real-time logs: Project → Deployments → View Function Logs
- Analytics: Project → Analytics
- Performance: Project → Speed Insights

### Database:
- PlanetScale: Dashboard → Insights (query performance)
- Railway: Project → Metrics

---

## 💰 Cost Estimate (UAT)

### Vercel:
- **Free Tier**: 
  - 100GB bandwidth/month
  - Unlimited deployments
  - 100 GB-hours serverless function execution
  - ✅ **Cukup untuk UAT**

### PlanetScale:
- **Free Tier**:
  - 1 database
  - 5GB storage
  - 1 billion row reads/month
  - ✅ **Cukup untuk UAT**

### Railway (Alternative):
- **Free Tier**: $5 credit/month
- Approximately 500 hours uptime
- ✅ **Cukup untuk UAT**

**Total Cost: $0/month** 🎉

---

## 🔒 Security Checklist

- [ ] NEXTAUTH_SECRET is strong (32+ chars random)
- [ ] DATABASE_URL uses SSL connection
- [ ] No `.env` files pushed to GitHub
- [ ] All sensitive data in Vercel Environment Variables
- [ ] Rate limiting enabled (optional, use Vercel Edge Config)

---

## 🚀 Alternative: Railway Full Stack

Jika prefer all-in-one deployment:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add MySQL service
railway add mysql

# Link to service
railway link

# Deploy
railway up
```

Railway will auto-detect Next.js and deploy with MySQL.

---

## 📝 Next Steps After UAT

1. **User Acceptance Testing** - Share URL dengan stakeholders
2. **Collect Feedback** - Fix bugs, improve UX
3. **Performance Optimization** - Based on real usage
4. **Production Deployment** - Upgrade to paid tier if needed
5. **Custom Domain** - Buy domain, connect to Vercel

---

## 🆘 Need Help?

- Vercel Docs: https://vercel.com/docs
- PlanetScale Docs: https://docs.planetscale.com
- Railway Docs: https://docs.railway.app
- Next.js Deployment: https://nextjs.org/docs/deployment

---

**Deploy Time Estimate**: 15-30 minutes (first time)

**Auto-Deploy After Setup**: 1-2 minutes per update

Good luck! 🚀
