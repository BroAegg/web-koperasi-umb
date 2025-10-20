# 🧪 DEVELOPER DASHBOARD TESTING GUIDE

**Phase:** 1.4 - Developer Dashboard UI  
**Testing Date:** 21 Oktober 2025  
**Testers:** Reyvan & Aegner

---

## 🚀 **QUICK START**

### **Step 1: Start Development Server**

```powershell
cd "D:\Me\portfolio\Sisinfo\web-koperasi\web-koperasi-umb"
npm run dev
```

Server akan berjalan di `http://localhost:3000`

---

### **Step 2: Login as Developer**

1. Buka browser: `http://localhost:3000/login`
2. Login dengan credentials:
   ```
   Email    : reyvan.dev@koperasi-umb.com
   Password : DevSecure2025!@#
   ```
   
   **ATAU**
   
   ```
   Email    : aegner.dev@koperasi-umb.com
   Password : DevSecure2025!@#
   ```

3. ✅ **Expected Result:** Redirect ke `/koperasi/dashboard` atau `/koperasi/developer-dashboard`

---

## 📋 **TEST CASES**

### **TEST 1: Sidebar Navigation** ✅

**Steps:**
1. Setelah login, lihat sidebar kiri
2. Cari kategori "DEVELOPER TOOLS" (paling bawah)
3. Klik expand kategori

**Expected Results:**
- ✅ Kategori "DEVELOPER TOOLS" muncul
- ✅ 4 menu items terlihat:
  * 🔧 Developer Dashboard
  * 📊 Activity Logs
  * 💾 Data Management
  * 🧪 API Tester
- ✅ User info (bawah sidebar) menampilkan "Developer" label (bukan "Admin")

**Screenshot Checklist:**
- [ ] Sidebar dengan kategori DEVELOPER TOOLS expanded
- [ ] User info dengan label "Developer"

---

### **TEST 2: Developer Dashboard Access** ✅

**Steps:**
1. Dari sidebar, klik "Developer Dashboard"
2. Atau akses langsung: `http://localhost:3000/koperasi/developer-dashboard`

**Expected Results:**
- ✅ Page loads tanpa error
- ✅ Header "Developer Control Panel" muncul
- ✅ Active role card menampilkan "DEVELOPER" dengan gradient biru
- ✅ Environment badge menampilkan "DEVELOPMENT MODE" (hijau)
- ✅ 5 role buttons terlihat:
  * Switch to Admin
  * Switch to Super Admin
  * Switch to Supplier
  * Switch to User
  * Return to Developer
- ✅ Environment toggle button muncul
- ✅ 3 Quick Action cards terlihat:
  * 📊 Activity Logs
  * 💾 Data Management
  * 🧪 API Tester
- ✅ Developer tips info box muncul

**Screenshot Checklist:**
- [ ] Full dashboard view
- [ ] Active role card dengan badge DEVELOPMENT MODE
- [ ] Role switcher grid dengan 5 buttons
- [ ] Quick action cards

---

### **TEST 3: Role Switching - Switch to Admin** ✅

**Steps:**
1. Dari Developer Dashboard, klik button "Switch to Admin"
2. Tunggu loading spinner
3. Observe page reload

**Expected Results:**
- ✅ Loading spinner muncul di button
- ✅ API call ke `/api/developer/switch-role` dengan payload `{targetRole: "ADMIN"}`
- ✅ Response 200 dengan new token
- ✅ localStorage "token" di-update
- ✅ Page auto-reload
- ✅ Active role card sekarang menampilkan "ADMIN" (bukan DEVELOPER)
- ✅ Sidebar DEVELOPER TOOLS kategori mungkin hilang (karena filtered by role)

**How to Verify:**
1. Buka DevTools (F12)
2. Go to Console tab
3. Type: `localStorage.getItem('token')`
4. Copy token value
5. Go to https://jwt.io
6. Paste token di "Encoded" section
7. Check "Decoded" payload section:
   ```json
   {
     "id": "xxx",
     "role": "ADMIN",
     "developerSession": {
       "actualRole": "DEVELOPER",
       "activeRole": "ADMIN",    // ← Changed from DEVELOPER
       "isProduction": false,
       "switchedAt": "2025-10-21T..."
     }
   }
   ```

**Screenshot Checklist:**
- [ ] Console log showing successful API call
- [ ] jwt.io showing decoded token with activeRole: ADMIN
- [ ] Dashboard showing "ADMIN" in active role card

---

### **TEST 4: Role Switching - Return to Developer** ✅

**Steps:**
1. Dari state ADMIN (Test 3), navigate kembali ke Developer Dashboard
   - Akses URL langsung: `http://localhost:3000/koperasi/developer-dashboard`
   - ATAU clear localStorage dan login ulang
2. Klik button "Return to Developer"

**Expected Results:**
- ✅ API call berhasil
- ✅ Page reload
- ✅ Active role card kembali ke "DEVELOPER"
- ✅ Sidebar DEVELOPER TOOLS muncul kembali

---

### **TEST 5: Environment Toggle - Dev to Prod** ✅

**Steps:**
1. Dari Developer Dashboard (role = DEVELOPER)
2. Klik button "Switch to Production Mode"
3. Observe badge update

**Expected Results:**
- ✅ Loading spinner muncul di toggle button
- ✅ API call ke `/api/developer/toggle-environment`
- ✅ Response 200
- ✅ Environment badge berubah ke "PRODUCTION MODE" (merah)
- ✅ Badge memiliki animated pulse effect
- ✅ localStorage token updated dengan `isProduction: true`

**Database Verification:**
```sql
-- Check activity_logs table
SELECT * FROM activity_logs 
WHERE user_role = 'DEVELOPER' 
AND action = 'ENVIRONMENT_SWITCH'
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected Database Entry:**
```
id: activity-1729514400000-abc123
user_id: <developer_user_id>
user_role: DEVELOPER
action: ENVIRONMENT_SWITCH
module: DEVELOPER_TOOLS
description: Switched environment to PRODUCTION
metadata: {"isProduction": true}
is_production: true  // Always log developer actions to prod
created_at: 2025-10-21 02:00:00
```

**Screenshot Checklist:**
- [ ] Badge showing "PRODUCTION MODE" dengan warna merah
- [ ] Animated pulse effect visible
- [ ] Database query result showing activity log entry

---

### **TEST 6: Environment Toggle - Prod to Dev** ✅

**Steps:**
1. Dari PRODUCTION MODE (Test 5)
2. Klik toggle button lagi untuk kembali ke Dev

**Expected Results:**
- ✅ Badge kembali ke "DEVELOPMENT MODE" (hijau)
- ✅ Pulse animation hilang
- ✅ New activity_logs entry created

---

### **TEST 7: Quick Action Navigation** ✅

**Steps:**
1. Dari Developer Dashboard
2. Klik setiap Quick Action card:
   - Activity Logs
   - Data Management
   - API Tester

**Expected Results:**
- ✅ Klik terdeteksi (cursor pointer)
- ✅ Navigation ke `/koperasi/developer/activity-logs` (Note: Halaman ini belum dibuat - Phase 3)
- ✅ Navigation ke `/koperasi/developer/data-management` (Note: Halaman ini belum dibuat - Phase 3)
- ✅ Navigation ke `/koperasi/developer/api-tester` (Note: Halaman ini belum dibuat - Phase 3)

**Note:** Halaman-halaman ini akan return 404 karena memang belum dibuat. Ini normal untuk Phase 1. Akan dibuat di Phase 3.

---

### **TEST 8: Error Handling - Invalid Token** ✅

**Steps:**
1. Dari Developer Dashboard
2. Buka DevTools Console (F12)
3. Type: `localStorage.setItem('token', 'invalid_token_here')`
4. Refresh page

**Expected Results:**
- ✅ Error message muncul di dashboard: "Failed to decode token or user is not a developer"
- ✅ Active role card tidak muncul
- ✅ Role switcher buttons disabled atau tidak muncul

---

### **TEST 9: Mobile Responsive** 📱

**Steps:**
1. Buka DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Pilih mobile device (iPhone 12 / Samsung Galaxy)
4. Navigate ke Developer Dashboard

**Expected Results:**
- ✅ Sidebar collapsible (hamburger menu)
- ✅ Role buttons stack properly (grid responsive)
- ✅ Quick action cards stack vertically
- ✅ Touch-friendly button sizes
- ✅ Text tidak overflow

**Screenshot Checklist:**
- [ ] Mobile view dengan sidebar closed
- [ ] Mobile view dengan sidebar open
- [ ] Dashboard content di mobile

---

### **TEST 10: Logout & Re-login** ✅

**Steps:**
1. Dari Developer Dashboard
2. Klik "Logout" button (di bawah sidebar)
3. Verify redirect ke `/login`
4. Login ulang dengan credentials developer
5. Navigate ke Developer Dashboard

**Expected Results:**
- ✅ Logout berhasil (token cleared dari localStorage)
- ✅ Redirect ke login page
- ✅ Re-login berhasil
- ✅ Default state: activeRole = DEVELOPER, isProduction = false
- ✅ Environment badge = "DEVELOPMENT MODE"

---

## 🐛 **KNOWN ISSUES / LIMITATIONS**

### **Phase 1 Limitations:**
1. **Activity Logs Page** - Not yet implemented (Phase 3)
   - Navigation works but returns 404
   - Expected: Will be built in Phase 3

2. **Data Management Page** - Not yet implemented (Phase 3)
   - Navigation works but returns 404
   - Expected: Will be built in Phase 3

3. **API Tester Page** - Not yet implemented (Phase 3)
   - Navigation works but returns 404
   - Expected: Will be built in Phase 3

4. **Data Isolation Not Active Yet** - Phase 2 work
   - isProduction flag exists in database
   - Middleware to auto-filter queries not implemented yet
   - Expected: Will be built in Phase 2

### **Potential Issues:**
- [ ] If localStorage token expires → Need to re-login
- [ ] If Prisma schema changes → Need to regenerate client
- [ ] If database connection lost → API calls will fail

---

## 📊 **SUCCESS CRITERIA**

Phase 1.4 considered **PASSING** if:
- ✅ All TEST 1-6 passed (core functionality)
- ✅ Role switching works in both directions
- ✅ Environment toggle creates activity_logs entries
- ✅ No TypeScript errors
- ✅ No console errors (except expected 404 for Phase 3 pages)
- ✅ JWT tokens correctly updated in localStorage
- ✅ Sidebar navigation filters correctly by role

---

## 🔧 **TROUBLESHOOTING**

### **Problem:** Sidebar kategori DEVELOPER TOOLS tidak muncul
**Solution:**
1. Check user role: `localStorage.getItem('token')` → Decode di jwt.io
2. Verify role = DEVELOPER or developerSession.activeRole = DEVELOPER
3. Check `lib/use-auth.ts`: User interface harus include "DEVELOPER" in role union type
4. Check `app/koperasi/layout.tsx`: useAuth harus accept ["DEVELOPER"]

### **Problem:** Role switch API returns 403 Unauthorized
**Solution:**
1. Verify token di localStorage valid
2. Check API route `app/api/developer/switch-role/route.ts`: verifyToken success?
3. Check payload.developerSession exists and actualRole = DEVELOPER

### **Problem:** Environment toggle tidak update badge
**Solution:**
1. Check API response: Should return new token
2. Verify localStorage.setItem called with new token
3. Check state update in component: setDeveloperSession called?
4. Force page refresh if needed

### **Problem:** Activity log tidak muncul di database
**Solution:**
1. Check API call: `/api/developer/toggle-environment` returns 200?
2. Query database: `SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 5`
3. Verify activity_logs.id generated correctly (format: activity-{timestamp}-{random})

---

## 📝 **TESTING REPORT TEMPLATE**

Copy template ini untuk report hasil testing:

```markdown
## DEVELOPER DASHBOARD TESTING REPORT

**Date:** [Date]
**Tester:** [Your Name]
**Environment:** Development (localhost:3000)

### Test Results Summary
- [ ] TEST 1: Sidebar Navigation - PASS / FAIL
- [ ] TEST 2: Dashboard Access - PASS / FAIL
- [ ] TEST 3: Switch to Admin - PASS / FAIL
- [ ] TEST 4: Return to Developer - PASS / FAIL
- [ ] TEST 5: Toggle to Prod - PASS / FAIL
- [ ] TEST 6: Toggle to Dev - PASS / FAIL
- [ ] TEST 7: Quick Actions - PASS / FAIL (404 expected)
- [ ] TEST 8: Error Handling - PASS / FAIL
- [ ] TEST 9: Mobile Responsive - PASS / FAIL
- [ ] TEST 10: Logout/Re-login - PASS / FAIL

### Issues Found
1. [Issue description]
2. [Issue description]

### Screenshots
[Attach screenshots here]

### Recommendations
[Any suggestions for improvement]
```

---

## 🎯 **NEXT STEPS AFTER TESTING**

1. ✅ Complete all test cases above
2. ✅ Document any bugs/issues found
3. ✅ Create testing report
4. 🚀 If all tests pass → **Ready for Phase 2: Data Isolation Middleware**
5. 🔧 If tests fail → Fix bugs, re-test, then proceed to Phase 2

---

**Happy Testing!** 🧪

Jika ada pertanyaan atau menemukan bug, langsung catat di testing report. Semua feedback akan membantu improve sistem developer mode kita!

**Target:** All tests complete by 21 Oktober 2025, 12:00 WIB

---

**Document Created:** 21 Oktober 2025, 02:05 WIB  
**Last Updated:** 21 Oktober 2025, 02:05 WIB
