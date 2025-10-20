# 🔐 TEST CREDENTIALS

**Last Updated**: 20 Oktober 2025  
**Status**: ✅ Active - All passwords reset and verified

---

## 📋 TEST ACCOUNTS

### **1. Super Admin Account**
```
Email: superadmin@koperasi.com
Password: superadmin123
Role: SUPER_ADMIN
```

**Access**:
- ✅ Full system access
- ✅ Supplier management
- ✅ User management
- ✅ All dashboard features
- ✅ System settings

**Login URL**: http://localhost:3000/login

---

### **2. Admin Account**
```
Email: admin@koperasi.com
Password: admin123
Role: ADMIN
```

**Access**:
- ✅ Koperasi dashboard
- ✅ Inventory management
- ✅ Financial tracking
- ✅ Membership management
- ✅ Broadcast messaging
- ✅ POS/Kasir system
- ❌ Supplier management (Super Admin only)

**Login URL**: http://localhost:3000/login

---

### **3. Supplier Account**
```
Email: supplier@koperasi.com
Password: supplier123
Role: SUPPLIER
```

**Access**:
- ✅ Supplier dashboard
- ✅ Product management
- ✅ Orders view
- ✅ Transactions
- ✅ Profile settings
- ❌ Koperasi admin features

**Login URL**: http://localhost:3000/login

---

### **4. Member Account (Testing)**
```
Email: member1@koperasi.com
Password: member123
Role: ADMIN (Note: This is actually ADMIN role, not regular member)
```

**Note**: This account has ADMIN role for testing purposes.

---

## 🔧 PASSWORD RESET

If passwords need to be reset again, run:

```bash
node reset-test-passwords.js
```

This will reset all passwords to:
- Admin: `admin123`
- Super Admin: `superadmin123`
- Supplier: `supplier123`
- Member: `member123`

---

## 📝 DEVELOPMENT NOTES

### **Environment Variables**
Make sure `.env` has:
```env
JWT_SECRET=your-secure-secret-key-minimum-32-characters-long-for-production
DATABASE_URL="postgresql://username:password@localhost:5432/koperasi_dev"
```

### **Database**
- Database: `koperasi_dev`
- Total Users: 8 accounts
- Seeded data available

### **Testing Login Flow**

1. **Test Admin Dashboard**:
   ```
   Login: admin@koperasi.com / admin123
   Expected: Redirect to /koperasi/dashboard
   Features: Full admin features
   ```

2. **Test Super Admin**:
   ```
   Login: superadmin@koperasi.com / superadmin123
   Expected: Redirect to /koperasi/dashboard (Super Admin view)
   Features: Supplier management + all admin features
   ```

3. **Test Supplier**:
   ```
   Login: supplier@koperasi.com / supplier123
   Expected: Redirect to /koperasi/supplier
   Features: Supplier-specific dashboard
   ```

---

## ⚠️ SECURITY NOTES

### **For Development**:
- ✅ These passwords are for **development/testing only**
- ✅ Simple passwords for easy testing
- ✅ Stored in bcrypt hashed format in database

### **For Production**:
- ❌ **NEVER** use these passwords in production
- ✅ Generate strong, unique passwords
- ✅ Use environment-specific credentials
- ✅ Implement password policies
- ✅ Enable 2FA if possible

---

## 🧪 TESTING SCENARIOS

### **Scenario 1: Admin Login & Dashboard**
```
1. Open http://localhost:3000/login
2. Enter: admin@koperasi.com / admin123
3. Click "Masuk"
4. Verify: Redirect to /koperasi/dashboard
5. Check: Dashboard loads with stats
```

### **Scenario 2: Supplier Login & Dashboard**
```
1. Open http://localhost:3000/login
2. Enter: supplier@koperasi.com / supplier123
3. Click "Masuk"
4. Verify: Redirect to /koperasi/supplier
5. Check: Supplier dashboard loads
```

### **Scenario 3: Super Admin Features**
```
1. Login as: superadmin@koperasi.com / superadmin123
2. Navigate to: Supplier Management
3. Verify: Can view/edit suppliers
4. Check: Access to all features
```

---

## 📊 USER ROLES COMPARISON

| Feature | SUPER_ADMIN | ADMIN | SUPPLIER | USER |
|---------|-------------|-------|----------|------|
| Dashboard | ✅ | ✅ | ✅ | ❌ |
| Inventory | ✅ | ✅ | ❌ | ❌ |
| Financial | ✅ | ✅ | ❌ | ❌ |
| Membership | ✅ | ✅ | ❌ | ❌ |
| Broadcast | ✅ | ✅ | ❌ | ❌ |
| POS/Kasir | ✅ | ✅ | ❌ | ❌ |
| Supplier Mgmt | ✅ | ❌ | ❌ | ❌ |
| Own Products | ❌ | ❌ | ✅ | ❌ |
| Own Orders | ❌ | ❌ | ✅ | ❌ |

---

## 🔍 TROUBLESHOOTING

### **Issue: "Invalid credentials"**
**Solution**: 
1. Run `node check-users.js` to verify user exists
2. Run `node reset-test-passwords.js` to reset passwords
3. Clear browser cache and try again

### **Issue: "Token expired"**
**Solution**:
1. Logout completely
2. Clear localStorage: `localStorage.clear()`
3. Login again with fresh credentials

### **Issue: "Access denied"**
**Solution**:
1. Check user role matches required role for page
2. Verify JWT_SECRET is correct in `.env`
3. Check token in localStorage is valid

---

## 📞 SUPPORT

**For Development Issues**:
- Check console for errors (F12)
- Review server logs in terminal
- Verify database connection

**For Testing Help**:
- See `TESTING-COMPLETE-GUIDE.md`
- See `MANUAL-TESTING-RESULTS.md`
- See `AUTHENTICATION-TESTING.md`

---

**Last Password Reset**: 20 Oktober 2025  
**Reset By**: Automated script (reset-test-passwords.js)  
**Status**: ✅ All credentials verified working
