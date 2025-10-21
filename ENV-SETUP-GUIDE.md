# 🔧 Environment Configuration Guide

**CRITICAL: Read this before starting development!**

---

## 🚨 Common Issue: "Blank Dashboard" or "Auth Errors"

**Root Cause**: Missing or mismatched environment variables between team members

**Symptoms**:
- ✅ Login successful but dashboard shows blank page
- ✅ API returns 401 Unauthorized randomly
- ✅ JWT token verification fails
- ✅ Database connection errors

**Solution**: Ensure `.env` file matches team configuration!

---

## ✅ Initial Setup (New Team Member)

### Step 1: Copy Environment Template
```bash
cp .env.example .env
```

### Step 2: Update `.env` with YOUR Configuration

```properties
# ================================
# DATABASE CONFIGURATION
# ================================
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/koperasi_dev?schema=public"

# ================================
# AUTHENTICATION & SECURITY
# ================================
JWT_SECRET="dev-secret-key-koperasi-umb-2025-change-in-production"

# ================================
# APPLICATION ENVIRONMENT
# ================================
NODE_ENV="development"
```

### Step 3: Create Database
```bash
# Using psql:
psql -U postgres
CREATE DATABASE koperasi_dev;
\q

# Or using pgAdmin: Create new database named "koperasi_dev"
```

### Step 4: Run Migrations & Seed
```bash
npx prisma migrate dev
npx prisma db seed
```

### Step 5: Start Development Server
```bash
npm run dev
```

---

## 🔐 Environment Variables Explained

### DATABASE_URL
**What**: PostgreSQL connection string  
**Format**: `postgresql://[user]:[password]@[host]:[port]/[database]?schema=public`  
**Why `?schema=public` needed**: Prisma requires explicit schema name  
**Team Standard**: Database name should be `koperasi_dev` for development

**Examples**:
```bash
# Local development (default PostgreSQL):
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/koperasi_dev?schema=public"

# Local development (custom user):
DATABASE_URL="postgresql://myuser:mypass@localhost:5432/koperasi_dev?schema=public"

# Production (example):
DATABASE_URL="postgresql://produser:strongpass@prod-db.com:5432/koperasi_umb?schema=public"
```

### JWT_SECRET
**What**: Secret key for JWT token signing and verification  
**Why Critical**: All team members MUST use the SAME value in development!  
**Team Standard**: `dev-secret-key-koperasi-umb-2025-change-in-production`

**Impact if Mismatched**:
- ❌ User A logs in → gets JWT token signed with "secret-1"
- ❌ User B's API tries to verify token with "secret-2"
- ❌ Result: Token invalid, auth fails, dashboard blank

**Production**: Generate unique secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### NODE_ENV
**What**: Application environment mode  
**Values**: `development` | `production` | `test`  
**Team Standard**: `development` for local development

**Behavior**:
- `development`: Hot reload, detailed errors, debug logs
- `production`: Optimized, minimal logs, security hardened

---

## 🔄 Syncing Environment with Team

### When Pulling Latest Code

**ALWAYS check if `.env.example` changed:**
```bash
git pull origin main
git diff HEAD~1 .env.example
```

**If `.env.example` has new variables:**
1. Check what was added
2. Update your local `.env` file
3. Ask team in chat: "What value should I use for [NEW_VARIABLE]?"

### When Adding New Environment Variable

**Process**:
1. Add to your local `.env`:
   ```properties
   NEW_FEATURE_API_KEY="your-api-key"
   ```

2. Add to `.env.example` with placeholder:
   ```properties
   # New Feature API Key (get from https://example.com/api)
   NEW_FEATURE_API_KEY="your-api-key-here"
   ```

3. Document in this file (ENV-SETUP-GUIDE.md)

4. Commit `.env.example` (NEVER commit `.env`!)

5. Notify team:
   - "Hey team, added NEW_FEATURE_API_KEY to .env.example"
   - "You need to get API key from https://example.com/api"
   - "Add to your local .env and restart server"

---

## ⚠️ Security Best Practices

### DO ✅
- ✅ Keep `.env` in `.gitignore` (already done)
- ✅ Use `.env.example` for documentation
- ✅ Use same `JWT_SECRET` for development team
- ✅ Change `JWT_SECRET` in production (unique per environment)
- ✅ Use strong database passwords in production
- ✅ Share development credentials via secure channel (not public chat)

### DON'T ❌
- ❌ NEVER commit `.env` to git
- ❌ NEVER put production credentials in `.env.example`
- ❌ NEVER share production `.env` via email/chat
- ❌ NEVER use development credentials in production
- ❌ NEVER hardcode secrets in source code

---

## 🐛 Troubleshooting

### Issue: "Error: connect ECONNREFUSED"
**Cause**: PostgreSQL not running  
**Fix**: Start PostgreSQL service
```bash
# Windows (services.msc):
Start "postgresql-x64-[version]"

# Linux/Mac:
sudo service postgresql start
```

### Issue: "Error: password authentication failed"
**Cause**: Wrong password in DATABASE_URL  
**Fix**: Update DATABASE_URL with correct password

### Issue: "JWT malformed" or "invalid signature"
**Cause**: Team members using different JWT_SECRET  
**Fix**: 
1. Check `.env.example` for correct value
2. Update local `.env` to match
3. Clear browser localStorage
4. Login again

### Issue: "Prisma schema not found"
**Cause**: Wrong working directory  
**Fix**: Always run commands from `web-koperasi-umb/` folder
```bash
cd web-koperasi-umb
npx prisma migrate dev
```

### Issue: "Dashboard blank after login"
**Possible Causes**:
1. ❌ Missing `JWT_SECRET` in `.env`
2. ❌ Mismatched `JWT_SECRET` between team members
3. ❌ Old browser cache/localStorage
4. ❌ API returning 401 errors (check browser console)

**Fix**:
1. Verify `.env` has all required variables
2. Clear browser localStorage: `localStorage.clear()`
3. Hard refresh: Ctrl+Shift+R
4. Login again

---

## 📋 Checklist: New Developer Onboarding

Before first commit:

- [ ] Copied `.env.example` to `.env`
- [ ] Updated `DATABASE_URL` with my PostgreSQL password
- [ ] Verified `JWT_SECRET` matches team standard
- [ ] Created `koperasi_dev` database
- [ ] Ran `npx prisma migrate dev` successfully
- [ ] Ran `npx prisma db seed` successfully
- [ ] Started `npm run dev` without errors
- [ ] Logged in as admin@koperasi.com successfully
- [ ] Dashboard loads without blank screen
- [ ] Read `PRISMA-NAMING-CONVENTIONS.md`
- [ ] Joined team chat for environment questions

---

## 🔗 Related Documentation

- [PRISMA-NAMING-CONVENTIONS.md](./PRISMA-NAMING-CONVENTIONS.md) - Prisma model naming guide
- [README.md](./README.md) - Project overview and setup
- [.env.example](./.env.example) - Environment template

---

**Last Updated**: Day 14 (October 18, 2025)  
**Maintainer**: Development Team  
**Questions?**: Ask in team chat before making changes!
