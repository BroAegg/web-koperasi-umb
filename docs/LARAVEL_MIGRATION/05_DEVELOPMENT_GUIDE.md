# 🛠️ Laravel Development Guide

## Quick Start

### Prerequisites

- PHP 8.2+
- Composer 2.x
- MySQL 8.0
- Node.js 18+ (untuk Vite/Tailwind)
- Git

### Initial Setup

```bash
# Clone atau create project
composer create-project laravel/laravel laravel-pos-koperasi

# Masuk ke folder
cd laravel-pos-koperasi

# Copy env
cp .env.example .env

# Generate key
php artisan key:generate

# Setup database di .env
# DB_DATABASE=koperasi_pos
# DB_USERNAME=root
# DB_PASSWORD=

# Install dependencies
composer install

# Install frontend dependencies
npm install

# Run migrations
php artisan migrate

# Run seeders
php artisan db:seed

# Start development server
php artisan serve

# Start Vite (terminal baru)
npm run dev
```

---

## 📁 Project Structure

```
laravel-pos-koperasi/
│
├── app/
│   ├── Enums/                 ← PHP Enums
│   │   ├── Role.php
│   │   ├── SupplierStatus.php
│   │   ├── PaymentMethod.php
│   │   └── ...
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginController.php
│   │   │   │   ├── LogoutController.php
│   │   │   │   └── SupplierAuthController.php
│   │   │   │
│   │   │   ├── Admin/
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── ProductController.php
│   │   │   │   ├── CategoryController.php
│   │   │   │   ├── SupplierController.php
│   │   │   │   ├── ConsignmentController.php
│   │   │   │   └── SettlementController.php
│   │   │   │
│   │   │   ├── Kasir/
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── PosController.php
│   │   │   │   └── TransactionController.php
│   │   │   │
│   │   │   └── Supplier/
│   │   │       ├── DashboardController.php
│   │   │       ├── ProductController.php
│   │   │       ├── SalesController.php
│   │   │       └── RestockController.php
│   │   │
│   │   ├── Livewire/
│   │   │   ├── Pos/
│   │   │   │   ├── PosMain.php
│   │   │   │   ├── ProductGrid.php
│   │   │   │   ├── Cart.php
│   │   │   │   └── Checkout.php
│   │   │   │
│   │   │   ├── Admin/
│   │   │   │   ├── ProductTable.php
│   │   │   │   └── SupplierTable.php
│   │   │   │
│   │   │   └── Supplier/
│   │   │       └── ProductSubmission.php
│   │   │
│   │   ├── Middleware/
│   │   │   ├── RoleMiddleware.php
│   │   │   ├── SupplierAuth.php
│   │   │   └── CheckSupplierStatus.php
│   │   │
│   │   └── Requests/
│   │       ├── StoreProductRequest.php
│   │       ├── StoreTransactionRequest.php
│   │       └── SupplierRegistrationRequest.php
│   │
│   ├── Models/
│   │   ├── User.php
│   │   ├── Category.php
│   │   ├── Product.php
│   │   ├── Supplier.php
│   │   ├── Transaction.php
│   │   ├── TransactionItem.php
│   │   ├── ConsignmentBatch.php
│   │   ├── ConsignmentSale.php
│   │   ├── Settlement.php
│   │   ├── StockMovement.php
│   │   └── ...
│   │
│   ├── Services/
│   │   ├── PosService.php
│   │   ├── StockService.php
│   │   ├── ConsignmentService.php
│   │   ├── SettlementService.php
│   │   └── InvoiceService.php
│   │
│   └── Traits/
│       ├── HasUuid.php
│       └── LogsActivity.php
│
├── config/
│   └── pos.php               ← Custom POS config
│
├── database/
│   ├── migrations/
│   ├── seeders/
│   │   ├── DatabaseSeeder.php
│   │   ├── UserSeeder.php
│   │   ├── CategorySeeder.php
│   │   └── ProductSeeder.php
│   └── factories/
│
├── resources/
│   ├── views/
│   │   ├── layouts/
│   │   │   ├── app.blade.php
│   │   │   ├── admin.blade.php
│   │   │   ├── kasir.blade.php
│   │   │   └── supplier.blade.php
│   │   │
│   │   ├── components/
│   │   │   ├── button.blade.php
│   │   │   ├── input.blade.php
│   │   │   ├── card.blade.php
│   │   │   └── modal.blade.php
│   │   │
│   │   ├── admin/
│   │   │   ├── dashboard.blade.php
│   │   │   ├── products/
│   │   │   ├── suppliers/
│   │   │   └── consignment/
│   │   │
│   │   ├── kasir/
│   │   │   ├── dashboard.blade.php
│   │   │   └── pos.blade.php
│   │   │
│   │   ├── supplier/
│   │   │   ├── register.blade.php
│   │   │   ├── login.blade.php
│   │   │   ├── dashboard.blade.php
│   │   │   └── products/
│   │   │
│   │   ├── livewire/
│   │   │   └── pos/
│   │   │       ├── pos-main.blade.php
│   │   │       ├── product-grid.blade.php
│   │   │       ├── cart.blade.php
│   │   │       └── checkout.blade.php
│   │   │
│   │   └── auth/
│   │       └── login.blade.php
│   │
│   ├── css/
│   │   └── app.css
│   │
│   └── js/
│       └── app.js
│
├── routes/
│   ├── web.php               ← Main routes
│   ├── admin.php             ← Admin routes
│   ├── kasir.php             ← Kasir routes
│   └── supplier.php          ← Supplier routes
│
├── storage/
├── tests/
├── vendor/
│
├── .env
├── composer.json
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🎨 Coding Conventions

### Models

```php
<?php

namespace App\Models;

use App\Enums\OwnershipType;
use App\Enums\ProductStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasUuid;

    protected $fillable = [
        'name',
        'description',
        'category_id',
        'sku',
        'buy_price',
        'sell_price',
        'stock',
        'threshold',
        'unit',
        'ownership_type',
        'supplier_id',
        'is_consignment',
        'profit_share_rate',
        'status',
        'is_active',
    ];

    protected $casts = [
        'buy_price' => 'decimal:2',
        'sell_price' => 'decimal:2',
        'profit_share_rate' => 'decimal:2',
        'is_consignment' => 'boolean',
        'is_active' => 'boolean',
        'ownership_type' => OwnershipType::class,
        'status' => ProductStatus::class,
    ];

    // Relationships
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function transactionItems(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeLowStock($query)
    {
        return $query->whereRaw('stock <= threshold');
    }

    public function scopeConsignment($query)
    {
        return $query->where('is_consignment', true);
    }

    // Accessors
    public function getFormattedPriceAttribute(): string
    {
        return 'Rp ' . number_format($this->sell_price, 0, ',', '.');
    }

    // Methods
    public function decreaseStock(int $qty): void
    {
        $this->decrement('stock', $qty);
    }

    public function increaseStock(int $qty): void
    {
        $this->increment('stock', $qty);
    }

    public function isLowStock(): bool
    {
        return $this->stock <= $this->threshold;
    }
}
```

### Enums

```php
<?php

namespace App\Enums;

enum Role: string
{
    case SUPER_ADMIN = 'SUPER_ADMIN';
    case ADMIN = 'ADMIN';
    case KASIR = 'KASIR';
    case SUPPLIER = 'SUPPLIER';
    case USER = 'USER';

    public function label(): string
    {
        return match($this) {
            self::SUPER_ADMIN => 'Super Admin',
            self::ADMIN => 'Admin',
            self::KASIR => 'Kasir',
            self::SUPPLIER => 'Supplier',
            self::USER => 'User',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::SUPER_ADMIN => 'red',
            self::ADMIN => 'blue',
            self::KASIR => 'green',
            self::SUPPLIER => 'purple',
            self::USER => 'gray',
        };
    }
}
```

### Services

```php
<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\ConsignmentSale;
use App\Models\StockMovement;
use App\Enums\MovementType;
use App\Enums\TransactionType;
use App\Enums\PaymentMethod;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PosService
{
    public function __construct(
        private StockService $stockService,
        private ConsignmentService $consignmentService,
    ) {}

    public function createTransaction(array $items, PaymentMethod $paymentMethod, ?string $note = null): Transaction
    {
        return DB::transaction(function () use ($items, $paymentMethod, $note) {
            // Generate invoice number
            $invoiceNumber = $this->generateInvoiceNumber();

            // Calculate total
            $totalAmount = collect($items)->sum(fn ($item) => $item['quantity'] * $item['unit_price']);

            // Create transaction
            $transaction = Transaction::create([
                'invoice_number' => $invoiceNumber,
                'type' => TransactionType::SALE,
                'total_amount' => $totalAmount,
                'payment_method' => $paymentMethod,
                'note' => $note,
            ]);

            // Process each item
            foreach ($items as $item) {
                $this->processTransactionItem($transaction, $item);
            }

            return $transaction->load('items.product');
        });
    }

    private function processTransactionItem(Transaction $transaction, array $item): TransactionItem
    {
        $product = Product::findOrFail($item['product_id']);
        
        // Create transaction item
        $transactionItem = TransactionItem::create([
            'transaction_id' => $transaction->id,
            'product_id' => $product->id,
            'quantity' => $item['quantity'],
            'unit_price' => $item['unit_price'],
            'total_price' => $item['quantity'] * $item['unit_price'],
            'cogs_per_unit' => $product->buy_price,
            'total_cogs' => $item['quantity'] * ($product->buy_price ?? 0),
            'gross_profit' => ($item['quantity'] * $item['unit_price']) - ($item['quantity'] * ($product->buy_price ?? 0)),
        ]);

        // Decrease stock
        $this->stockService->decreaseStock($product, $item['quantity'], $transaction);

        // Handle consignment
        if ($product->is_consignment) {
            $this->consignmentService->recordSale($transactionItem, $product);
        }

        return $transactionItem;
    }

    private function generateInvoiceNumber(): string
    {
        $date = now()->format('Ymd');
        $count = Transaction::whereDate('created_at', today())->count() + 1;
        return "INV-{$date}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
```

### Controllers

```php
<?php

namespace App\Http\Controllers\Kasir;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function index(): View
    {
        $todaySales = Transaction::whereDate('date', today())
            ->where('type', 'SALE')
            ->sum('total_amount');

        $todayTransactions = Transaction::whereDate('date', today())
            ->where('type', 'SALE')
            ->count();

        $recentTransactions = Transaction::with('items.product')
            ->whereDate('date', today())
            ->latest()
            ->take(10)
            ->get();

        return view('kasir.dashboard', compact(
            'todaySales',
            'todayTransactions',
            'recentTransactions'
        ));
    }
}
```

### Livewire Components

```php
<?php

namespace App\Http\Livewire\Pos;

use App\Models\Product;
use App\Models\Category;
use App\Services\PosService;
use App\Enums\PaymentMethod;
use Livewire\Component;
use Livewire\Attributes\Computed;

class PosMain extends Component
{
    public array $cart = [];
    public string $search = '';
    public ?string $categoryFilter = null;
    public float $paymentAmount = 0;
    public string $paymentMethod = 'CASH';
    public bool $showCheckout = false;

    protected $listeners = ['productSelected' => 'addToCart'];

    #[Computed]
    public function products()
    {
        return Product::query()
            ->active()
            ->when($this->search, fn($q) => $q->where('name', 'like', "%{$this->search}%"))
            ->when($this->categoryFilter, fn($q) => $q->where('category_id', $this->categoryFilter))
            ->orderBy('name')
            ->get();
    }

    #[Computed]
    public function categories()
    {
        return Category::where('is_active', true)->orderBy('order')->get();
    }

    #[Computed]
    public function cartTotal(): float
    {
        return collect($this->cart)->sum(fn($item) => $item['quantity'] * $item['unit_price']);
    }

    #[Computed]
    public function change(): float
    {
        return max(0, $this->paymentAmount - $this->cartTotal);
    }

    public function addToCart(string $productId): void
    {
        $product = Product::find($productId);
        
        if (!$product) return;

        $key = array_search($productId, array_column($this->cart, 'product_id'));

        if ($key !== false) {
            $this->cart[$key]['quantity']++;
        } else {
            $this->cart[] = [
                'product_id' => $product->id,
                'name' => $product->name,
                'unit_price' => $product->sell_price,
                'quantity' => 1,
                'is_consignment' => $product->is_consignment,
            ];
        }
    }

    public function removeFromCart(int $index): void
    {
        unset($this->cart[$index]);
        $this->cart = array_values($this->cart);
    }

    public function updateQuantity(int $index, int $quantity): void
    {
        if ($quantity <= 0) {
            $this->removeFromCart($index);
            return;
        }
        $this->cart[$index]['quantity'] = $quantity;
    }

    public function checkout(): void
    {
        if (empty($this->cart)) {
            $this->dispatch('notify', type: 'error', message: 'Keranjang kosong!');
            return;
        }

        if ($this->paymentAmount < $this->cartTotal) {
            $this->dispatch('notify', type: 'error', message: 'Pembayaran kurang!');
            return;
        }

        $posService = app(PosService::class);
        
        try {
            $transaction = $posService->createTransaction(
                $this->cart,
                PaymentMethod::from($this->paymentMethod)
            );

            // Reset cart
            $this->cart = [];
            $this->paymentAmount = 0;
            $this->showCheckout = false;

            // Show success & print receipt
            $this->dispatch('transactionComplete', transactionId: $transaction->id);
            $this->dispatch('notify', type: 'success', message: 'Transaksi berhasil!');

        } catch (\Exception $e) {
            $this->dispatch('notify', type: 'error', message: 'Gagal: ' . $e->getMessage());
        }
    }

    public function render()
    {
        return view('livewire.pos.pos-main');
    }
}
```

### Blade Views

```blade
{{-- resources/views/livewire/pos/pos-main.blade.php --}}

<div class="flex h-screen bg-gray-100">
    {{-- Product Panel --}}
    <div class="flex-1 p-4 overflow-auto">
        {{-- Search --}}
        <div class="mb-4">
            <input 
                type="text" 
                wire:model.live.debounce.300ms="search"
                placeholder="Cari produk..."
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
        </div>

        {{-- Categories --}}
        <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
            <button 
                wire:click="$set('categoryFilter', null)"
                @class([
                    'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap',
                    'bg-blue-600 text-white' => !$categoryFilter,
                    'bg-white text-gray-700 hover:bg-gray-100' => $categoryFilter,
                ])
            >
                Semua
            </button>
            @foreach($this->categories as $category)
                <button 
                    wire:click="$set('categoryFilter', '{{ $category->id }}')"
                    @class([
                        'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap',
                        'bg-blue-600 text-white' => $categoryFilter === $category->id,
                        'bg-white text-gray-700 hover:bg-gray-100' => $categoryFilter !== $category->id,
                    ])
                >
                    {{ $category->icon }} {{ $category->name }}
                </button>
            @endforeach
        </div>

        {{-- Product Grid --}}
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            @foreach($this->products as $product)
                <button 
                    wire:click="addToCart('{{ $product->id }}')"
                    class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-left"
                >
                    <div class="text-lg font-medium truncate">{{ $product->name }}</div>
                    <div class="text-blue-600 font-bold">{{ $product->formatted_price }}</div>
                    <div class="text-sm text-gray-500">Stock: {{ $product->stock }}</div>
                    @if($product->is_consignment)
                        <span class="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
                            Konsinyasi
                        </span>
                    @endif
                </button>
            @endforeach
        </div>
    </div>

    {{-- Cart Panel --}}
    <div class="w-96 bg-white shadow-lg flex flex-col">
        <div class="p-4 border-b">
            <h2 class="text-xl font-bold">Keranjang</h2>
        </div>

        {{-- Cart Items --}}
        <div class="flex-1 overflow-auto p-4">
            @forelse($cart as $index => $item)
                <div class="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                    <div class="flex-1">
                        <div class="font-medium">{{ $item['name'] }}</div>
                        <div class="text-sm text-gray-500">
                            Rp {{ number_format($item['unit_price'], 0, ',', '.') }}
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button 
                            wire:click="updateQuantity({{ $index }}, {{ $item['quantity'] - 1 }})"
                            class="w-8 h-8 flex items-center justify-center bg-gray-200 rounded"
                        >-</button>
                        <span class="w-8 text-center">{{ $item['quantity'] }}</span>
                        <button 
                            wire:click="updateQuantity({{ $index }}, {{ $item['quantity'] + 1 }})"
                            class="w-8 h-8 flex items-center justify-center bg-gray-200 rounded"
                        >+</button>
                    </div>
                    <div class="font-bold">
                        Rp {{ number_format($item['quantity'] * $item['unit_price'], 0, ',', '.') }}
                    </div>
                    <button 
                        wire:click="removeFromCart({{ $index }})"
                        class="text-red-500 hover:text-red-700"
                    >✕</button>
                </div>
            @empty
                <div class="text-center text-gray-500 py-8">
                    Keranjang kosong
                </div>
            @endforelse
        </div>

        {{-- Checkout --}}
        <div class="p-4 border-t bg-gray-50">
            <div class="flex justify-between items-center mb-4">
                <span class="text-lg">Total:</span>
                <span class="text-2xl font-bold text-blue-600">
                    Rp {{ number_format($this->cartTotal, 0, ',', '.') }}
                </span>
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium mb-1">Bayar:</label>
                <input 
                    type="number" 
                    wire:model.live="paymentAmount"
                    class="w-full px-4 py-2 border rounded-lg"
                    min="0"
                >
            </div>

            <div class="flex justify-between items-center mb-4">
                <span>Kembalian:</span>
                <span class="text-lg font-bold text-green-600">
                    Rp {{ number_format($this->change, 0, ',', '.') }}
                </span>
            </div>

            <div class="grid grid-cols-2 gap-2 mb-4">
                <button 
                    wire:click="$set('paymentMethod', 'CASH')"
                    @class([
                        'py-2 rounded-lg font-medium',
                        'bg-blue-600 text-white' => $paymentMethod === 'CASH',
                        'bg-gray-200 text-gray-700' => $paymentMethod !== 'CASH',
                    ])
                >
                    💵 Cash
                </button>
                <button 
                    wire:click="$set('paymentMethod', 'TRANSFER')"
                    @class([
                        'py-2 rounded-lg font-medium',
                        'bg-blue-600 text-white' => $paymentMethod === 'TRANSFER',
                        'bg-gray-200 text-gray-700' => $paymentMethod !== 'TRANSFER',
                    ])
                >
                    📱 Transfer
                </button>
            </div>

            <button 
                wire:click="checkout"
                wire:loading.attr="disabled"
                @disabled(empty($cart) || $paymentAmount < $this->cartTotal)
                class="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span wire:loading.remove>🧾 BAYAR & CETAK STRUK</span>
                <span wire:loading>Processing...</span>
            </button>
        </div>
    </div>
</div>
```

---

## 🔧 Common Artisan Commands

```bash
# Make model with migration, factory, seeder, controller, policy
php artisan make:model Product -mfsc --policy

# Make Livewire component
php artisan make:livewire Pos/Cart

# Make enum (manual, or use package)
php artisan make:enum Role

# Make service class (manual)
# Just create file in app/Services/

# Make middleware
php artisan make:middleware RoleMiddleware

# Make request validation
php artisan make:request StoreProductRequest

# Clear all caches
php artisan optimize:clear

# Run tests
php artisan test

# Fresh migrate with seed
php artisan migrate:fresh --seed
```

---

## 📦 Required Packages

```bash
# Livewire
composer require livewire/livewire

# PDF Generation (for receipts)
composer require barryvdh/laravel-dompdf

# Excel Import/Export
composer require maatwebsite/excel

# Image processing
composer require intervention/image

# IDE Helper (dev)
composer require --dev barryvdh/laravel-ide-helper

# Debug Bar (dev)
composer require --dev barryvdh/laravel-debugbar
```

---

## 🧪 Testing

```php
// tests/Feature/PosTest.php

<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Enums\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PosTest extends TestCase
{
    use RefreshDatabase;

    public function test_kasir_can_access_pos()
    {
        $kasir = User::factory()->create(['role' => Role::KASIR]);

        $response = $this->actingAs($kasir)->get('/kasir/pos');

        $response->assertStatus(200);
    }

    public function test_can_create_transaction()
    {
        $kasir = User::factory()->create(['role' => Role::KASIR]);
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'stock' => 100,
            'sell_price' => 10000,
        ]);

        $response = $this->actingAs($kasir)->post('/kasir/pos/checkout', [
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                    'unit_price' => $product->sell_price,
                ]
            ],
            'payment_method' => 'CASH',
            'payment_amount' => 20000,
        ]);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('transactions', [
            'total_amount' => 20000,
        ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock' => 98, // 100 - 2
        ]);
    }
}
```

---

## 📚 Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Livewire Documentation](https://livewire.laravel.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Alpine.js](https://alpinejs.dev/start-here)
