# ⚡ PERFORMANCE OPTIMIZATION GUIDE
**Koperasi UMB - Production Performance Best Practices**

---

## 🎯 Performance Goals

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s  
- **Time to Interactive (TTI)**: < 3.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

---

## 1️⃣ NEXT.JS PRODUCTION CONFIGURATION

### 1.1 Update next.config.ts
```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ================================
  // PRODUCTION OPTIMIZATIONS
  // ================================
  
  // Enable React strict mode (development checks)
  reactStrictMode: true,
  
  // Compress output
  compress: true,
  
  // Generate standalone output for Docker
  output: 'standalone',
  
  // ================================
  // IMAGE OPTIMIZATION
  // ================================
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60, // Cache images for 60 seconds minimum
    dangerouslyAllowSVG: false, // Security: disable SVG
    contentDispositionType: 'attachment',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'koperasi.umb.ac.id',
      },
    ],
  },
  
  // ================================
  // CACHING & PERFORMANCE
  // ================================
  
  // Enable SWC minifier (faster than Terser)
  swcMinify: true,
  
  // Enable experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', 'recharts'],
    
    // Optimize CSS
    optimizeCss: true,
    
    // Reduce JavaScript bundle size
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // ================================
  // SECURITY HEADERS
  // ================================
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // Cache static assets
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache images
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
    ]
  },
  
  // ================================
  // WEBPACK OPTIMIZATION
  // ================================
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk for node_modules
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Common chunk for shared code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      }
    }
    
    return config
  },
  
  // ================================
  // REDIRECTS & REWRITES
  // ================================
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
```

---

## 2️⃣ DATABASE OPTIMIZATION

### 2.1 Add Indexes to Prisma Schema
```prisma
// prisma/schema.prisma

model products {
  id String @id @default(uuid())
  name String @db.VarChar(191)
  categoryId String
  supplierId String?
  
  // Add indexes for frequently queried fields
  @@index([categoryId])
  @@index([supplierId])
  @@index([isActive])
  @@index([createdAt])
  @@index([name]) // For search queries
}

model transactions {
  id String @id @default(uuid())
  userId String
  totalAmount Decimal
  createdAt DateTime @default(now())
  
  // Add composite indexes
  @@index([userId, createdAt])
  @@index([createdAt])
  @@index([paymentStatus])
}

model audit_logs {
  id String @id @default(uuid())
  userId String?
  action String
  entity String
  createdAt DateTime @default(now())
  
  // Optimize audit log queries
  @@index([userId, createdAt])
  @@index([action, createdAt])
  @@index([entity, createdAt])
}
```

### 2.2 Run Migration
```bash
npx prisma migrate dev --name add_indexes
npx prisma migrate deploy  # Production
```

### 2.3 Query Optimization
```typescript
// ❌ BAD: N+1 query problem
const categories = await prisma.categories.findMany()
for (const cat of categories) {
  const products = await prisma.products.findMany({
    where: { categoryId: cat.id }
  })
}

// ✅ GOOD: Use include/select
const categories = await prisma.categories.findMany({
  include: {
    products: {
      where: { isActive: true },
      select: { id: true, name: true }
    },
    _count: {
      select: { products: true }
    }
  }
})

// ✅ GOOD: Pagination
const products = await prisma.products.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' }
})
```

---

## 3️⃣ FRONTEND OPTIMIZATION

### 3.1 Code Splitting & Lazy Loading
```typescript
// app/koperasi/analytics/page.tsx
import dynamic from 'next/dynamic'

// ✅ Lazy load heavy components
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false, // Disable SSR for client-only components
})

// ✅ Lazy load modals
const ProductModal = dynamic(() => import('./ProductModal'))

export default function Analytics() {
  return (
    <div>
      <HeavyChart />
    </div>
  )
}
```

### 3.2 Image Optimization
```typescript
// Use Next.js Image component
import Image from 'next/image'

// ✅ GOOD: Optimized image
<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority  // For above-the-fold images
  quality={85}  // Balance quality/size
/>

// ✅ GOOD: Responsive images
<Image
  src="/product.jpg"
  alt="Product"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  style={{ objectFit: 'cover' }}
/>

// ❌ BAD: Regular <img> tag
<img src="/logo.png" alt="Logo" />  // No optimization!
```

### 3.3 Font Optimization
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'

// ✅ Load fonts optimally
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',  // Prevent invisible text
  preload: true,
  variable: '--font-inter',
})

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

### 3.4 Debounce Search Inputs
```typescript
// components/SearchInput.tsx
import { useState, useEffect } from 'react'

export function SearchInput({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('')
  
  // ✅ Debounce search to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query)
    }, 300) // Wait 300ms after user stops typing
    
    return () => clearTimeout(timer)
  }, [query, onSearch])
  
  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

### 3.5 Memoization
```typescript
// components/ProductList.tsx
import { useMemo } from 'react'

export function ProductList({ products, searchQuery }) {
  // ✅ Memoize expensive calculations
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [products, searchQuery])
  
  return (
    <ul>
      {filteredProducts.map(p => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  )
}
```

---

## 4️⃣ API OPTIMIZATION

### 4.1 Response Caching
```typescript
// app/api/categories/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const categories = await prisma.categories.findMany()
  
  const response = NextResponse.json({
    success: true,
    data: categories
  })
  
  // ✅ Cache response for 5 minutes
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=600'
  )
  
  return response
}
```

### 4.2 Data Pagination
```typescript
// app/api/products/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  
  const [products, total] = await Promise.all([
    prisma.products.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.products.count()
  ])
  
  return NextResponse.json({
    success: true,
    data: products,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  })
}
```

### 4.3 Compression
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Enable gzip compression
  response.headers.set('Accept-Encoding', 'gzip, deflate, br')
  
  return response
}
```

---

## 5️⃣ MONITORING & MEASUREMENT

### 5.1 Add Web Vitals Tracking
```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
```

### 5.2 Performance Monitoring
```typescript
// lib/performance.ts
export function measurePerformance(label: string) {
  const start = Date.now()
  
  return {
    end: () => {
      const duration = Date.now() - start
      console.log(`[Performance] ${label}: ${duration}ms`)
      
      // Log to backend if > 1 second
      if (duration > 1000) {
        fetch('/api/performance/log', {
          method: 'POST',
          body: JSON.stringify({ label, duration })
        })
      }
    }
  }
}

// Usage
const perf = measurePerformance('Fetch products')
const products = await fetchProducts()
perf.end()
```

### 5.3 Lighthouse CI
```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run audit
lhci autorun --collect.url=https://koperasi.umb.ac.id

# Add to package.json
{
  "scripts": {
    "lighthouse": "lhci autorun"
  }
}
```

---

## 6️⃣ DOCKER OPTIMIZATION

### 6.1 Multi-Stage Build
```dockerfile
# Use the production Dockerfile we created earlier
# It already includes multi-stage builds for optimization
```

### 6.2 Docker Compose Production
```yaml
# docker-compose.production.yml
services:
  app:
    restart: always
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

## ✅ PERFORMANCE CHECKLIST

### Before Deployment
- [ ] Next.js production config optimized
- [ ] Images using Next.js Image component
- [ ] Fonts loaded with next/font
- [ ] Code splitting implemented
- [ ] Database indexes added
- [ ] API responses cached
- [ ] Pagination implemented
- [ ] Search debounced
- [ ] Memoization used for expensive calculations
- [ ] Compression enabled
- [ ] Static assets cached
- [ ] Docker multi-stage build
- [ ] Resource limits configured

### After Deployment
- [ ] Lighthouse score > 90
- [ ] FCP < 1.5s
- [ ] LCP < 2.5s
- [ ] TTI < 3.5s
- [ ] CLS < 0.1
- [ ] Monitor with Web Vitals
- [ ] Regular performance audits

---

## 📊 EXPECTED PERFORMANCE

After applying all optimizations:

```
Lighthouse Scores (Target):
- Performance: 90-100
- Accessibility: 95-100
- Best Practices: 95-100
- SEO: 90-100

Web Vitals:
- FCP: 0.8-1.5s
- LCP: 1.2-2.5s
- TTI: 1.8-3.5s
- CLS: 0.01-0.1
- FID: 10-100ms

Server Response:
- API: < 200ms
- Database queries: < 50ms
- Page load: < 2s
```

---

**Performance Lead**: Aegner Billik  
**Last Updated**: November 6, 2025  
**Review Frequency**: Quarterly

⚡ **STAY FAST!**
