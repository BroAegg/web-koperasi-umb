# 📊 Database Schema - Laravel POS Koperasi

## Entity Relationship Diagram (Conceptual)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    users    │───────│   members   │       │  suppliers  │
└─────────────┘       └─────────────┘       └─────────────┘
       │                     │                     │
       │                     │                     │
       ▼                     ▼                     ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  sessions   │       │transactions │       │  products   │
└─────────────┘       └─────────────┘       └─────────────┘
                             │                     │
                             │                     │
                             ▼                     ▼
                      ┌─────────────┐       ┌─────────────┐
                      │ trans_items │◄──────│consign_batch│
                      └─────────────┘       └─────────────┘
                             │                     │
                             ▼                     ▼
                      ┌─────────────┐       ┌─────────────┐
                      │consign_sales│───────│ settlements │
                      └─────────────┘       └─────────────┘
```

---

## 📋 Table Definitions

### 1. users
Core authentication table for all user types.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(36) | NO | UUID | Primary key |
| email | VARCHAR(255) | NO | - | Unique email |
| password | VARCHAR(255) | NO | - | Hashed password |
| name | VARCHAR(255) | NO | - | Full name |
| role | ENUM | NO | 'USER' | User role |
| is_active | BOOLEAN | NO | true | Account status |
| last_login_at | TIMESTAMP | YES | NULL | Last login time |
| must_change_password | BOOLEAN | NO | true | Force password change |
| password_changed_at | TIMESTAMP | YES | NULL | Password change time |
| created_at | TIMESTAMP | NO | NOW | Created timestamp |
| updated_at | TIMESTAMP | NO | NOW | Updated timestamp |

**Enum: role**
- `SUPER_ADMIN` - Full system access
- `ADMIN` - Store management
- `KASIR` - Cashier/POS only
- `SUPPLIER` - Supplier portal
- `USER` - Basic user (future member)

---

### 2. categories
Product categories.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(36) | NO | UUID | Primary key |
| name | VARCHAR(100) | NO | - | Category name (unique) |
| description | TEXT | YES | NULL | Description |
| icon | VARCHAR(10) | YES | '📦' | Emoji icon |
| order | INT | NO | 0 | Display order |
| is_active | BOOLEAN | NO | true | Active status |
| created_at | TIMESTAMP | NO | NOW | Created timestamp |
| updated_at | TIMESTAMP | NO | NOW | Updated timestamp |

---

### 3. suppliers
Supplier/vendor information.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(36) | NO | UUID | Primary key |
| code | VARCHAR(20) | NO | - | Unique supplier code |
| business_name | VARCHAR(255) | NO | - | Business/store name |
| owner_name | VARCHAR(255) | NO | - | Owner name |
| email | VARCHAR(255) | NO | - | Email (unique) |
| phone | VARCHAR(20) | NO | - | Phone number |
| address | TEXT | NO | - | Address |
| password | VARCHAR(255) | NO | - | Hashed password |
| description | TEXT | YES | NULL | Business description |
| product_category | VARCHAR(100) | YES | NULL | Main product category |
| **Status Fields** |
| status | ENUM | NO | 'PENDING' | Supplier status |
| approved_at | TIMESTAMP | YES | NULL | Approval time |
| approved_by_id | CHAR(36) | YES | NULL | Approved by user |
| rejected_reason | TEXT | YES | NULL | Rejection reason |
| **Payment Fields** |
| payment_status | ENUM | NO | 'UNPAID' | Monthly fee status |
| monthly_fee | DECIMAL(10,2) | NO | 25000 | Monthly fee amount |
| next_payment_due | DATE | YES | NULL | Next payment due |
| is_payment_active | BOOLEAN | NO | false | Payment subscription |
| last_payment_date | DATE | YES | NULL | Last payment date |
| preferred_payment_method | ENUM | NO | 'TRANSFER' | Preferred payment |
| payment_grace_days | INT | NO | 7 | Grace period days |
| is_suspended_for_payment | BOOLEAN | NO | false | Suspended for non-payment |
| suspended_at | TIMESTAMP | YES | NULL | Suspension time |
| suspension_reason | TEXT | YES | NULL | Suspension reason |
| **Product Limits** |
| max_active_products | INT | NO | 10 | Max active products |
| current_active_products | INT | NO | 0 | Current active count |
| **Evaluation** |
| product_quality_score | TINYINT | YES | NULL | Quality score 1-5 |
| product_price_score | TINYINT | YES | NULL | Price score 1-5 |
| product_packaging_score | TINYINT | YES | NULL | Packaging score 1-5 |
| product_average_score | DECIMAL(3,2) | YES | NULL | Average score |
| evaluation_notes | TEXT | YES | NULL | Evaluation notes |
| evaluated_by | CHAR(36) | YES | NULL | Evaluated by user |
| evaluated_at | TIMESTAMP | YES | NULL | Evaluation time |
| **Meta** |
| is_active | BOOLEAN | NO | true | Active status |
| note | TEXT | YES | NULL | Internal notes |
| payment_terms | VARCHAR(100) | YES | NULL | Payment terms |
| created_at | TIMESTAMP | NO | NOW | Created timestamp |
| updated_at | TIMESTAMP | NO | NOW | Updated timestamp |

**Enum: status**
- `PENDING_REVIEW` - Baru daftar, review sample
- `APPROVED_PENDING_PAYMENT` - Lolos review, tunggu bayar
- `PAID_PENDING_APPROVAL` - Sudah bayar, verifikasi
- `ACTIVE` - Aktif jualan
- `REJECTED` - Ditolak
- `SUSPENDED` - Disuspend

**Enum: payment_status**
- `UNPAID`
- `PARTIAL`
- `PAID`
- `PAID_PENDING_APPROVAL`
- `PAID_APPROVED`
- `PAID_REJECTED`

---

### 4. products
Product catalog.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(36) | NO | UUID | Primary key |
| name | VARCHAR(255) | NO | - | Product name |
| description | TEXT | YES | NULL | Description |
| category_id | CHAR(36) | NO | - | FK to categories |
| sku | VARCHAR(50) | YES | NULL | Stock Keeping Unit |
| buy_price | DECIMAL(12,2) | YES | NULL | Purchase price |
| sell_price | DECIMAL(12,2) | NO | - | Selling price |
| stock | INT | NO | 0 | Current stock |
| threshold | INT | NO | 5 | Low stock alert |
| unit | VARCHAR(20) | NO | 'pcs' | Unit of measure |
| avg_cost | DECIMAL(12,2) | YES | NULL | Average cost |
| **Ownership** |
| ownership_type | ENUM | NO | 'TOKO' | Ownership type |
| supplier_id | CHAR(36) | YES | NULL | FK to suppliers |
| is_consignment | BOOLEAN | NO | false | Consignment product |
| profit_share_rate | DECIMAL(5,2) | YES | 90.00 | Profit share % |
| **Status** |
| status | ENUM | NO | 'ACTIVE' | Product status |
| is_active | BOOLEAN | NO | true | Active for sale |
| stock_cycle | ENUM | NO | 'MINGGUAN' | Restock cycle |
| supplier_contact | VARCHAR(100) | YES | NULL | Supplier contact |
| expiry_policy | VARCHAR(100) | YES | NULL | Expiry handling |
| last_restock_at | TIMESTAMP | YES | NULL | Last restock time |
| **Meta** |
| created_at | TIMESTAMP | NO | NOW | Created timestamp |
| updated_at | TIMESTAMP | NO | NOW | Updated timestamp |

**Enum: ownership_type**
- `TOKO` - Owned by store
- `TITIPAN` - Consignment (legacy)
- `SUPPLIER` - Supplier owned

**Enum: status**
- `ACTIVE`
- `INACTIVE`
- `SEASONAL`

**Enum: stock_cycle**
- `HARIAN`
- `MINGGUAN`
- `DUA_MINGGUAN`

---

### 5. product_submissions
Supplier product submissions for approval.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(36) | NO | UUID | Primary key |
| supplier_id | CHAR(36) | NO | - | FK to suppliers |
| name | VARCHAR(255) | NO | - | Product name |
| description | TEXT | YES | NULL | Description |
| category_id | CHAR(36) | NO | - | FK to categories |
| price | DECIMAL(12,2) | NO | - | Proposed price |
| stock_initial | INT | NO | - | Initial stock |
| unit | VARCHAR(20) | NO | 'pcs' | Unit of measure |
| image | VARCHAR(500) | YES | NULL | Product image URL |
| status | ENUM | NO | 'PENDING_REVIEW' | Submission status |
| submitted_at | TIMESTAMP | NO | NOW | Submission time |
| reviewed_at | TIMESTAMP | YES | NULL | Review time |
| reviewed_by | CHAR(36) | YES | NULL | FK to users |
| rejection_reason | TEXT | YES | NULL | Rejection reason |
| approved_product_id | CHAR(36) | YES | NULL | FK to products |

**Enum: status**
- `PENDING_REVIEW`
- `APPROVED`
- `REJECTED`
- `RESUBMITTED`

---

### 6. transactions
Sales transactions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(36) | NO | UUID | Primary key |
| invoice_number | VARCHAR(50) | NO | - | Unique invoice |
| member_id | CHAR(36) | YES | NULL | FK to members |
| type | ENUM | NO | - | Transaction type |
| total_amount | DECIMAL(14,2) | NO | - | Total amount |
| payment_method | ENUM | NO | 'CASH' | Payment method |
| status | ENUM | NO | 'COMPLETED' | Transaction status |
| note | TEXT | YES | NULL | Notes |
| date | TIMESTAMP | NO | NOW | Transaction date |
| is_production | BOOLEAN | NO | true | Production data flag |
| created_at | TIMESTAMP | NO | NOW | Created timestamp |
| updated_at | TIMESTAMP | NO | NOW | Updated timestamp |

**Enum: type**
- `SALE`
- `PURCHASE`
- `RETURN`
- `INCOME`
- `EXPENSE`

**Enum: payment_method**
- `CASH`
- `TRANSFER`
- `CREDIT`

**Enum: status**
- `PENDING`
- `COMPLETED`
- `CANCELLED`

---

### 7. transaction_items
Line items in transactions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(36) | NO | UUID | Primary key |
| transaction_id | CHAR(36) | NO | - | FK to transactions |
| product_id | CHAR(36) | NO | - | FK to products |
| quantity | INT | NO | - | Quantity sold |
| unit_price | DECIMAL(12,2) | NO | - | Unit price |
| total_price | DECIMAL(14,2) | NO | - | Line total |
| cogs_per_unit | DECIMAL(12,2) | YES | NULL | Cost per unit |
| total_cogs | DECIMAL(14,2) | YES | NULL | Total cost |
| gross_profit | DECIMAL(14,2) | YES | NULL | Gross profit |
| is_production | BOOLEAN | NO | true | Production flag |
| created_at | TIMESTAMP | NO | NOW | Created timestamp |

---

### 8. consignment_batches
Consignment stock batches.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(36) | NO | UUID | Primary key |
| code | VARCHAR(50) | NO | - | Unique batch code |
| consignor_id | CHAR(36) | NO | - | FK to consignors |
| product_id | CHAR(36) | NO | - | FK to products |
| qty_in | INT | NO | - | Quantity received |
| qty_sold | INT | NO | 0 | Quantity sold |
| qty_returned | INT | NO | 0 | Quantity returned |
| qty_expired | INT | NO | 0 | Quantity expired |
| qty_remaining | INT | NO | - | Remaining stock |
| fee_type | ENUM | NO | - | Fee calculation type |
| fee_percent | DECIMAL(5,2) | YES | NULL | Fee percentage |
| fee_flat | DECIMAL(12,2) | YES | NULL | Flat fee amount |
| received_at | TIMESTAMP | NO | NOW | Received date |
| expiry_at | DATE | YES | NULL | Expiry date |
| status | ENUM | NO | 'ACTIVE' | Batch status |
| note | TEXT | YES | NULL | Notes |
| created_at | TIMESTAMP | NO | NOW | Created timestamp |
| updated_at | TIMESTAMP | NO | NOW | Updated timestamp |

**Enum: fee_type**
- `PERCENTAGE` - % of sale
- `FLAT` - Fixed per unit
- `HYBRID` - Combination

**Enum: status**
- `ACTIVE`
- `DEPLETED`
- `RETURNED`
- `EXPIRED`

---

### 9. consignment_sales
Sales attributed to consignment.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(36) | NO | UUID | Primary key |
| batch_id | CHAR(36) | YES | NULL | FK to consignment_batches |
| supplier_id | CHAR(36) | YES | NULL | FK to suppliers |
| transaction_item_id | CHAR(36) | NO | - | FK to transaction_items |
| qty_sold | INT | NO | - | Quantity sold |
| unit_price | DECIMAL(12,2) | NO | - | Sale price |
| total_revenue | DECIMAL(14,2) | NO | - | Total revenue |
| fee_type | ENUM | NO | - | Fee type used |
| fee_amount | DECIMAL(12,2) | NO | - | Fee amount |
| net_to_consignor | DECIMAL(14,2) | NO | - | Amount to pay supplier |
| settlement_id | CHAR(36) | YES | NULL | FK to settlements |
| is_settled | BOOLEAN | NO | false | Settlement status |
| sale_date | TIMESTAMP | NO | NOW | Sale date |
| is_production | BOOLEAN | NO | true | Production flag |
| created_at | TIMESTAMP | NO | NOW | Created timestamp |

---

### 10. settlements
Consignment payment settlements.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(36) | NO | UUID | Primary key |
| code | VARCHAR(50) | NO | - | Unique settlement code |
| consignor_id | CHAR(36) | NO | - | FK to consignors |
| period_start | DATE | NO | - | Period start date |
| period_end | DATE | NO | - | Period end date |
| total_revenue | DECIMAL(14,2) | NO | 0 | Total revenue |
| total_fee | DECIMAL(14,2) | NO | 0 | Total fees |
| total_payable | DECIMAL(14,2) | NO | 0 | Amount payable |
| status | ENUM | NO | 'PENDING' | Settlement status |
| payment_method | ENUM | YES | NULL | Payment method used |
| payment_date | DATE | YES | NULL | Payment date |
| payment_ref | VARCHAR(100) | YES | NULL | Payment reference |
| note | TEXT | YES | NULL | Notes |
| created_at | TIMESTAMP | NO | NOW | Created timestamp |
| updated_at | TIMESTAMP | NO | NOW | Updated timestamp |

**Enum: status**
- `PENDING`
- `PAID`
- `CANCELLED`
- `DISPUTED`

---

### 11. stock_movements
Inventory movement history.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(36) | NO | UUID | Primary key |
| product_id | CHAR(36) | NO | - | FK to products |
| movement_type | ENUM | NO | - | Type of movement |
| quantity | INT | NO | - | Quantity (+/-) |
| unit_cost | DECIMAL(12,2) | YES | NULL | Unit cost |
| reference_type | ENUM | YES | NULL | Reference type |
| reference_id | CHAR(36) | YES | NULL | Reference ID |
| note | TEXT | YES | NULL | Notes |
| occurred_at | TIMESTAMP | NO | NOW | Movement date |
| is_production | BOOLEAN | NO | true | Production flag |
| created_at | TIMESTAMP | NO | NOW | Created timestamp |

**Enum: movement_type**
- `PURCHASE_IN`
- `CONSIGNMENT_IN`
- `CONSIGNMENT_RETURN`
- `SALE_OUT`
- `RETURN_IN`
- `RETURN_OUT`
- `EXPIRED_OUT`
- `ADJUSTMENT`
- `TRANSFER_IN`
- `TRANSFER_OUT`
- `RESTOCK`

**Enum: reference_type**
- `PURCHASE`
- `CONSIGNMENT_BATCH`
- `SALE`
- `ADJUSTMENT`
- `EXPIRY`
- `STOCK_REQUEST`

---

### 12. stock_requests
Supplier stock/restock requests.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(36) | NO | UUID | Primary key |
| supplier_id | CHAR(36) | NO | - | FK to suppliers |
| product_id | CHAR(36) | NO | - | FK to products |
| qty_requested | INT | NO | - | Requested quantity |
| current_stock | INT | NO | - | Current stock level |
| reason | TEXT | YES | NULL | Request reason |
| status | ENUM | NO | 'PENDING' | Request status |
| requested_at | TIMESTAMP | NO | NOW | Request time |
| reviewed_at | TIMESTAMP | YES | NULL | Review time |
| reviewed_by | CHAR(36) | YES | NULL | FK to users |
| rejection_reason | TEXT | YES | NULL | Rejection reason |
| note | TEXT | YES | NULL | Notes |

**Enum: status**
- `PENDING`
- `APPROVED`
- `REJECTED`
- `COMPLETED`

---

### 13. consignors (Legacy - Map to Suppliers)
*Note: In MVP, consolidate consignors into suppliers table*

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(36) | NO | UUID | Primary key |
| code | VARCHAR(20) | NO | - | Unique code |
| name | VARCHAR(255) | NO | - | Consignor name |
| contact | VARCHAR(100) | YES | NULL | Contact person |
| phone | VARCHAR(20) | YES | NULL | Phone |
| email | VARCHAR(255) | YES | NULL | Email |
| address | TEXT | YES | NULL | Address |
| fee_type | ENUM | NO | 'PERCENTAGE' | Default fee type |
| default_fee_percent | DECIMAL(5,2) | YES | NULL | Default % |
| default_fee_flat | DECIMAL(12,2) | YES | NULL | Default flat |
| payment_schedule | VARCHAR(100) | YES | NULL | Payment schedule |
| is_active | BOOLEAN | NO | true | Active status |
| note | TEXT | YES | NULL | Notes |
| created_at | TIMESTAMP | NO | NOW | Created timestamp |
| updated_at | TIMESTAMP | NO | NOW | Updated timestamp |

---

### 14. supplier_payments
Supplier payment records.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(36) | NO | UUID | Primary key |
| supplier_id | CHAR(36) | NO | - | FK to suppliers |
| amount | DECIMAL(14,2) | NO | - | Payment amount |
| payment_method | ENUM | NO | 'TRANSFER' | Payment method |
| payment_date | TIMESTAMP | NO | NOW | Payment date |
| period_start | DATE | NO | - | Period start |
| period_end | DATE | NO | - | Period end |
| reference_no | VARCHAR(100) | YES | NULL | Reference number |
| payment_proof | VARCHAR(500) | YES | NULL | Proof image URL |
| status | ENUM | NO | 'PENDING' | Verification status |
| verified_by | CHAR(36) | YES | NULL | FK to users |
| verified_at | TIMESTAMP | YES | NULL | Verification time |
| note | TEXT | YES | NULL | Notes |
| created_at | TIMESTAMP | NO | NOW | Created timestamp |
| updated_at | TIMESTAMP | NO | NOW | Updated timestamp |

**Enum: status**
- `PENDING`
- `VERIFIED`
- `REJECTED`

---

### 15. consignment_payments
Consignment payment to suppliers.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(36) | NO | UUID | Primary key |
| supplier_id | CHAR(36) | YES | NULL | FK to suppliers |
| supplier_name | VARCHAR(255) | NO | - | Supplier name |
| amount | DECIMAL(14,2) | NO | - | Payment amount |
| period | VARCHAR(50) | NO | - | Period label |
| period_start | DATE | NO | - | Period start |
| period_end | DATE | NO | - | Period end |
| payment_method | ENUM | NO | 'CASH' | Payment method |
| transaction_id | CHAR(36) | YES | NULL | FK to transactions |
| paid_by | CHAR(36) | NO | - | FK to users |
| bank_name | VARCHAR(100) | YES | NULL | Bank name |
| account_number | VARCHAR(50) | YES | NULL | Account number |
| proof_image_url | VARCHAR(500) | YES | NULL | Proof image |
| status | ENUM | NO | 'PENDING' | Payment status |
| requested_at | TIMESTAMP | YES | NULL | Request time |
| requested_by | CHAR(36) | YES | NULL | Requested by |
| reviewed_at | TIMESTAMP | YES | NULL | Review time |
| reviewed_by | CHAR(36) | YES | NULL | Reviewed by |
| rejected_reason | TEXT | YES | NULL | Rejection reason |
| note | TEXT | YES | NULL | Notes |
| metadata | JSON | YES | NULL | Extra data |
| created_at | TIMESTAMP | NO | NOW | Created timestamp |
| updated_at | TIMESTAMP | NO | NOW | Updated timestamp |

**Enum: status**
- `PENDING`
- `APPROVED`
- `PAID`
- `REJECTED`

---

### 16. purchases
Purchase orders.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(36) | NO | UUID | Primary key |
| code | VARCHAR(50) | NO | - | Unique PO code |
| supplier_id | CHAR(36) | NO | - | FK to suppliers |
| total_amount | DECIMAL(14,2) | NO | 0 | Total amount |
| purchase_date | TIMESTAMP | NO | NOW | Purchase date |
| received_date | TIMESTAMP | YES | NULL | Received date |
| status | ENUM | NO | 'PENDING' | PO status |
| payment_status | ENUM | NO | 'UNPAID' | Payment status |
| payment_date | TIMESTAMP | YES | NULL | Payment date |
| note | TEXT | YES | NULL | Notes |
| created_at | TIMESTAMP | NO | NOW | Created timestamp |
| updated_at | TIMESTAMP | NO | NOW | Updated timestamp |

**Enum: status**
- `PENDING`
- `RECEIVED`
- `CANCELLED`

---

### 17. purchase_items
Purchase order items.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(36) | NO | UUID | Primary key |
| purchase_id | CHAR(36) | NO | - | FK to purchases |
| product_id | CHAR(36) | NO | - | FK to products |
| quantity | INT | NO | - | Quantity ordered |
| unit_cost | DECIMAL(12,2) | NO | - | Unit cost |
| total_cost | DECIMAL(14,2) | NO | - | Total cost |
| created_at | TIMESTAMP | NO | NOW | Created timestamp |

---

### 18. activity_logs
User activity logging.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(36) | NO | UUID | Primary key |
| user_id | CHAR(36) | NO | - | FK to users |
| user_role | ENUM | NO | - | User role at time |
| action | VARCHAR(100) | NO | - | Action performed |
| module | VARCHAR(50) | NO | - | Module/feature |
| description | TEXT | NO | - | Description |
| metadata | JSON | YES | NULL | Extra data |
| ip_address | VARCHAR(45) | YES | NULL | IP address |
| user_agent | VARCHAR(500) | YES | NULL | User agent |
| is_production | BOOLEAN | NO | true | Production flag |
| created_at | TIMESTAMP | NO | NOW | Created timestamp |

---

### 19. sessions
User session management.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(36) | NO | UUID | Primary key |
| user_id | CHAR(36) | NO | - | FK to users |
| token | VARCHAR(255) | NO | - | Session token |
| expires_at | TIMESTAMP | NO | - | Expiry time |
| ip_address | VARCHAR(45) | YES | NULL | IP address |
| user_agent | VARCHAR(500) | YES | NULL | User agent |
| last_active_at | TIMESTAMP | NO | NOW | Last activity |
| created_at | TIMESTAMP | NO | NOW | Created timestamp |

---

## 📊 Indexes Summary

| Table | Index Name | Columns | Purpose |
|-------|------------|---------|---------|
| users | PRIMARY | id | PK |
| users | users_email_unique | email | Login lookup |
| products | PRIMARY | id | PK |
| products | products_sku_unique | sku | SKU lookup |
| products | products_category_id_index | category_id | Category filter |
| products | products_supplier_id_index | supplier_id | Supplier filter |
| products | products_stock_index | stock | Low stock query |
| transactions | PRIMARY | id | PK |
| transactions | transactions_invoice_unique | invoice_number | Invoice lookup |
| transactions | transactions_date_index | date | Date range query |
| transactions | transactions_member_id_index | member_id | Member history |
| consignment_sales | PRIMARY | id | PK |
| consignment_sales | consignment_sales_supplier_index | supplier_id | Supplier sales |
| consignment_sales | consignment_sales_date_index | sale_date | Date query |
| stock_movements | PRIMARY | id | PK |
| stock_movements | stock_movements_product_index | product_id, occurred_at | Movement history |

---

## 🔗 Foreign Key Relationships

```sql
-- Products
products.category_id → categories.id
products.supplier_id → suppliers.id (nullable)

-- Transactions
transactions.member_id → members.id (nullable)
transaction_items.transaction_id → transactions.id (CASCADE)
transaction_items.product_id → products.id

-- Consignment
consignment_batches.consignor_id → consignors.id
consignment_batches.product_id → products.id
consignment_sales.batch_id → consignment_batches.id (nullable)
consignment_sales.supplier_id → suppliers.id (nullable)
consignment_sales.transaction_item_id → transaction_items.id
consignment_sales.settlement_id → settlements.id (nullable)

-- Suppliers
product_submissions.supplier_id → suppliers.id (CASCADE)
product_submissions.category_id → categories.id
product_submissions.reviewed_by → users.id (nullable)
stock_requests.supplier_id → suppliers.id
stock_requests.product_id → products.id
supplier_payments.supplier_id → suppliers.id (CASCADE)

-- Purchases
purchases.supplier_id → suppliers.id
purchase_items.purchase_id → purchases.id (CASCADE)
purchase_items.product_id → products.id

-- Users & Auth
sessions.user_id → users.id (CASCADE)
activity_logs.user_id → users.id (CASCADE)
```
