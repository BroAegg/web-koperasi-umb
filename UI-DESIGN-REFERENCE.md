# 🎨 UI DESIGN REFERENCE - Kiblat dari Project Lama

**Purpose:** Dokumentasi design yang harus dipertahankan dari project lama  
**Source:** Super Admin & Developer dashboard  
**Target:** New Copilot agent untuk rebuild  

---

## 📸 DESIGN SCREENSHOTS & COMPONENTS

### 1. SUPER ADMIN DASHBOARD
**File Reference:** `app/koperasi/super-admin-dashboard/page.tsx`

#### Layout Structure:
```
┌─────────────────────────────────────────────────┐
│  Header: "Dashboard Super Admin"                │
│  Subtitle: "Kelola dan monitor seluruh sistem"  │
├─────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Suppliers│  │ Products │  │  Users   │      │
│  │  Icon    │  │  Icon    │  │  Icon    │      │
│  │   123    │  │   456    │  │   789    │      │
│  │  Total   │  │  Total   │  │  Total   │      │
│  └──────────┘  └──────────┘  └──────────┘      │
├─────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │Financial │  │Inventory │  │ Activity │      │
│  │  Icon    │  │  Icon    │  │  Icon    │      │
│  │Rp 1.5M   │  │ 234 items│  │ 1.2K logs│      │
│  │  Status  │  │  Status  │  │  Status  │      │
│  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────┘
```

#### Component Specifications:

**Stats Card Pattern:**
```typescript
<Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
  <CardHeader>
    <div className="flex items-center justify-between">
      <div>
        <CardTitle className="text-2xl font-bold text-white">
          {value}
        </CardTitle>
        <p className="text-blue-100 text-sm mt-1">
          {label}
        </p>
      </div>
      <Icon className="h-10 w-10 text-white/80" />
    </div>
  </CardHeader>
  <CardContent>
    <div className="flex items-center text-sm text-blue-100">
      <TrendingUp className="h-4 w-4 mr-1" />
      <span>{trend}</span>
    </div>
  </CardContent>
</Card>
```

#### Color Gradients:
- **Suppliers:** `from-blue-500 to-blue-600`
- **Products:** `from-green-500 to-green-600`
- **Users:** `from-purple-500 to-purple-600`
- **Financial:** `from-emerald-500 to-emerald-600`
- **Inventory:** `from-orange-500 to-orange-600`
- **Activity:** `from-pink-500 to-pink-600`

#### Icons (Lucide React):
- Suppliers: `Users`
- Products: `Package`
- Users: `UserCog`
- Financial: `DollarSign` or `Wallet`
- Inventory: `Box`
- Activity: `Activity`

---

### 2. DEVELOPER DASHBOARD
**File Reference:** `app/koperasi/developer-dashboard/page.tsx`

#### Layout Structure:
```
┌─────────────────────────────────────────────────┐
│  Header: "Developer Dashboard"                  │
│  Toggle: [Developer Mode ON/OFF]                │
├─────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  System  │  │   API    │  │ Database │      │
│  │  Status  │  │ Response │  │  Status  │      │
│  │   🟢     │  │  125ms   │  │   🟢     │      │
│  └──────────┘  └──────────┘  └──────────┘      │
├─────────────────────────────────────────────────┤
│  Recent Activity Logs (Table)                   │
│  ┌─────────┬──────────┬──────────┬──────────┐  │
│  │ Time    │ User     │ Action   │ Module   │  │
│  ├─────────┼──────────┼──────────┼──────────┤  │
│  │ 10:30   │ Admin    │ CREATE   │ Product  │  │
│  │ 10:25   │ Kasir    │ UPDATE   │ POS      │  │
│  └─────────┴──────────┴──────────┴──────────┘  │
└─────────────────────────────────────────────────┘
```

#### Developer Toolbar:
```typescript
<div className="fixed bottom-4 right-4 z-50">
  <Button
    variant="outline"
    className="bg-black text-white border-gray-700"
    onClick={toggleDeveloperMode}
  >
    <Code className="h-4 w-4 mr-2" />
    Developer Mode: {isDeveloperMode ? 'ON' : 'OFF'}
  </Button>
</div>
```

#### Activity Logs Table:
```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Waktu</TableHead>
      <TableHead>User</TableHead>
      <TableHead>Role</TableHead>
      <TableHead>Action</TableHead>
      <TableHead>Module</TableHead>
      <TableHead>Description</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {logs.map((log) => (
      <TableRow key={log.id}>
        <TableCell>{formatDate(log.created_at)}</TableCell>
        <TableCell>{log.user.name}</TableCell>
        <TableCell>
          <Badge variant={getRoleBadgeVariant(log.userRole)}>
            {log.userRole}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge variant={getActionBadgeVariant(log.action)}>
            {log.action}
          </Badge>
        </TableCell>
        <TableCell>{log.module}</TableCell>
        <TableCell className="max-w-md truncate">
          {log.description}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

### 3. FINANCIAL PAGE
**File Reference:** `app/koperasi/financial/page.tsx`

#### Layout Structure:
```
┌─────────────────────────────────────────────────────────┐
│  Header: "Keuangan"                                     │
│  Period Selector: [Hari Ini ▾] [📅 Custom]             │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │     SALDO TERSEDIA (Vertical, Centered)         │   │
│  │              🐷 PiggyBank Icon                   │   │
│  │                                                  │   │
│  │             Rp 141.500                          │   │
│  │             ✅ Surplus                           │   │
│  │                                                  │   │
│  │  ┌─────────────────┬─────────────────┐         │   │
│  │  │ 🔵 Toko         │ 🟣 Titipan      │         │   │
│  │  │ Rp 134.000      │ Rp 7.500        │         │   │
│  │  └─────────────────┴─────────────────┘         │   │
│  │                                                  │   │
│  │  Data periode: Hari Ini                         │   │
│  │  27 transaksi periode ini                       │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │  MUTASI      │  │   MUTASI     │  │  SELISIH    │  │
│  │  MASUK       │  │   KELUAR     │  │  NET CASH   │  │
│  │  Rp 265.000  │  │  Rp 67.500   │  │ Rp 197.500  │  │
│  │  Cash In     │  │  Cash Out    │  │ Net Flow    │  │
│  └──────────────┘  └──────────────┘  └─────────────┘  │
├─────────────────────────────────────────────────────────┤
│  Financial Chart (Recharts Line Chart)                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │                       📈                         │   │
│  │                                                  │   │
│  │    Line chart showing trend                     │   │
│  │    X-axis: Dates, Y-axis: Amount                │   │
│  │                                                  │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  Transaction Table                                      │
│  [Search] [Filter: All ▾] [Export CSV]                 │
│  ┌──────┬──────────┬─────────┬────────┬──────────┐    │
│  │ Time │ Deskripsi│ Category│ Amount │ Supplier │    │
│  ├──────┼──────────┼─────────┼────────┼──────────┤    │
│  │10:30 │ Penjualan│ SALES   │ 50.000 │ Toko     │    │
│  │10:25 │ Pembelian│ PURCHASE│-25.000 │ Supplier │    │
│  └──────┴──────────┴─────────┴────────┴──────────┘    │
│  [← Prev]  Page 1 of 5  [Next →]                       │
└─────────────────────────────────────────────────────────┘
```

#### Saldo Tersedia Card (IMPORTANT - Keep This Design!):
```typescript
<Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 max-w-md">
  <CardContent className="pt-6 pb-4">
    {/* Icon */}
    <div className="flex justify-center mb-4">
      <div className="bg-green-500 p-4 rounded-2xl">
        <PiggyBank className="h-8 w-8 text-white" />
      </div>
    </div>

    {/* Title */}
    <div className="text-center mb-2">
      <h3 className="text-sm font-medium text-green-800">
        SALDO TERSEDIA
      </h3>
      <p className="text-xs text-green-600">
        27 transaksi periode ini
      </p>
    </div>

    {/* Amount (Large, Centered) */}
    <div className="text-center mb-3">
      <p className="text-4xl font-bold text-green-900">
        Rp 141.500
      </p>
    </div>

    {/* Status Badge */}
    <div className="flex justify-center mb-4">
      <Badge className="bg-green-500 text-white">
        <TrendingUp className="h-3 w-3 mr-1" />
        Surplus
      </Badge>
    </div>

    {/* Breakdown Cards */}
    <div className="space-y-2 mb-4">
      {/* Toko */}
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-green-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-sm font-medium text-gray-700">Toko</span>
          </div>
          <span className="text-sm font-bold text-gray-900">
            Rp 134.000
          </span>
        </div>
      </div>

      {/* Titipan */}
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-green-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full" />
            <span className="text-sm font-medium text-gray-700">Titipan</span>
          </div>
          <span className="text-sm font-bold text-gray-900">
            Rp 7.500
          </span>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="text-center pt-3 border-t border-green-200">
      <p className="text-xs text-green-700">
        Data periode: <span className="font-semibold">Hari Ini</span>
      </p>
    </div>
  </CardContent>
</Card>
```

#### Metrics Cards:
```typescript
{/* Mutasi Masuk - Green */}
<Card className="bg-white border-2 border-green-200">
  <CardHeader className="pb-3">
    <div className="flex items-center justify-between">
      <CardTitle className="text-sm font-medium text-gray-700">
        MUTASI MASUK
      </CardTitle>
      <ArrowUp className="h-5 w-5 text-green-500" />
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold text-green-600">
      Rp 265.000
    </div>
    <p className="text-xs text-gray-500 mt-1">
      Cash In periode ini
    </p>
  </CardContent>
</Card>

{/* Mutasi Keluar - Red */}
<Card className="bg-white border-2 border-red-200">
  <CardHeader className="pb-3">
    <div className="flex items-center justify-between">
      <CardTitle className="text-sm font-medium text-gray-700">
        MUTASI KELUAR
      </CardTitle>
      <ArrowDown className="h-5 w-5 text-red-500" />
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold text-red-600">
      Rp 67.500
    </div>
    <p className="text-xs text-gray-500 mt-1">
      Cash Out periode ini
    </p>
  </CardContent>
</Card>

{/* Selisih - Blue */}
<Card className="bg-white border-2 border-blue-200">
  <CardHeader className="pb-3">
    <div className="flex items-center justify-between">
      <CardTitle className="text-sm font-medium text-gray-700">
        SELISIH
      </CardTitle>
      <DollarSign className="h-5 w-5 text-blue-500" />
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold text-blue-600">
      Rp 197.500
    </div>
    <p className="text-xs text-gray-500 mt-1">
      Net Cash Flow
    </p>
  </CardContent>
</Card>
```

#### Financial Chart (Recharts):
```typescript
<Card>
  <CardHeader>
    <CardTitle>Grafik Keuangan</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={(date) => format(date, 'dd MMM')}
        />
        <YAxis 
          tickFormatter={(value) => formatCurrency(value)}
        />
        <Tooltip 
          content={<CustomTooltip />}
          formatter={(value) => formatCurrency(value)}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="cashIn" 
          stroke="#10b981" 
          strokeWidth={2}
          name="Pemasukan"
        />
        <Line 
          type="monotone" 
          dataKey="cashOut" 
          stroke="#ef4444" 
          strokeWidth={2}
          name="Pengeluaran"
        />
        <Line 
          type="monotone" 
          dataKey="balance" 
          stroke="#3b82f6" 
          strokeWidth={2}
          name="Saldo"
        />
      </LineChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
```

---

## 🎨 DESIGN TOKENS

### Typography:
```css
--font-family: 'Inter', sans-serif;

/* Headings */
--text-4xl: 36px / 1.2 / 900
--text-3xl: 30px / 1.2 / 800
--text-2xl: 24px / 1.3 / 700
--text-xl: 20px / 1.4 / 600
--text-lg: 18px / 1.5 / 500

/* Body */
--text-base: 16px / 1.5 / 400
--text-sm: 14px / 1.5 / 400
--text-xs: 12px / 1.5 / 400
```

### Colors:
```css
/* Primary Brand Colors */
--primary-50: #eff6ff
--primary-100: #dbeafe
--primary-500: #3b82f6
--primary-600: #2563eb
--primary-700: #1d4ed8

/* Success */
--success-50: #f0fdf4
--success-100: #dcfce7
--success-500: #22c55e
--success-600: #16a34a

/* Warning */
--warning-50: #fefce8
--warning-100: #fef3c7
--warning-500: #eab308
--warning-600: #ca8a04

/* Error */
--error-50: #fef2f2
--error-100: #fee2e2
--error-500: #ef4444
--error-600: #dc2626

/* Neutral */
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-300: #d1d5db
--gray-400: #9ca3af
--gray-500: #6b7280
--gray-600: #4b5563
--gray-700: #374151
--gray-800: #1f2937
--gray-900: #111827
```

### Spacing:
```css
--space-1: 0.25rem  /* 4px */
--space-2: 0.5rem   /* 8px */
--space-3: 0.75rem  /* 12px */
--space-4: 1rem     /* 16px */
--space-5: 1.25rem  /* 20px */
--space-6: 1.5rem   /* 24px */
--space-8: 2rem     /* 32px */
--space-10: 2.5rem  /* 40px */
--space-12: 3rem    /* 48px */
```

### Border Radius:
```css
--radius-sm: 0.375rem   /* 6px */
--radius-md: 0.5rem     /* 8px */
--radius-lg: 0.75rem    /* 12px */
--radius-xl: 1rem       /* 16px */
--radius-2xl: 1.5rem    /* 24px */
--radius-full: 9999px
```

### Shadows:
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1)
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
/* Mobile First */
/* Default: 0px - 639px (mobile) */

/* Tablet */
@media (min-width: 640px) { /* sm */ }

/* Laptop */
@media (min-width: 1024px) { /* lg */ }

/* Desktop */
@media (min-width: 1280px) { /* xl */ }

/* Large Desktop */
@media (min-width: 1536px) { /* 2xl */ }
```

### Responsive Card Grid:
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards here */}
</div>
```

---

## ♿ ACCESSIBILITY REQUIREMENTS

### Must Have:
- ✅ Semantic HTML (header, nav, main, footer, section)
- ✅ ARIA labels for icons
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Focus visible indicators
- ✅ Color contrast ratio > 4.5:1 (text)
- ✅ Color contrast ratio > 3:1 (UI components)
- ✅ Alt text for images
- ✅ Form labels associated with inputs
- ✅ Error messages associated with fields
- ✅ Skip to main content link

### Example:
```typescript
<button
  aria-label="Close dialog"
  className="focus:outline-none focus:ring-2 focus:ring-blue-500"
  onClick={onClose}
>
  <X className="h-5 w-5" />
</button>
```

---

## 🎯 ANIMATION GUIDELINES

### Use Subtle Animations:
```typescript
// Hover effects
<Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">

// Loading states
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4" />
</div>

// Page transitions
<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
  {content}
</div>
```

### Animation Durations:
- **Fast:** 150ms (hover, focus)
- **Normal:** 200-300ms (transitions)
- **Slow:** 500ms (page transitions)

---

## 📋 COMPONENT CHECKLIST

When creating new components, ensure:

- [ ] Follows design tokens (colors, spacing, typography)
- [ ] Responsive (works on mobile, tablet, desktop)
- [ ] Accessible (ARIA, keyboard nav, contrast)
- [ ] Type-safe (TypeScript interfaces)
- [ ] Documented (JSDoc comments)
- [ ] Loading state handled
- [ ] Error state handled
- [ ] Empty state handled
- [ ] Tested (unit + visual)

---

## 🖼️ EXAMPLE IMPLEMENTATIONS

### Dashboard Stats Card (Reusable):
```typescript
interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  gradient: string; // e.g., "from-blue-500 to-blue-600"
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  gradient,
}: StatsCardProps) {
  return (
    <Card className={cn('bg-gradient-to-br text-white', gradient)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-white">
              {value}
            </CardTitle>
            <p className="text-white/80 text-sm mt-1">
              {title}
            </p>
          </div>
          <Icon className="h-10 w-10 text-white/80" />
        </div>
      </CardHeader>
      {(subtitle || trend) && (
        <CardContent>
          <div className="flex items-center justify-between text-sm text-white/80">
            {subtitle && <span>{subtitle}</span>}
            {trend && (
              <div className={cn(
                'flex items-center gap-1',
                trend.isPositive ? 'text-green-200' : 'text-red-200'
              )}>
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{trend.value}</span>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Usage:
<StatsCard
  title="Total Suppliers"
  value={123}
  subtitle="Active suppliers"
  icon={Users}
  trend={{ value: '+12% dari bulan lalu', isPositive: true }}
  gradient="from-blue-500 to-blue-600"
/>
```

---

**NOTE FOR NEW COPILOT:**
1. Study these designs carefully
2. Preserve the visual language
3. Improve where needed (performance, accessibility)
4. But keep the "look and feel" the same
5. Users love the current design - don't break their experience!

**Last Updated:** 22 Oktober 2025  
**Maintainers:** Aegner + Reyvan
