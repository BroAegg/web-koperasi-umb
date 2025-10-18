# 🔧 QUICK FIX GUIDE - Dashboard Blank Issues

**For**: Immediate debugging (TODAY - 18 Oktober)  
**Time Required**: 2-4 hours  
**Priority**: 🔴 CRITICAL

---

## 🎯 Fix #1: Supplier Dashboard Blank Page

**File**: `app/koperasi/supplier/page.tsx`  
**Assignee**: 👤 **YOU** (Primary Dev)

### Step 1: Add Debug Logging

Open browser (F12) → Console tab → Login as supplier

**Expected Console Output**:
```
[Supplier Dashboard] Component mounted
[Supplier Dashboard] Token exists: true
[Supplier Dashboard] Fetching user info...
[Supplier Dashboard] Auth response: { success: true, data: {...} }
[Supplier Dashboard] User is supplier: {...}
[Supplier Dashboard] Fetching supplier profile...
```

**If console empty or errors appear**: That's your clue!

### Step 2: Check Component Logic

Look for these common issues in `app/koperasi/supplier/page.tsx`:

```typescript
// ISSUE 1: Missing loading state reset
useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  try {
    // ... fetch logic
  } catch (error) {
    console.error(error);
  }
  // ❌ MISSING: finally { setLoading(false); }
};

// FIX:
const fetchData = async () => {
  try {
    // ... fetch logic
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);  // ✅ Always set loading false
  }
};
```

```typescript
// ISSUE 2: Conditional rendering stuck in loading
if (loading) {
  return <LoadingSkeleton />;
}

if (!user) {  // ← Never reached if loading=true forever
  return <div>Not logged in</div>;
}

// FIX: Check loading is actually false
if (loading) {
  return <LoadingSkeleton />;
}

if (!user && !loading) {  // ✅ Check loading completed
  return <div>Not logged in</div>;
}
```

```typescript
// ISSUE 3: API call not triggered
useEffect(() => {
  if (user) {
    fetchSupplierData();
  }
}, []); // ❌ Empty deps - won't run when user changes

// FIX:
useEffect(() => {
  if (user) {
    fetchSupplierData();
  }
}, [user]); // ✅ Re-run when user loaded
```

### Step 3: Quick Fix Pattern

Apply this pattern to Supplier dashboard:

```typescript
export default function SupplierDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supplierData, setSupplierData] = useState(null);

  useEffect(() => {
    console.log('[Supplier] Component mounted');
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.log('[Supplier] No token, redirecting');
      router.push("/login");
      return;
    }

    fetchUserAndData();
  }, []);

  const fetchUserAndData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Get user
      const authRes = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const authData = await authRes.json();
      
      console.log('[Supplier] Auth response:', authData);

      if (!authData.success) {
        throw new Error("Authentication failed");
      }

      if (authData.data.role !== "SUPPLIER") {
        console.log('[Supplier] Not a supplier, redirecting');
        router.push("/koperasi/dashboard");
        return;
      }

      setUser(authData.data);

      // Step 2: Get supplier data
      const supplierRes = await fetch("/api/supplier/dashboard", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const supplierData = await supplierRes.json();
      
      console.log('[Supplier] Dashboard data:', supplierData);

      if (supplierData.success) {
        setSupplierData(supplierData.data);
      }

    } catch (err) {
      console.error('[Supplier] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);  // ✅ CRITICAL: Always set loading false
    }
  };

  // Render logic
  if (loading) {
    console.log('[Supplier] Showing loading state');
    return <LoadingSkeleton />;
  }

  if (error) {
    console.log('[Supplier] Showing error:', error);
    return (
      <div className="text-center p-6">
        <p className="text-red-600">{error}</p>
        <button onClick={fetchUserAndData}>Retry</button>
      </div>
    );
  }

  if (!user) {
    console.log('[Supplier] No user, showing prompt');
    return <div>Please login</div>;
  }

  console.log('[Supplier] Rendering dashboard');
  return (
    <div>
      {/* Your dashboard content */}
      <h1>Welcome {user.name}</h1>
      {supplierData && (
        <div>
          {/* Display supplier stats */}
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 Fix #2: Admin Dashboard Blank Content

**File**: `app/koperasi/dashboard/page.tsx`  
**Assignee**: 👤 **AEGNER** (Junior Dev)

### Issue: Dashboard API Not Called

**Evidence from logs**:
```
✅ GET /koperasi/dashboard 200  ← Page loads
✅ GET /api/auth/me 200          ← Auth works
❌ GET /api/dashboard NOT FOUND  ← API never called!
```

### Root Cause

Check `app/koperasi/dashboard/page.tsx` around lines 50-70:

```typescript
useEffect(() => {
  console.log('[Dashboard] useEffect triggered');
  console.log('[Dashboard] authLoading:', authLoading);
  console.log('[Dashboard] user:', user);
  
  // Only fetch when user is loaded
  if (!authLoading && user) {
    if (user.role === 'SUPER_ADMIN') {
      fetchSuperAdminStats();
    } else {
      fetchDashboardStats();  // ← This should run for ADMIN
    }
  }
}, [user?.role, authLoading]);  // ← Check these dependencies
```

**Possible Issues**:
1. `authLoading` never becomes `false`
2. `user` is `null` when useEffect runs
3. Dependencies not triggering re-run
4. `fetchDashboardStats()` has error that's swallowed

### Fix Pattern for AEGNER

```typescript
// Add more logging
const fetchDashboardStats = async () => {
  try {
    console.log('[Dashboard] Starting admin stats fetch');
    const response = await fetch('/api/dashboard');
    console.log('[Dashboard] Response status:', response.status);
    
    const result = await response.json();
    console.log('[Dashboard] Response data:', result);
    
    if (result.success) {
      console.log('[Dashboard] Setting stats:', result.data);
      setStats(result.data);
    } else {
      console.error('[Dashboard] API returned error:', result.error);
    }
  } catch (error) {
    console.error('[Dashboard] Fetch error:', error);
  } finally {
    console.log('[Dashboard] Setting loading=false');
    setLoading(false);  // ✅ CRITICAL
  }
};

// Improve useEffect
useEffect(() => {
  console.log('[Dashboard] useEffect - authLoading:', authLoading, 'user:', user?.role);
  
  if (authLoading) {
    console.log('[Dashboard] Still loading auth, waiting...');
    return;
  }
  
  if (!user) {
    console.log('[Dashboard] No user found');
    setLoading(false);
    return;
  }
  
  console.log('[Dashboard] User loaded, fetching dashboard data');
  
  if (user.role === 'SUPER_ADMIN') {
    console.log('[Dashboard] Calling fetchSuperAdminStats');
    fetchSuperAdminStats();
  } else if (user.role === 'ADMIN') {
    console.log('[Dashboard] Calling fetchDashboardStats');
    fetchDashboardStats();
  } else {
    console.log('[Dashboard] Unexpected role:', user.role);
    setLoading(false);
  }
}, [user?.role, authLoading]);
```

### Expected Console Output (After Fix)

```
[Dashboard] useEffect - authLoading: true user: undefined
[Dashboard] Still loading auth, waiting...
[Dashboard] useEffect - authLoading: false user: ADMIN
[Dashboard] User loaded, fetching dashboard data
[Dashboard] Calling fetchDashboardStats
[Dashboard] Starting admin stats fetch
[Dashboard] Response status: 200
[Dashboard] Response data: { success: true, data: {...} }
[Dashboard] Setting stats: {...}
[Dashboard] Setting loading=false
[Dashboard] Rendering ADMIN dashboard
```

---

## 🎯 Fix #3: SuperAdmin Dashboard

**Same pattern as Admin**, just check the SuperAdmin branch:

```typescript
if (user.role === 'SUPER_ADMIN') {
  fetchSuperAdminStats();  // ← Check this function
}
```

Apply same debugging pattern:
1. Add console.logs everywhere
2. Check loading state management
3. Check error handling
4. Verify API response structure

---

## 🧪 Testing Checklist

After applying fixes:

### For Each Dashboard:
- [ ] Open browser console (F12)
- [ ] Clear localStorage: `localStorage.clear()`
- [ ] Hard refresh: `Ctrl + Shift + R`
- [ ] Login with test account
- [ ] Watch console logs
- [ ] Verify dashboard renders
- [ ] Verify data displays
- [ ] Check for errors

### Test Accounts:
```
Supplier:
  Email: supplier@koperasi.com
  Password: Password123!

Admin:
  Email: admin@koperasi.com
  Password: Password123!

SuperAdmin:
  Email: superadmin@koperasi.com
  Password: Password123!
```

---

## 📝 Commit Template

After fixing:

```bash
git add [files]
git commit -m "fix(dashboard): resolve [role] dashboard blank page issue

Problem: Dashboard showing blank page after login
Root Cause: [describe what you found]
Solution: [describe what you fixed]

Changes:
- Added proper loading state management
- Fixed useEffect dependencies
- Added error handling
- Improved console logging

Testing:
- ✅ Login works
- ✅ Dashboard renders
- ✅ Data displays correctly
- ✅ No console errors

Refs: Day 14 dashboard debugging"
```

---

## ⚠️ Common Pitfalls

1. **Don't forget `finally` block**:
   ```typescript
   try {
     await fetchData();
   } catch (error) {
     console.error(error);
   } finally {
     setLoading(false);  // ← MUST HAVE
   }
   ```

2. **Check loading in conditionals**:
   ```typescript
   // ❌ BAD:
   if (!data) return <Error />;
   
   // ✅ GOOD:
   if (!data && !loading) return <Error />;
   ```

3. **Use dependency array correctly**:
   ```typescript
   // ❌ BAD:
   useEffect(() => {
     if (user) fetchData();
   }, []); // user not in deps!
   
   // ✅ GOOD:
   useEffect(() => {
     if (user) fetchData();
   }, [user]); // user in deps
   ```

4. **Always log everything during debugging**:
   ```typescript
   console.log('[Component] State:', state);
   console.log('[Component] User:', user);
   console.log('[Component] Loading:', loading);
   ```

---

## 🚀 Next Steps After Fix

1. Test thoroughly (all 3 roles)
2. Remove debug console.logs (keep important ones)
3. Commit & push fixes
4. Update `PRODUCTION-ROADMAP.md` progress
5. Move to next task (UI polish, testing, etc.)

---

**Questions?** Ask in team chat!  
**Stuck >2 hours?** Call for help!  
**Found the fix?** Document it for team learning!

Good luck! 💪🚀
