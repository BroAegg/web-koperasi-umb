# 📊 Data Migration Guide

## Migrasi Data dari Next.js ke Laravel

Panduan untuk memigrasikan data existing dari database Next.js/Prisma ke Laravel.

---

## 📋 Preparation

### 1. Export Data dari Database Lama

```sql
-- Export ke CSV atau dump SQL
-- Gunakan tool seperti phpMyAdmin, MySQL Workbench, atau command line

-- Export users
SELECT * FROM users INTO OUTFILE '/tmp/users.csv' 
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n';

-- Export categories
SELECT * FROM categories INTO OUTFILE '/tmp/categories.csv' 
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n';

-- Export suppliers
SELECT * FROM suppliers INTO OUTFILE '/tmp/suppliers.csv' 
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n';

-- Export products
SELECT * FROM products INTO OUTFILE '/tmp/products.csv' 
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n';

-- Dan seterusnya...
```

### 2. Atau Dump Langsung

```bash
# Full dump
mysqldump -u root -p koperasi_old > backup.sql

# Specific tables
mysqldump -u root -p koperasi_old users categories suppliers products > backup_partial.sql
```

---

## 🔄 Field Mapping

### Users Table

| Old Field (Prisma) | New Field (Laravel) | Notes |
|--------------------|---------------------|-------|
| id | id | UUID, keep same |
| email | email | - |
| password | password | Keep hashed |
| name | name | - |
| role | role | Enum compatible |
| isActive | is_active | camelCase → snake_case |
| lastLoginAt | last_login_at | - |
| mustChangePassword | must_change_password | - |
| passwordChangedAt | password_changed_at | - |
| createdAt | created_at | - |
| updatedAt | updated_at | - |

### Categories Table

| Old Field | New Field | Notes |
|-----------|-----------|-------|
| id | id | UUID |
| name | name | - |
| description | description | - |
| icon | icon | - |
| order | order | - |
| isActive | is_active | - |

### Suppliers Table

| Old Field | New Field | Notes |
|-----------|-----------|-------|
| id | id | UUID |
| code | code | - |
| businessName | business_name | camelCase → snake_case |
| ownerName | owner_name | - |
| email | email | - |
| phone | phone | - |
| address | address | - |
| password | password | - |
| status | status | Enum |
| approvedAt | approved_at | - |
| approvedById | approved_by_id | - |
| paymentStatus | payment_status | - |
| monthlyFee | monthly_fee | - |
| ... | ... | - |

### Products Table

| Old Field | New Field | Notes |
|-----------|-----------|-------|
| id | id | UUID |
| name | name | - |
| description | description | - |
| categoryId | category_id | - |
| sku | sku | - |
| buyPrice | buy_price | - |
| sellPrice | sell_price | - |
| stock | stock | - |
| threshold | threshold | - |
| unit | unit | - |
| ownershipType | ownership_type | Enum |
| supplierId | supplier_id | - |
| isConsignment | is_consignment | - |
| profitShareRate | profit_share_rate | - |
| isActive | is_active | - |
| ... | ... | - |

---

## 🛠️ Migration Script

### Laravel Seeder untuk Import

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Product;

class DataMigrationSeeder extends Seeder
{
    public function run(): void
    {
        $this->migrateUsers();
        $this->migrateCategories();
        $this->migrateSuppliers();
        $this->migrateProducts();
        // Add more...
    }

    private function migrateUsers(): void
    {
        $oldUsers = DB::connection('old_mysql')->table('users')->get();

        foreach ($oldUsers as $user) {
            User::create([
                'id' => $user->id,
                'email' => $user->email,
                'password' => $user->password, // Already hashed
                'name' => $user->name,
                'role' => $user->role,
                'is_active' => $user->isActive,
                'last_login_at' => $user->lastLoginAt,
                'must_change_password' => $user->mustChangePassword,
                'password_changed_at' => $user->passwordChangedAt,
                'created_at' => $user->createdAt,
                'updated_at' => $user->updatedAt,
            ]);
        }

        $this->command->info('Users migrated: ' . $oldUsers->count());
    }

    private function migrateCategories(): void
    {
        $oldCategories = DB::connection('old_mysql')->table('categories')->get();

        foreach ($oldCategories as $cat) {
            Category::create([
                'id' => $cat->id,
                'name' => $cat->name,
                'description' => $cat->description,
                'icon' => $cat->icon ?? '📦',
                'order' => $cat->order ?? 0,
                'is_active' => $cat->isActive ?? true,
                'created_at' => $cat->createdAt,
                'updated_at' => $cat->updatedAt,
            ]);
        }

        $this->command->info('Categories migrated: ' . $oldCategories->count());
    }

    private function migrateSuppliers(): void
    {
        $oldSuppliers = DB::connection('old_mysql')->table('suppliers')->get();

        foreach ($oldSuppliers as $sup) {
            Supplier::create([
                'id' => $sup->id,
                'code' => $sup->code,
                'business_name' => $sup->businessName,
                'owner_name' => $sup->ownerName,
                'email' => $sup->email,
                'phone' => $sup->phone,
                'address' => $sup->address,
                'password' => $sup->password,
                'description' => $sup->description,
                'product_category' => $sup->productCategory,
                'status' => $sup->status,
                'approved_at' => $sup->approvedAt,
                'approved_by_id' => $sup->approvedById,
                'payment_status' => $sup->paymentStatus,
                'monthly_fee' => $sup->monthlyFee,
                'next_payment_due' => $sup->nextPaymentDue,
                'is_payment_active' => $sup->isPaymentActive,
                'last_payment_date' => $sup->lastPaymentDate,
                'preferred_payment_method' => $sup->preferredPaymentMethod,
                'max_active_products' => $sup->maxActiveProducts,
                'current_active_products' => $sup->currentActiveProducts,
                'is_active' => $sup->isActive,
                'created_at' => $sup->createdAt,
                'updated_at' => $sup->updatedAt,
            ]);
        }

        $this->command->info('Suppliers migrated: ' . $oldSuppliers->count());
    }

    private function migrateProducts(): void
    {
        $oldProducts = DB::connection('old_mysql')->table('products')->get();

        foreach ($oldProducts as $prod) {
            Product::create([
                'id' => $prod->id,
                'name' => $prod->name,
                'description' => $prod->description,
                'category_id' => $prod->categoryId,
                'sku' => $prod->sku,
                'buy_price' => $prod->buyPrice,
                'sell_price' => $prod->sellPrice,
                'stock' => $prod->stock,
                'threshold' => $prod->threshold,
                'unit' => $prod->unit,
                'ownership_type' => $prod->ownershipType,
                'supplier_id' => $prod->supplierId,
                'is_consignment' => $prod->isConsignment,
                'profit_share_rate' => $prod->profitShareRate,
                'status' => $prod->status,
                'is_active' => $prod->isActive,
                'last_restock_at' => $prod->lastRestockAt,
                'created_at' => $prod->createdAt,
                'updated_at' => $prod->updatedAt,
            ]);
        }

        $this->command->info('Products migrated: ' . $oldProducts->count());
    }
}
```

### Config Database Connections

```php
// config/database.php

'connections' => [
    // New Laravel database
    'mysql' => [
        'driver' => 'mysql',
        'host' => env('DB_HOST', '127.0.0.1'),
        'port' => env('DB_PORT', '3306'),
        'database' => env('DB_DATABASE', 'laravel_pos'),
        'username' => env('DB_USERNAME', 'root'),
        'password' => env('DB_PASSWORD', ''),
        // ...
    ],

    // Old Prisma/Next.js database
    'old_mysql' => [
        'driver' => 'mysql',
        'host' => env('OLD_DB_HOST', '127.0.0.1'),
        'port' => env('OLD_DB_PORT', '3306'),
        'database' => env('OLD_DB_DATABASE', 'koperasi_old'),
        'username' => env('OLD_DB_USERNAME', 'root'),
        'password' => env('OLD_DB_PASSWORD', ''),
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
        'prefix' => '',
    ],
],
```

---

## 📝 Migration Checklist

### Pre-Migration

- [ ] Backup database lama
- [ ] Test koneksi ke database lama
- [ ] Verify field mapping
- [ ] Create Laravel migrations
- [ ] Run migrations (empty tables)

### Migration

- [ ] Migrate users (with passwords)
- [ ] Migrate categories
- [ ] Migrate suppliers
- [ ] Migrate products
- [ ] Migrate consignors
- [ ] Migrate transactions
- [ ] Migrate transaction_items
- [ ] Migrate consignment_batches
- [ ] Migrate consignment_sales
- [ ] Migrate settlements
- [ ] Migrate stock_movements
- [ ] Migrate other tables...

### Post-Migration

- [ ] Verify record counts match
- [ ] Test foreign key relationships
- [ ] Test login with migrated users
- [ ] Test POS with migrated products
- [ ] Verify financial data accuracy
- [ ] Check for orphaned records

---

## ⚠️ Important Notes

### 1. Password Compatibility

Password sudah di-hash dengan bcrypt dari Next.js/NextAuth. Laravel juga pakai bcrypt, jadi harusnya compatible. Tapi test dulu!

```php
// Test login dengan password lama
$user = User::where('email', 'test@example.com')->first();
if (Hash::check('Password123!', $user->password)) {
    echo "Password compatible!";
}
```

### 2. UUID Handling

Pastikan Laravel pakai UUID yang sama format dengan Prisma:

```php
// app/Traits/HasUuid.php
trait HasUuid
{
    protected static function bootHasUuid(): void
    {
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function getIncrementing(): bool
    {
        return false;
    }

    public function getKeyType(): string
    {
        return 'string';
    }
}
```

### 3. Enum Mapping

Pastikan enum values sama persis:

```php
// Prisma
enum Role {
  SUPER_ADMIN
  ADMIN
  KASIR
  SUPPLIER
  USER
}

// Laravel Enum
enum Role: string
{
    case SUPER_ADMIN = 'SUPER_ADMIN';
    case ADMIN = 'ADMIN';
    case KASIR = 'KASIR';
    case SUPPLIER = 'SUPPLIER';
    case USER = 'USER';
}
```

### 4. Date/Time Handling

Timezone harus consistent:

```php
// config/app.php
'timezone' => 'Asia/Jakarta',

// Migration script
'created_at' => Carbon::parse($old->createdAt)->setTimezone('Asia/Jakarta'),
```

---

## 🔍 Verification Queries

```sql
-- Compare record counts
SELECT 'users' as tbl, COUNT(*) as old_count FROM old_db.users
UNION ALL
SELECT 'users', COUNT(*) FROM new_db.users;

-- Compare totals
SELECT 'products' as tbl, 
       (SELECT SUM(stock) FROM old_db.products) as old_total,
       (SELECT SUM(stock) FROM new_db.products) as new_total;

-- Check for missing records
SELECT id FROM old_db.products 
WHERE id NOT IN (SELECT id FROM new_db.products);
```
