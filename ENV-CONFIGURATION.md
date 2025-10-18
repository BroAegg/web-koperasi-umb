# 📋 Environment Variables Configuration

**File:** `.env.example`  
**Purpose:** Template untuk environment configuration  
**Status:** ✅ Complete

---

## 🔧 Environment Variables Yang Digunakan

### 1. **DATABASE_URL** (Required)
**Type:** String (PostgreSQL Connection URL)  
**Format:** `postgresql://[user]:[password]@[host]:[port]/[database]`  
**Example:** `postgresql://postgres:koperasi@localhost:5432/koperasi_umb`

**Usage:**
- Digunakan oleh Prisma untuk koneksi ke PostgreSQL
- Defined di `prisma/schema.prisma`
- Diakses oleh `lib/prisma.ts` untuk database client

**Setup:**
```bash
# 1. Install PostgreSQL
# 2. Create database
psql -U postgres
CREATE DATABASE koperasi_umb;

# 3. Update .env with your credentials
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/koperasi_umb"
```

---

### 2. **JWT_SECRET** (Required)
**Type:** String (Secret key for JWT tokens)  
**Default Fallback:** `'change_this_secret_in_env'`  
**Example:** `koperasi-umb-secret-key-2025-very-secure`

**Usage:**
- Digunakan di `lib/auth.ts` untuk sign dan verify JWT tokens
- Authentication untuk semua protected routes
- Harus unique dan secure di production

**Security:**
```bash
# Generate secure random secret:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Output example:
# a8f5f167f44f4964e6c998dee827110c03ab88e1c68ec9e5e0c8e9d5e9f5e0a8...
```

**⚠️ IMPORTANT:**
- NEVER use default value in production
- NEVER commit actual secret to git
- Change immediately if exposed

---

### 3. **NODE_ENV** (Optional)
**Type:** String (`development` | `production` | `test`)  
**Default:** `development`  
**Example:** `development`

**Usage:**
- Digunakan di `lib/prisma.ts` untuk Prisma client instantiation
- Development mode: hot reload, detailed errors, prisma studio
- Production mode: optimized, cached

**Values:**
- `development`: Local development dengan hot reload
- `production`: Production deployment, optimized
- `test`: Testing environment

---

## 📁 File Structure

```
web-koperasi-umb/
├── .env                  # ❌ NOT in git (your actual config)
├── .env.example          # ✅ IN git (template)
├── .gitignore            # Updated to allow .env.example
└── README.md
```

---

## 🚀 Setup Instructions

### First Time Setup:

1. **Copy template:**
   ```bash
   cp .env.example .env
   ```

2. **Install PostgreSQL:**
   - Download: https://www.postgresql.org/download/
   - Install and remember your password

3. **Create Database:**
   ```bash
   # Open psql
   psql -U postgres
   
   # Create database
   CREATE DATABASE koperasi_umb;
   
   # Exit
   \q
   ```

4. **Update .env file:**
   ```properties
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/koperasi_umb"
   JWT_SECRET="your-generated-secret-key"
   NODE_ENV="development"
   ```

5. **Install dependencies:**
   ```bash
   npm install
   ```

6. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

7. **Seed database:**
   ```bash
   npx prisma db seed
   ```

8. **Start development server:**
   ```bash
   npm run dev
   ```

9. **Access application:**
   - Open: http://localhost:3000
   - Login with default credentials (see below)

---

## 🔑 Default Login Credentials

**After seeding database:**

### Super Admin (Full Access)
```
Email: superadmin@koperasi.com
Password: Password123!
Access: ALL features including Supplier Management
```

### Admin (Standard Access)
```
Email: admin@koperasi.com
Password: Password123!
Access: All features EXCEPT Supplier Management
```

### Supplier (For Testing)
```
Email: supplier@test.com
Password: Password123!
Business: Warung Makan Barokah
Access: Supplier Portal
```

**⚠️ PRODUCTION WARNING:**
- Change ALL default passwords immediately!
- Use strong passwords (min 12 characters)
- Enable 2FA if possible

---

## 🔒 Security Best Practices

### DO:
- ✅ Use strong, unique passwords
- ✅ Generate random JWT_SECRET for production
- ✅ Keep .env file private (never commit)
- ✅ Use environment-specific .env files
- ✅ Rotate secrets regularly
- ✅ Use SSL/TLS for database connections in production

### DON'T:
- ❌ Use default/example values in production
- ❌ Commit .env file to git
- ❌ Share .env file publicly
- ❌ Use same credentials across environments
- ❌ Hardcode secrets in code

---

## 🌍 Environment-Specific Configurations

### Development (.env)
```properties
DATABASE_URL="postgresql://postgres:dev_password@localhost:5432/koperasi_umb_dev"
JWT_SECRET="dev-secret-key"
NODE_ENV="development"
```

### Production (.env.production)
```properties
DATABASE_URL="postgresql://prod_user:strong_password@prod-host:5432/koperasi_umb_prod"
JWT_SECRET="super-secure-random-generated-secret"
NODE_ENV="production"
```

### Testing (.env.test)
```properties
DATABASE_URL="postgresql://postgres:test_password@localhost:5432/koperasi_umb_test"
JWT_SECRET="test-secret-key"
NODE_ENV="test"
```

---

## 🐛 Troubleshooting

### Issue: "Error: P1001: Can't reach database server"
**Solution:**
1. Check PostgreSQL is running: `pg_isready`
2. Verify DATABASE_URL credentials
3. Check PostgreSQL is listening on port 5432
4. Restart PostgreSQL service

### Issue: "Error: Invalid JWT secret"
**Solution:**
1. Check JWT_SECRET is set in .env
2. Restart development server after changing .env
3. Clear browser localStorage and login again

### Issue: "Error: Environment variable not found"
**Solution:**
1. Ensure .env file exists in project root
2. Check variable names match exactly (case-sensitive)
3. Restart server after changes

---

## 📝 Adding New Environment Variables

**When adding new env vars:**

1. **Add to .env:**
   ```properties
   NEW_VAR="value"
   ```

2. **Add to .env.example:**
   ```properties
   NEW_VAR="example_value_here"
   ```

3. **Update this documentation**

4. **Commit .env.example (NOT .env)**

5. **Inform team to update their .env files**

---

## ✅ Verification Checklist

Before deployment, verify:

- [ ] .env file exists and is NOT in git
- [ ] .env.example is up to date
- [ ] All required variables are set
- [ ] DATABASE_URL points to correct database
- [ ] JWT_SECRET is unique and secure
- [ ] NODE_ENV is set correctly
- [ ] Default passwords changed
- [ ] Database migrations run successfully
- [ ] Application starts without errors

---

**Last Updated:** Day 14  
**Maintained By:** Development Team  
**Status:** 🟢 Production Ready
