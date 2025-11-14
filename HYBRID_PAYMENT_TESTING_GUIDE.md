# Hybrid Payment System - Testing Guide

**Server Running:** http://localhost:3001  
**Date:** November 14, 2025  
**Feature:** TRANSFER + CASH Payment Methods

---

## 🎯 Testing Objectives

1. Test CASH payment flow (end-to-end)
2. Test TRANSFER payment flow (end-to-end)
3. Verify PDF receipt generation
4. Verify admin verification for both methods
5. Ensure proper status transitions

---

## 📋 Test Flow 1: CASH Payment Method

### Step 1: Register Supplier with CASH Method
1. Navigate to: http://localhost:3001/supplier/register
2. Fill form:
   - Nama Usaha: `Toko Cash Test`
   - Nama Pemilik: `Budi Santoso`
   - Email: `cash.test@example.com`
   - Password: `Test123!`
   - Telepon: `081234567890`
   - Kategori: `Makanan & Minuman`
   - Alamat: `Jl. Test No. 1`
3. **SELECT PAYMENT METHOD: CASH (💵 Bayar di Tempat)**
4. Submit registration
5. ✅ **Expected:** Success message + status PENDING

### Step 2: Admin Approve Supplier
1. Login as ADMIN/SUPER_ADMIN
2. Navigate to: http://localhost:3001/koperasi/super-admin/suppliers
3. Find "Toko Cash Test" with status PENDING
4. Click "Setujui"
5. ✅ **Expected:** Status changed to APPROVED

### Step 3: Supplier Check Dashboard
1. Login as: `cash.test@example.com` / `Test123!`
2. Navigate to: http://localhost:3001/koperasi/supplier
3. ✅ **Expected:** 
   - Green box with "💵 Pembayaran Tunai"
   - Office address and hours displayed
   - Instructions to bring cash, KTP, and supplier code
   - NO upload button (because CASH method)

### Step 4: Kasir Input Cash Payment
1. Login as KASIR/ADMIN/SUPER_ADMIN
2. Navigate to: http://localhost:3001/koperasi/kasir/payments/cash
3. Search supplier: "Toko Cash Test" or "Budi Santoso"
4. Select supplier from results
5. Input:
   - Jumlah: `25000`
   - Catatan: `Pembayaran bulan pertama - cash`
6. Click "Simpan Pembayaran"
7. ✅ **Expected:**
   - Success message
   - **PDF receipt auto-opens in new tab**
   - Option to download for archive
8. ✅ **Verify PDF Content:**
   - Header: KOPERASI UMB
   - Title: STRUK PEMBAYARAN (CASH PAYMENT)
   - Supplier details (code, name, owner)
   - Amount: Rp 25.000
   - Status: MENUNGGU VERIFIKASI
   - Signature sections for Kasir and Supplier

### Step 5: Admin Verify Payment
1. Login as ADMIN/SUPER_ADMIN
2. Navigate to: http://localhost:3001/koperasi/super-admin/payments/verify
3. Find payment for "Toko Cash Test"
4. ✅ **Verify Display:**
   - Badge: 💵 CASH
   - Green box: "Pembayaran Tunai"
   - Message: "Tidak ada bukti transfer untuk pembayaran tunai"
   - Shows who input payment (from note)
5. Click "Verifikasi"
6. ✅ **Expected:** 
   - Payment status: VERIFIED
   - Supplier status: ACTIVE ✅

### Step 6: Verify Supplier Access
1. Login as supplier: `cash.test@example.com`
2. Navigate to dashboard
3. ✅ **Expected:** Full dashboard access (not payment prompt)

---

## 📋 Test Flow 2: TRANSFER Payment Method

### Step 1: Register Supplier with TRANSFER Method
1. Navigate to: http://localhost:3001/supplier/register
2. Fill form:
   - Nama Usaha: `Toko Transfer Test`
   - Nama Pemilik: `Siti Rahmawati`
   - Email: `transfer.test@example.com`
   - Password: `Test123!`
   - Telepon: `082345678901`
   - Kategori: `Fashion & Aksesoris`
   - Alamat: `Jl. Test No. 2`
3. **SELECT PAYMENT METHOD: TRANSFER (🏦 Transfer Bank)**
4. Submit registration
5. ✅ **Expected:** Success message + status PENDING

### Step 2: Admin Approve Supplier
1. Login as ADMIN/SUPER_ADMIN
2. Navigate to: http://localhost:3001/koperasi/super-admin/suppliers
3. Find "Toko Transfer Test" with status PENDING
4. Click "Setujui"
5. ✅ **Expected:** Status changed to APPROVED

### Step 3: Supplier Check Dashboard
1. Login as: `transfer.test@example.com` / `Test123!`
2. Navigate to: http://localhost:3001/koperasi/supplier
3. ✅ **Expected:**
   - Blue box with bank info (BRI: 1234-5678-9012-3456)
   - "Upload Bukti Pembayaran" button
   - NO office visit instructions (because TRANSFER method)

### Step 4: Supplier Upload Payment Proof
1. While logged in as `transfer.test@example.com`
2. Click "Upload Bukti Pembayaran"
3. Or navigate to: http://localhost:3001/koperasi/supplier/payment
4. Upload image file (JPG/PNG) - bukti transfer
5. Click "Kirim Bukti Pembayaran"
6. ✅ **Expected:**
   - Success message
   - "Admin akan memverifikasi dalam 1x24 jam"

### Step 5: Admin Verify Payment
1. Login as ADMIN/SUPER_ADMIN
2. Navigate to: http://localhost:3001/koperasi/super-admin/payments/verify
3. Find payment for "Toko Transfer Test"
4. ✅ **Verify Display:**
   - Badge: 🏦 TRANSFER
   - Image preview of payment proof
   - Click thumbnail to enlarge
   - "Buka Bukti di Tab Baru" button works
5. Click "Verifikasi"
6. ✅ **Expected:**
   - Payment status: VERIFIED
   - Supplier status: ACTIVE ✅

### Step 6: Verify Supplier Access
1. Login as supplier: `transfer.test@example.com`
2. Navigate to dashboard
3. ✅ **Expected:** Full dashboard access

---

## 🔍 Additional Tests

### Test 3: Kasir Cash Payment - Invalid Scenarios
1. Try to input payment for supplier with status PENDING
   - ✅ **Expected:** Error - only APPROVED suppliers
2. Try to input negative amount
   - ✅ **Expected:** Validation error
3. Try to submit without selecting supplier
   - ✅ **Expected:** Error message

### Test 4: PDF Receipt - Access Control
1. Try to access receipt as wrong supplier
   - URL: `/api/kasir/payments/receipt/[another-supplier-payment-id]`
   - ✅ **Expected:** 403 Forbidden
2. Try to access receipt without login
   - ✅ **Expected:** 401 Unauthorized
3. Access receipt as ADMIN
   - ✅ **Expected:** PDF displays correctly

### Test 5: Payment Method Persistence
1. Check database after registration
   - Query: `SELECT code, businessName, preferredPaymentMethod FROM suppliers WHERE email IN ('cash.test@example.com', 'transfer.test@example.com')`
   - ✅ **Expected:**
     - Toko Cash Test: preferredPaymentMethod = 'CASH'
     - Toko Transfer Test: preferredPaymentMethod = 'TRANSFER'

---

## 📊 Test Results Checklist

- [ ] CASH: Registration with CASH method
- [ ] CASH: Admin approval
- [ ] CASH: Supplier sees office visit instructions
- [ ] CASH: Kasir can input payment
- [ ] CASH: PDF receipt auto-opens and displays correctly
- [ ] CASH: Admin sees CASH badge in verification
- [ ] CASH: Payment verification activates supplier
- [ ] TRANSFER: Registration with TRANSFER method
- [ ] TRANSFER: Admin approval
- [ ] TRANSFER: Supplier sees upload button
- [ ] TRANSFER: Supplier can upload proof
- [ ] TRANSFER: Admin sees TRANSFER badge and image
- [ ] TRANSFER: Payment verification activates supplier
- [ ] PDF: Receipt contains all required information
- [ ] PDF: Access control works (401/403 for unauthorized)
- [ ] Database: preferredPaymentMethod stored correctly

---

## 🐛 Known Issues / Notes

*(Record any issues found during testing)*

---

## ✅ Testing Complete

Once all items are checked, the hybrid payment system is ready for production deployment.

**Tested By:** _________________  
**Date:** _________________  
**Signature:** _________________
