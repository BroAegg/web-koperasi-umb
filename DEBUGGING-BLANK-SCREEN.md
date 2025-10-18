# 🐛 DEBUGGING BLANK WHITE SCREEN - Day 14

**Issue:** Dashboard super admin dan supplier page menampilkan blank putih  
**Status:** 🔍 DEBUGGING MODE ACTIVE  
**Commit:** 9216cfc

---

## 🔧 Changes Made for Debugging

### Added Extensive Console Logging

Saya sudah menambahkan console.log di semua tempat krusial untuk men-debug blank screen issue:

#### Dashboard Page (`app/koperasi/dashboard/page.tsx`)
```javascript
[Dashboard] useEffect triggered
[Dashboard] authLoading: true/false
[Dashboard] user: { ...user data... }
[Dashboard] user role: SUPER_ADMIN/ADMIN
[Dashboard] Fetching SUPER_ADMIN dashboard
[Dashboard] Super admin stats response: { ...data... }
[Dashboard] Rendering SUPER_ADMIN dashboard
[Dashboard] Showing loading state
[Dashboard] No user, showing error
```

#### Supplier Page (`app/koperasi/supplier/page.tsx`)
```javascript
[Supplier Dashboard] Component mounted
[Supplier Dashboard] Token exists: true/false
[Supplier Dashboard] Fetching user info...
[Supplier Dashboard] Auth response: { ...data... }
[Supplier Dashboard] User is supplier: { ...data... }
[Supplier Dashboard] Fetching supplier profile...
```

---

## 🧪 CARA DEBUG (PENTING!)

### Step 1: Buka Browser Console
1. Buka browser (Chrome/Edge/Firefox)
2. Tekan **F12** untuk buka Developer Tools
3. Click tab **Console**
4. **JANGAN tutup console!**

### Step 2: Test Super Admin Login
1. Clear console (click 🚫 icon di console)
2. Go to: http://localhost:3000/login
3. Login dengan:
   ```
   Email: superadmin@koperasi.com
   Password: Password123!
   ```
4. **LIHAT CONSOLE!** Anda harus lihat messages seperti:
   ```
   [Dashboard] useEffect triggered
   [Dashboard] authLoading: false
   [Dashboard] user: {id: "...", email: "superadmin@koperasi.com", role: "SUPER_ADMIN"}
   [Dashboard] Fetching SUPER_ADMIN dashboard
   [Dashboard] Super admin stats response: {totalSuppliers: 3, ...}
   [Dashboard] Rendering SUPER_ADMIN dashboard
   ```

5. **Jika muncul blank putih, screenshot console logs dan kasih tahu saya!**

### Step 3: Test Supplier Login
1. Logout
2. Clear console
3. Login dengan:
   ```
   Email: supplier@test.com
   Password: Password123!
   ```
4. **LIHAT CONSOLE!** Anda harus lihat:
   ```
   [Supplier Dashboard] Component mounted
   [Supplier Dashboard] Token exists: true
   [Supplier Dashboard] Fetching user info...
   [Supplier Dashboard] Auth response: {success: true, data: {...}}
   [Supplier Dashboard] User is supplier: {...}
   ```

5. **Jika blank, screenshot console!**

---

## 🔍 What to Look For

### Scenario 1: Auth Failure
**Console shows:**
```
[Dashboard] user: null
[Dashboard] No user, showing error
```
**Meaning:** Authentication failed, token invalid
**Solution:** Need to check /api/auth/me response

### Scenario 2: Infinite Loading
**Console shows:**
```
[Dashboard] Showing loading state - loading: true authLoading: true
```
(repeating forever)
**Meaning:** Component stuck in loading state
**Solution:** Need to check why loading never becomes false

### Scenario 3: API Error
**Console shows:**
```
[Dashboard] Super admin stats response: {error: "..."}
Failed to fetch super admin stats: ...
```
**Meaning:** API call failed
**Solution:** Need to check API endpoint

### Scenario 4: No Data
**Console shows:**
```
[Dashboard] Rendering SUPER_ADMIN dashboard
[Dashboard] superAdminStats: undefined
```
**Meaning:** Data not loaded yet but trying to render
**Solution:** Need to add loading check

---

## 📸 What I Need from You

**Ketika muncul blank putih, please provide:**

1. **Screenshot browser console** (full console, jangan di-crop)
2. **Screenshot Network tab** (F12 → Network → filter by "dashboard" or "supplier")
3. **Tell me:**
   - Which user you login as (superadmin or supplier)
   - What was the last log message in console
   - Any red errors in console

**Example Good Report:**
```
Login sebagai: superadmin@koperasi.com
Hasil: Blank putih

Console logs terakhir:
[Dashboard] useEffect triggered
[Dashboard] authLoading: true
[Dashboard] Showing loading state - loading: true authLoading: true

Errors:
(tidak ada error merah)

Network:
- /api/auth/me: 200 OK
- /api/super-admin/dashboard: (tidak ada request)
```

---

## 🎯 Quick Tests

### Test 1: Check if Server Running
Open: http://localhost:3000/login
**Expected:** Login page loads (NOT blank)

### Test 2: Check Auth API
1. Login as super admin
2. Open console
3. Type: `localStorage.getItem('token')`
4. **Expected:** Shows long token string (not null)

### Test 3: Manual API Test
1. Login and copy token from localStorage
2. In console, type:
```javascript
fetch('/api/super-admin/dashboard', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
})
.then(r => r.json())
.then(d => console.log('API Response:', d))
```
3. **Expected:** See data object with suppliers, members, etc.

---

## 🚀 Server Status

**Running:** http://localhost:3000  
**Commits:** 9216cfc (debug logs), ae87f4b (super admin dashboard)  
**Build:** ✅ Successful

---

## ✅ Next Steps

1. **Saya:** Wait for your console logs/screenshots
2. **You:** Test and send me console output
3. **Saya:** Analyze logs and fix root cause
4. **You:** Test again
5. **Saya:** Remove debug logs once working

---

**NOTE:** Debug logs akan saya hapus setelah masalah resolved. Ini temporary untuk diagnose masalahnya.

