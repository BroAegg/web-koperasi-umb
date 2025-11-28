# 🗃️ Laravel Database Migrations

## Migration Files Order

Execute migrations in this order:

```
001_create_users_table.php
002_create_categories_table.php
003_create_suppliers_table.php
004_create_products_table.php
005_create_product_submissions_table.php
006_create_transactions_table.php
007_create_transaction_items_table.php
008_create_consignors_table.php
009_create_consignment_batches_table.php
010_create_consignment_sales_table.php
011_create_settlements_table.php
012_create_stock_movements_table.php
013_create_stock_requests_table.php
014_create_supplier_payments_table.php
015_create_consignment_payments_table.php
016_create_purchases_table.php
017_create_purchase_items_table.php
018_create_activity_logs_table.php
019_create_sessions_table.php
```

---

## Migration Files Content

### 001_create_users_table.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('name');
            $table->enum('role', [
                'SUPER_ADMIN',
                'ADMIN', 
                'KASIR',
                'SUPPLIER',
                'USER',
                'DEVELOPER'
            ])->default('USER');
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();
            $table->boolean('must_change_password')->default(true);
            $table->timestamp('password_changed_at')->nullable();
            $table->timestamps();

            $table->index('role');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
```

---

### 002_create_categories_table.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100)->unique();
            $table->text('description')->nullable();
            $table->string('icon', 10)->default('📦');
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('is_active');
            $table->index('order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
```

---

### 003_create_suppliers_table.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 20)->unique();
            $table->string('business_name');
            $table->string('owner_name');
            $table->string('email')->unique();
            $table->string('phone', 20);
            $table->text('address');
            $table->string('password');
            $table->text('description')->nullable();
            $table->string('product_category', 100)->nullable();
            
            // Status
            $table->enum('status', [
                'PENDING_REVIEW',
                'APPROVED_PENDING_PAYMENT',
                'PAID_PENDING_APPROVAL',
                'ACTIVE',
                'REJECTED',
                'SUSPENDED',
                'PENDING',
                'APPROVED'
            ])->default('PENDING_REVIEW');
            $table->timestamp('approved_at')->nullable();
            $table->uuid('approved_by_id')->nullable();
            $table->text('rejected_reason')->nullable();
            
            // Payment
            $table->enum('payment_status', [
                'UNPAID',
                'PARTIAL',
                'PAID',
                'PAID_PENDING_APPROVAL',
                'PAID_APPROVED',
                'PAID_REJECTED'
            ])->default('UNPAID');
            $table->decimal('monthly_fee', 10, 2)->default(25000);
            $table->date('next_payment_due')->nullable();
            $table->boolean('is_payment_active')->default(false);
            $table->date('last_payment_date')->nullable();
            $table->enum('preferred_payment_method', [
                'CASH',
                'TRANSFER',
                'CREDIT'
            ])->default('TRANSFER');
            $table->integer('payment_grace_days')->default(7);
            $table->boolean('is_suspended_for_payment')->default(false);
            $table->timestamp('suspended_at')->nullable();
            $table->text('suspension_reason')->nullable();
            
            // Product Limits
            $table->integer('max_active_products')->default(10);
            $table->integer('current_active_products')->default(0);
            
            // Evaluation
            $table->tinyInteger('product_quality_score')->nullable();
            $table->tinyInteger('product_price_score')->nullable();
            $table->tinyInteger('product_packaging_score')->nullable();
            $table->decimal('product_average_score', 3, 2)->nullable();
            $table->text('evaluation_notes')->nullable();
            $table->uuid('evaluated_by')->nullable();
            $table->timestamp('evaluated_at')->nullable();
            
            // Meta
            $table->boolean('is_active')->default(true);
            $table->text('note')->nullable();
            $table->string('payment_terms', 100)->nullable();
            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index('is_active');
            $table->index('payment_status');
            
            // Foreign Keys
            $table->foreign('approved_by_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('evaluated_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
```

---

### 004_create_products_table.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->uuid('category_id');
            $table->string('sku', 50)->unique()->nullable();
            $table->decimal('buy_price', 12, 2)->nullable();
            $table->decimal('sell_price', 12, 2);
            $table->integer('stock')->default(0);
            $table->integer('threshold')->default(5);
            $table->string('unit', 20)->default('pcs');
            $table->decimal('avg_cost', 12, 2)->nullable();
            
            // Ownership
            $table->enum('ownership_type', ['TOKO', 'TITIPAN', 'SUPPLIER'])->default('TOKO');
            $table->uuid('supplier_id')->nullable();
            $table->boolean('is_consignment')->default(false);
            $table->decimal('profit_share_rate', 5, 2)->default(90.00);
            
            // Status
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'SEASONAL'])->default('ACTIVE');
            $table->boolean('is_active')->default(true);
            $table->enum('stock_cycle', ['HARIAN', 'MINGGUAN', 'DUA_MINGGUAN'])->default('MINGGUAN');
            $table->string('supplier_contact', 100)->nullable();
            $table->string('expiry_policy', 100)->nullable();
            $table->timestamp('last_restock_at')->nullable();
            
            $table->timestamps();

            // Indexes
            $table->index('category_id');
            $table->index('supplier_id');
            $table->index('is_active');
            $table->index('stock');
            $table->index('name');

            // Foreign Keys
            $table->foreign('category_id')->references('id')->on('categories');
            $table->foreign('supplier_id')->references('id')->on('suppliers')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
```

---

### 005_create_product_submissions_table.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_submissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('supplier_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->uuid('category_id');
            $table->decimal('price', 12, 2);
            $table->integer('stock_initial');
            $table->string('unit', 20)->default('pcs');
            $table->string('image', 500)->nullable();
            $table->enum('status', [
                'PENDING_REVIEW',
                'APPROVED',
                'REJECTED',
                'RESUBMITTED'
            ])->default('PENDING_REVIEW');
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamp('reviewed_at')->nullable();
            $table->uuid('reviewed_by')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->uuid('approved_product_id')->nullable()->unique();
            $table->timestamps();

            // Indexes
            $table->index(['supplier_id', 'status']);
            $table->index(['status', 'submitted_at']);

            // Foreign Keys
            $table->foreign('supplier_id')->references('id')->on('suppliers')->cascadeOnDelete();
            $table->foreign('category_id')->references('id')->on('categories');
            $table->foreign('reviewed_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('approved_product_id')->references('id')->on('products')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_submissions');
    }
};
```

---

### 006_create_transactions_table.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('invoice_number', 50)->unique();
            $table->uuid('member_id')->nullable();
            $table->enum('type', ['SALE', 'PURCHASE', 'RETURN', 'INCOME', 'EXPENSE']);
            $table->decimal('total_amount', 14, 2);
            $table->enum('payment_method', ['CASH', 'TRANSFER', 'CREDIT'])->default('CASH');
            $table->enum('status', ['PENDING', 'COMPLETED', 'CANCELLED'])->default('COMPLETED');
            $table->text('note')->nullable();
            $table->timestamp('date')->useCurrent();
            $table->boolean('is_production')->default(true);
            $table->timestamps();

            // Indexes
            $table->index('date');
            $table->index('status');
            $table->index('payment_method');
            $table->index('is_production');
            $table->index(['member_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
```

---

### 007_create_transaction_items_table.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaction_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('transaction_id');
            $table->uuid('product_id');
            $table->integer('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('total_price', 14, 2);
            $table->decimal('cogs_per_unit', 12, 2)->nullable();
            $table->decimal('total_cogs', 14, 2)->nullable();
            $table->decimal('gross_profit', 14, 2)->nullable();
            $table->boolean('is_production')->default(true);
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index('transaction_id');
            $table->index('product_id');
            $table->index('is_production');

            // Foreign Keys
            $table->foreign('transaction_id')->references('id')->on('transactions')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_items');
    }
};
```

---

### 008_create_consignors_table.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consignors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 20)->unique();
            $table->string('name');
            $table->string('contact', 100)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->enum('fee_type', ['PERCENTAGE', 'FLAT', 'HYBRID'])->default('PERCENTAGE');
            $table->decimal('default_fee_percent', 5, 2)->nullable();
            $table->decimal('default_fee_flat', 12, 2)->nullable();
            $table->string('payment_schedule', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consignors');
    }
};
```

---

### 009_create_consignment_batches_table.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consignment_batches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 50)->unique();
            $table->uuid('consignor_id');
            $table->uuid('product_id');
            $table->integer('qty_in');
            $table->integer('qty_sold')->default(0);
            $table->integer('qty_returned')->default(0);
            $table->integer('qty_expired')->default(0);
            $table->integer('qty_remaining');
            $table->enum('fee_type', ['PERCENTAGE', 'FLAT', 'HYBRID']);
            $table->decimal('fee_percent', 5, 2)->nullable();
            $table->decimal('fee_flat', 12, 2)->nullable();
            $table->timestamp('received_at')->useCurrent();
            $table->date('expiry_at')->nullable();
            $table->enum('status', ['ACTIVE', 'DEPLETED', 'RETURNED', 'EXPIRED'])->default('ACTIVE');
            $table->text('note')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['consignor_id', 'received_at']);
            $table->index(['product_id', 'status']);
            $table->index('received_at');

            // Foreign Keys
            $table->foreign('consignor_id')->references('id')->on('consignors');
            $table->foreign('product_id')->references('id')->on('products');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consignment_batches');
    }
};
```

---

### 010_create_consignment_sales_table.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consignment_sales', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('batch_id')->nullable();
            $table->uuid('supplier_id')->nullable();
            $table->uuid('transaction_item_id');
            $table->integer('qty_sold');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('total_revenue', 14, 2);
            $table->enum('fee_type', ['PERCENTAGE', 'FLAT', 'HYBRID']);
            $table->decimal('fee_amount', 12, 2);
            $table->decimal('net_to_consignor', 14, 2);
            $table->uuid('settlement_id')->nullable();
            $table->boolean('is_settled')->default(false);
            $table->timestamp('sale_date')->useCurrent();
            $table->boolean('is_production')->default(true);
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index('batch_id');
            $table->index('supplier_id');
            $table->index('sale_date');
            $table->index('settlement_id');
            $table->index('is_production');

            // Foreign Keys
            $table->foreign('batch_id')->references('id')->on('consignment_batches')->nullOnDelete();
            $table->foreign('supplier_id')->references('id')->on('suppliers')->nullOnDelete();
            $table->foreign('transaction_item_id')->references('id')->on('transaction_items');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consignment_sales');
    }
};
```

---

### 011_create_settlements_table.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settlements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 50)->unique();
            $table->uuid('consignor_id');
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('total_revenue', 14, 2)->default(0);
            $table->decimal('total_fee', 14, 2)->default(0);
            $table->decimal('total_payable', 14, 2)->default(0);
            $table->enum('status', ['PENDING', 'PAID', 'CANCELLED', 'DISPUTED'])->default('PENDING');
            $table->enum('payment_method', ['CASH', 'TRANSFER', 'CREDIT'])->nullable();
            $table->date('payment_date')->nullable();
            $table->string('payment_ref', 100)->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['consignor_id', 'period_start']);
            $table->index('status');

            // Foreign Keys
            $table->foreign('consignor_id')->references('id')->on('consignors');
        });

        // Add FK to consignment_sales after settlements exists
        Schema::table('consignment_sales', function (Blueprint $table) {
            $table->foreign('settlement_id')->references('id')->on('settlements')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('consignment_sales', function (Blueprint $table) {
            $table->dropForeign(['settlement_id']);
        });
        Schema::dropIfExists('settlements');
    }
};
```

---

### 012_create_stock_movements_table.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('product_id');
            $table->enum('movement_type', [
                'PURCHASE_IN',
                'CONSIGNMENT_IN',
                'CONSIGNMENT_RETURN',
                'SALE_OUT',
                'RETURN_IN',
                'RETURN_OUT',
                'EXPIRED_OUT',
                'ADJUSTMENT',
                'TRANSFER_IN',
                'TRANSFER_OUT',
                'RESTOCK'
            ]);
            $table->integer('quantity');
            $table->decimal('unit_cost', 12, 2)->nullable();
            $table->enum('reference_type', [
                'PURCHASE',
                'CONSIGNMENT_BATCH',
                'SALE',
                'ADJUSTMENT',
                'EXPIRY',
                'STOCK_REQUEST'
            ])->nullable();
            $table->uuid('reference_id')->nullable();
            $table->text('note')->nullable();
            $table->timestamp('occurred_at')->useCurrent();
            $table->boolean('is_production')->default(true);
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index(['product_id', 'occurred_at']);
            $table->index(['reference_type', 'reference_id']);
            $table->index('is_production');

            // Foreign Keys
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
```

---

### 013_create_stock_requests_table.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('supplier_id');
            $table->uuid('product_id');
            $table->integer('qty_requested');
            $table->integer('current_stock');
            $table->text('reason')->nullable();
            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'])->default('PENDING');
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('reviewed_at')->nullable();
            $table->uuid('reviewed_by')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('supplier_id');
            $table->index('product_id');
            $table->index('status');
            $table->index('requested_at');

            // Foreign Keys
            $table->foreign('supplier_id')->references('id')->on('suppliers');
            $table->foreign('product_id')->references('id')->on('products');
            $table->foreign('reviewed_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_requests');
    }
};
```

---

### 014_create_supplier_payments_table.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('supplier_payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('supplier_id');
            $table->decimal('amount', 14, 2);
            $table->enum('payment_method', ['CASH', 'TRANSFER', 'CREDIT'])->default('TRANSFER');
            $table->timestamp('payment_date')->useCurrent();
            $table->date('period_start');
            $table->date('period_end');
            $table->string('reference_no', 100)->nullable();
            $table->string('payment_proof', 500)->nullable();
            $table->enum('status', ['PENDING', 'VERIFIED', 'REJECTED'])->default('PENDING');
            $table->uuid('verified_by')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['supplier_id', 'payment_date']);

            // Foreign Keys
            $table->foreign('supplier_id')->references('id')->on('suppliers')->cascadeOnDelete();
            $table->foreign('verified_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supplier_payments');
    }
};
```

---

### 015_create_consignment_payments_table.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consignment_payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('supplier_id')->nullable();
            $table->string('supplier_name');
            $table->decimal('amount', 14, 2);
            $table->string('period', 50);
            $table->date('period_start');
            $table->date('period_end');
            $table->enum('payment_method', ['CASH', 'TRANSFER', 'CREDIT'])->default('CASH');
            $table->uuid('transaction_id')->nullable()->unique();
            $table->uuid('paid_by');
            $table->string('bank_name', 100)->nullable();
            $table->string('account_number', 50)->nullable();
            $table->string('proof_image_url', 500)->nullable();
            $table->enum('status', ['PENDING', 'APPROVED', 'PAID', 'REJECTED'])->default('PENDING');
            $table->timestamp('requested_at')->nullable();
            $table->uuid('requested_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->uuid('reviewed_by')->nullable();
            $table->text('rejected_reason')->nullable();
            $table->text('note')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('supplier_id');
            $table->index('status');
            $table->index('created_at');
            $table->index(['period_start', 'period_end']);

            // Foreign Keys
            $table->foreign('supplier_id')->references('id')->on('suppliers')->nullOnDelete();
            $table->foreign('transaction_id')->references('id')->on('transactions')->nullOnDelete();
            $table->foreign('paid_by')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consignment_payments');
    }
};
```

---

### 016_create_purchases_table.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 50)->unique();
            $table->uuid('supplier_id');
            $table->decimal('total_amount', 14, 2)->default(0);
            $table->timestamp('purchase_date')->useCurrent();
            $table->timestamp('received_date')->nullable();
            $table->enum('status', ['PENDING', 'RECEIVED', 'CANCELLED'])->default('PENDING');
            $table->enum('payment_status', [
                'UNPAID',
                'PARTIAL',
                'PAID',
                'PAID_PENDING_APPROVAL',
                'PAID_APPROVED',
                'PAID_REJECTED'
            ])->default('UNPAID');
            $table->timestamp('payment_date')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['supplier_id', 'purchase_date']);

            // Foreign Keys
            $table->foreign('supplier_id')->references('id')->on('suppliers');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchases');
    }
};
```

---

### 017_create_purchase_items_table.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('purchase_id');
            $table->uuid('product_id');
            $table->integer('quantity');
            $table->decimal('unit_cost', 12, 2);
            $table->decimal('total_cost', 14, 2);
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index('purchase_id');
            $table->index('product_id');

            // Foreign Keys
            $table->foreign('purchase_id')->references('id')->on('purchases')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_items');
    }
};
```

---

### 018_create_activity_logs_table.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->enum('user_role', [
                'SUPER_ADMIN',
                'ADMIN',
                'KASIR',
                'SUPPLIER',
                'USER',
                'DEVELOPER'
            ]);
            $table->string('action', 100);
            $table->string('module', 50);
            $table->text('description');
            $table->json('metadata')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->boolean('is_production')->default(true);
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index('user_id');
            $table->index('user_role');
            $table->index('module');
            $table->index('action');
            $table->index('is_production');
            $table->index('created_at');

            // Foreign Keys
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
```

---

### 019_create_sessions_table.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('token')->unique();
            $table->timestamp('expires_at');
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamp('last_active_at')->useCurrent();
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index('user_id');
            $table->index('token');
            $table->index('expires_at');

            // Foreign Keys
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
    }
};
```

---

## 🌱 Seeder Files

### DatabaseSeeder.php

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            // Add more seeders as needed
        ]);
    }
}
```

### UserSeeder.php

```php
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Super Admin
        User::create([
            'id' => Str::uuid(),
            'email' => 'superadmin@koperasi.com',
            'password' => Hash::make('Password123!'),
            'name' => 'Super Admin',
            'role' => 'SUPER_ADMIN',
            'is_active' => true,
            'must_change_password' => false,
        ]);

        // Admin
        User::create([
            'id' => Str::uuid(),
            'email' => 'admin@koperasi.com',
            'password' => Hash::make('Password123!'),
            'name' => 'Admin Toko',
            'role' => 'ADMIN',
            'is_active' => true,
            'must_change_password' => false,
        ]);

        // Kasir
        User::create([
            'id' => Str::uuid(),
            'email' => 'kasir@koperasi.com',
            'password' => Hash::make('Password123!'),
            'name' => 'Kasir 1',
            'role' => 'KASIR',
            'is_active' => true,
            'must_change_password' => false,
        ]);
    }
}
```

### CategorySeeder.php

```php
<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Makanan', 'icon' => '🍔', 'order' => 1],
            ['name' => 'Minuman', 'icon' => '🥤', 'order' => 2],
            ['name' => 'Snack', 'icon' => '🍿', 'order' => 3],
            ['name' => 'Kebutuhan Pokok', 'icon' => '🛒', 'order' => 4],
            ['name' => 'Peralatan', 'icon' => '🔧', 'order' => 5],
            ['name' => 'ATK', 'icon' => '📝', 'order' => 6],
            ['name' => 'Lainnya', 'icon' => '📦', 'order' => 99],
        ];

        foreach ($categories as $cat) {
            Category::create([
                'id' => Str::uuid(),
                'name' => $cat['name'],
                'icon' => $cat['icon'],
                'order' => $cat['order'],
                'is_active' => true,
            ]);
        }
    }
}
```

---

## 🚀 Migration Commands

```bash
# Run all migrations
php artisan migrate

# Run with seeder
php artisan migrate --seed

# Fresh migration (drop all & re-run)
php artisan migrate:fresh --seed

# Rollback last batch
php artisan migrate:rollback

# Reset all migrations
php artisan migrate:reset

# Check migration status
php artisan migrate:status
```
