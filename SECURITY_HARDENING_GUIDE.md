# 🔒 PRODUCTION SECURITY HARDENING GUIDE
**Koperasi UMB - Security Best Practices**

---

## 🎯 Security Checklist Overview

- [ ] Strong authentication secrets
- [ ] Database security
- [ ] CORS configuration
- [ ] Rate limiting
- [ ] Security headers
- [ ] Input validation
- [ ] File upload restrictions
- [ ] Logging & monitoring
- [ ] Regular updates
- [ ] Backup encryption

---

## 1️⃣ AUTHENTICATION & SECRETS

### 1.1 Generate Strong Secrets
```bash
# Generate NEXTAUTH_SECRET (min 32 characters)
openssl rand -base64 32

# Generate database passwords
openssl rand -base64 24

# Generate API keys
openssl rand -hex 32
```

### 1.2 Update .env.production
```bash
# ❌ NEVER use default/weak secrets
NEXTAUTH_SECRET="your-default-secret"  # BAD!

# ✅ Use strong random secrets
NEXTAUTH_SECRET="R3aLLy+Str0ng/R@nd0m#S3cr3t+32Ch@r$M1n"  # GOOD!

# ✅ Different password for each environment
DATABASE_URL="mysql://user:PROD_PASSWORD@localhost:3306/db"  # Production
DATABASE_URL="mysql://user:DEV_PASSWORD@localhost:3306/db"   # Development
```

### 1.3 Password Policy
```typescript
// lib/password-policy.ts
export const PASSWORD_REQUIREMENTS = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxAge: 90, // days
}

export function validatePassword(password: string): boolean {
  if (password.length < PASSWORD_REQUIREMENTS.minLength) return false
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) return false
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) return false
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) return false
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*]/.test(password)) return false
  return true
}
```

---

## 2️⃣ DATABASE SECURITY

### 2.1 MySQL Hardening
```sql
-- Remove anonymous users
DELETE FROM mysql.user WHERE User='';

-- Remove remote root login
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

-- Create limited privilege user
CREATE USER 'koperasi_app'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE ON koperasi_umb.* TO 'koperasi_app'@'localhost';
FLUSH PRIVILEGES;

-- Disable LOAD DATA LOCAL INFILE
SET GLOBAL local_infile = 0;
```

### 2.2 Connection Security
```bash
# docker-compose.production.yml
services:
  mysql:
    ports:
      - "127.0.0.1:3306:3306"  # ✅ Bind to localhost only
      # NOT: - "3306:3306"      # ❌ Exposed to internet!
    
    environment:
      # ✅ Strong passwords
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
```

### 2.3 Backup Encryption
```bash
#!/bin/bash
# Encrypt backups with GPG

BACKUP_FILE="backup_$(date +%Y%m%d).sql"
ENCRYPTION_KEY="your-gpg-key-id"

# Backup and encrypt
docker exec mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} koperasi_umb | \
  gzip | \
  gpg --encrypt --recipient $ENCRYPTION_KEY > ${BACKUP_FILE}.sql.gz.gpg

# Decrypt backup
gpg --decrypt ${BACKUP_FILE}.sql.gz.gpg | gunzip | mysql -u root -p koperasi_umb
```

---

## 3️⃣ CORS & API SECURITY

### 3.1 Configure CORS
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // ✅ Whitelist specific origins only
  const allowedOrigins = [
    'https://koperasi.umb.ac.id',
    'https://www.koperasi.umb.ac.id',
  ]

  const origin = request.headers.get('origin')
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  return response
}
```

### 3.2 Rate Limiting
```typescript
// lib/rate-limit.ts
import { NextRequest, NextResponse } from 'next/server'

const rateLimit = new Map<string, { count: number; resetTime: number }>()

export function rateLimitMiddleware(
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
) {
  return (request: NextRequest) => {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    
    const record = rateLimit.get(ip)
    
    if (!record || now > record.resetTime) {
      rateLimit.set(ip, { count: 1, resetTime: now + windowMs })
      return null // Allow
    }
    
    if (record.count >= maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
    
    record.count++
    return null // Allow
  }
}

// Usage in API route
export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimitMiddleware(10, 60000)(request)
  if (rateLimitResponse) return rateLimitResponse
  
  // Process request...
}
```

### 3.3 API Authentication
```typescript
// lib/api-auth.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { NextRequest, NextResponse } from 'next/server'

export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized - Authentication required' },
      { status: 401 }
    )
  }
  
  return session
}

export async function requireRole(...roles: string[]) {
  return async (request: NextRequest) => {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session
    
    if (!roles.includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      )
    }
    
    return session
  }
}
```

---

## 4️⃣ SECURITY HEADERS

### 4.1 Next.js Configuration
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Enable XSS protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Enforce HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "frame-ancestors 'self'",
            ].join('; '),
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}
```

---

## 5️⃣ INPUT VALIDATION & SANITIZATION

### 5.1 Zod Schema Validation
```typescript
// lib/validation.ts
import { z } from 'zod'

export const productSchema = z.object({
  name: z.string()
    .min(3, 'Nama minimal 3 karakter')
    .max(100, 'Nama maksimal 100 karakter')
    .regex(/^[a-zA-Z0-9\s\-]+$/, 'Nama hanya boleh huruf, angka, spasi, dan -'),
  
  sellPrice: z.number()
    .positive('Harga harus positif')
    .max(100000000, 'Harga terlalu besar'),
  
  stock: z.number()
    .int('Stock harus bilangan bulat')
    .min(0, 'Stock tidak boleh negatif'),
  
  categoryId: z.string().uuid('Category ID tidak valid'),
})

// Usage
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = productSchema.parse(body) // Throws if invalid
    
    // Process validated data...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
  }
}
```

### 5.2 SQL Injection Prevention
```typescript
// ✅ GOOD: Use Prisma (parameterized queries)
const users = await prisma.users.findMany({
  where: { email: userInput }  // Safe!
})

// ❌ BAD: Raw SQL with string concatenation
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = '${userInput}'  // DANGEROUS!
`

// ✅ GOOD: Raw SQL with parameters
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userInput}  // Safe!
`
```

### 5.3 XSS Prevention
```typescript
// React automatically escapes by default
<div>{userInput}</div>  // ✅ Safe

// ❌ DANGEROUS: dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />  // DON'T!

// ✅ If HTML needed, sanitize first
import DOMPurify from 'isomorphic-dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

---

## 6️⃣ FILE UPLOAD SECURITY

### 6.1 Validate File Types
```typescript
// lib/file-upload.ts
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf']
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function validateFile(file: File): string | null {
  // Check extension
  const ext = path.extname(file.name).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return 'Tipe file tidak diizinkan'
  }
  
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return 'Format file tidak valid'
  }
  
  // Check size
  if (file.size > MAX_FILE_SIZE) {
    return 'Ukuran file terlalu besar (max 5MB)'
  }
  
  return null // Valid
}

// Rename uploaded files (prevent path traversal)
export function safeFilename(originalName: string): string {
  const ext = path.extname(originalName)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return `${timestamp}-${random}${ext}`
}
```

### 6.2 Store Outside Web Root
```typescript
// ❌ BAD: Store in public/ (accessible via URL)
const uploadPath = path.join(process.cwd(), 'public/uploads', filename)

// ✅ GOOD: Store outside web root
const uploadPath = path.join(process.cwd(), '../uploads-private', filename)

// Serve via authenticated API
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(request)
  if (!session) return unauthorizedResponse()
  
  const filePath = path.join(process.cwd(), '../uploads-private', params.id)
  const file = await fs.readFile(filePath)
  
  return new NextResponse(file, {
    headers: { 'Content-Type': 'application/pdf' }
  })
}
```

---

## 7️⃣ LOGGING & MONITORING

### 7.1 Security Event Logging
```typescript
// lib/security-logger.ts
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function logSecurityEvent(
  event: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'UNAUTHORIZED_ACCESS' | 'SUSPICIOUS_ACTIVITY',
  userId: string | null,
  details: Record<string, any>
) {
  await prisma.audit_logs.create({
    data: {
      id: randomUUID(),
      userId,
      action: event,
      entity: 'SECURITY',
      entityId: null,
      newData: JSON.stringify(details),
    },
  })
  
  // Alert on critical events
  if (event === 'SUSPICIOUS_ACTIVITY') {
    // Send email/webhook to admin
    await sendSecurityAlert(details)
  }
}

// Usage
await logSecurityEvent('LOGIN_FAILED', null, {
  email: attempt.email,
  ip: request.ip,
  timestamp: new Date().toISOString(),
})
```

### 7.2 Monitor Failed Login Attempts
```typescript
// lib/brute-force-protection.ts
const failedAttempts = new Map<string, number>()

export function checkBruteForce(identifier: string): boolean {
  const attempts = failedAttempts.get(identifier) || 0
  
  if (attempts >= 5) {
    return false // Blocked
  }
  
  return true // Allowed
}

export function recordFailedAttempt(identifier: string) {
  const attempts = (failedAttempts.get(identifier) || 0) + 1
  failedAttempts.set(identifier, attempts)
  
  // Auto-clear after 15 minutes
  setTimeout(() => {
    failedAttempts.delete(identifier)
  }, 15 * 60 * 1000)
}
```

---

## 8️⃣ REGULAR MAINTENANCE

### 8.1 Update Dependencies
```bash
# Check outdated packages
npm outdated

# Update to latest compatible versions
npm update

# Update to latest (including breaking changes)
npm install package@latest

# Audit security vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

### 8.2 Security Scanning
```bash
# Install security scanner
npm install -g snyk

# Login
snyk auth

# Scan project
snyk test

# Monitor continuously
snyk monitor
```

---

## ✅ PRODUCTION SECURITY CHECKLIST

### Before Deployment
- [ ] All secrets changed from defaults
- [ ] Strong passwords (min 12 chars, mixed case, numbers, symbols)
- [ ] Database only accessible from localhost
- [ ] CORS configured for specific origins
- [ ] Rate limiting enabled on auth endpoints
- [ ] File upload validation implemented
- [ ] Security headers configured
- [ ] HTTPS enforced (HSTS)
- [ ] CSP configured
- [ ] Input validation on all forms
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS prevention (React auto-escaping)
- [ ] Audit logging enabled
- [ ] Error messages don't leak sensitive data
- [ ] Dependencies updated to latest secure versions

### After Deployment
- [ ] SSL certificate valid (A+ on SSL Labs)
- [ ] Firewall configured (UFW)
- [ ] Automated backups running
- [ ] Monitoring and alerting setup
- [ ] Regular security audits scheduled
- [ ] Incident response plan documented
- [ ] Access logs reviewed regularly
- [ ] Failed login attempts monitored

---

## 🚨 INCIDENT RESPONSE PLAN

### If Security Breach Detected:

1. **Immediate Actions**
   ```bash
   # Stop services
   docker compose -f docker-compose.production.yml down
   
   # Block suspicious IPs
   sudo ufw deny from <malicious-ip>
   ```

2. **Investigate**
   - Check audit logs
   - Review access logs
   - Identify attack vector

3. **Containment**
   - Change all passwords
   - Rotate secrets
   - Revoke compromised sessions

4. **Recovery**
   - Restore from backup if needed
   - Apply security patches
   - Restart services

5. **Post-Incident**
   - Document incident
   - Update security measures
   - Train team

---

**Security Contact**: aegner@umb.ac.id  
**Last Updated**: November 6, 2025  
**Review Frequency**: Monthly

🔒 **STAY SECURE!**
