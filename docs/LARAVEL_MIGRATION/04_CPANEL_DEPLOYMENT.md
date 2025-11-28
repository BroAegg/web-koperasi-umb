# 🚀 cPanel Deployment Guide - Rumahweb

## Prerequisites

- Paket hosting Rumahweb dengan PHP 8.2+
- Akses cPanel melalui Clientzone
- Domain sudah terhubung
- MySQL database

---

## 📋 Step-by-Step Deployment

### Step 1: Persiapan Lokal

#### 1.1 Build untuk Production

```bash
# Pastikan di folder project
cd laravel-pos-koperasi

# Install dependencies
composer install --optimize-autoloader --no-dev

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### 1.2 Update .env untuk Production

```env
APP_NAME="POS Koperasi"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

SESSION_DRIVER=file
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
```

---

### Step 2: Setup di cPanel Rumahweb

#### 2.1 Login ke cPanel

1. Login ke Clientzone Rumahweb
2. Klik "Login cPanel" pada paket hosting

#### 2.2 Buat Database MySQL

1. Buka **MySQL® Databases**
2. **Create New Database**: `koperasi_pos`
3. **Create New User**: `koperasi_user` dengan password kuat
4. **Add User to Database**: Pilih user dan database, berikan **ALL PRIVILEGES**
5. Catat nama lengkap: `cpanelusername_koperasi_pos`

#### 2.3 Setup PHP Version

1. Buka **MultiPHP Manager**
2. Pilih domain Anda
3. Set PHP version ke **8.2** atau lebih tinggi
4. Klik **Apply**

#### 2.4 PHP Extensions

1. Buka **Select PHP Version** atau **MultiPHP INI Editor**
2. Pastikan extensions ini aktif:
   - `bcmath`
   - `ctype`
   - `curl`
   - `dom`
   - `fileinfo`
   - `gd`
   - `json`
   - `mbstring`
   - `openssl`
   - `pdo`
   - `pdo_mysql`
   - `tokenizer`
   - `xml`

---

### Step 3: Upload Files

#### 3.1 Struktur Folder

**PENTING**: Di shared hosting, struktur harus seperti ini:

```
/home/username/
├── laravel-pos/              ← Folder Laravel (DI LUAR public_html!)
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   ├── vendor/
│   ├── .env
│   └── ...
│
└── public_html/              ← Document Root (HANYA isi dari /public)
    ├── index.php            ← Modified
    ├── .htaccess
    ├── css/
    ├── js/
    ├── images/
    └── ...
```

#### 3.2 Upload via File Manager

**Metode 1: Upload ZIP**

1. Buat ZIP dari folder project (exclude `node_modules`, `.git`)
2. Buka **File Manager** di cPanel
3. Navigate ke `/home/username/`
4. Upload dan Extract ZIP
5. Rename folder jadi `laravel-pos`

**Metode 2: Git (Jika tersedia)**

```bash
cd /home/username
git clone https://github.com/yourusername/laravel-pos-koperasi.git laravel-pos
```

#### 3.3 Setup Public Folder

1. Pindahkan isi folder `laravel-pos/public/*` ke `public_html/`
2. Edit `public_html/index.php`:

```php
<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../laravel-pos/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../laravel-pos/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require_once __DIR__.'/../laravel-pos/bootstrap/app.php')
    ->handleRequest(Request::capture());
```

#### 3.4 File Permissions

Via **File Manager** atau **Terminal**:

```bash
# Folder storage dan bootstrap/cache harus writable
chmod -R 775 /home/username/laravel-pos/storage
chmod -R 775 /home/username/laravel-pos/bootstrap/cache

# Owner harus user cPanel
chown -R username:username /home/username/laravel-pos
```

---

### Step 4: Setup .htaccess

#### 4.1 public_html/.htaccess

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Force HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
    
    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]
    
    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Prevent access to sensitive files
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>

# PHP settings (if allowed)
<IfModule mod_php.c>
    php_value upload_max_filesize 10M
    php_value post_max_size 10M
    php_value max_execution_time 300
    php_value memory_limit 256M
</IfModule>
```

---

### Step 5: Configure Environment

#### 5.1 Update .env

Edit `/home/username/laravel-pos/.env`:

```env
APP_NAME="POS Koperasi UMB"
APP_ENV=production
APP_KEY=base64:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
APP_DEBUG=false
APP_TIMEZONE=Asia/Jakarta
APP_URL=https://yourdomain.com

LOG_CHANNEL=daily
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=cpanelusername_koperasi_pos
DB_USERNAME=cpanelusername_koperasi_user
DB_PASSWORD=your_secure_password

SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_ENCRYPT=false

CACHE_STORE=file

FILESYSTEM_DISK=local

QUEUE_CONNECTION=sync
```

#### 5.2 Generate App Key

Via cPanel **Terminal** atau SSH:

```bash
cd /home/username/laravel-pos
php artisan key:generate
```

---

### Step 6: Run Migrations

Via cPanel **Terminal**:

```bash
cd /home/username/laravel-pos

# Run migrations
php artisan migrate --force

# Run seeders
php artisan db:seed --force

# Atau sekaligus
php artisan migrate:fresh --seed --force
```

---

### Step 7: Setup Storage Link

```bash
cd /home/username/laravel-pos

# Buat symlink
php artisan storage:link

# Atau manual jika tidak work
ln -s /home/username/laravel-pos/storage/app/public /home/username/public_html/storage
```

---

### Step 8: Optimize for Production

```bash
cd /home/username/laravel-pos

# Cache config
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer dump-autoload --optimize
```

---

### Step 9: Setup Cron Job (Optional)

Jika pakai Laravel Scheduler:

1. Buka **Cron Jobs** di cPanel
2. Add new cron job:
   - **Minute**: `*`
   - **Hour**: `*`
   - **Day**: `*`
   - **Month**: `*`
   - **Weekday**: `*`
   - **Command**: 
   ```
   cd /home/username/laravel-pos && php artisan schedule:run >> /dev/null 2>&1
   ```

---

## 🔧 Troubleshooting

### Error 500

1. Check `.env` exists dan APP_KEY terisi
2. Check permissions pada `storage/` dan `bootstrap/cache/`
3. Check log: `storage/logs/laravel.log`

### Database Connection Error

1. Verify database name, user, password di `.env`
2. Pastikan user sudah di-assign ke database
3. Check hostname (biasanya `localhost`)

### Blank Page

1. Enable APP_DEBUG=true temporarily
2. Check PHP error logs di cPanel
3. Verify PHP version >= 8.2

### Storage/Upload Issues

1. Check symlink storage
2. Verify folder permissions
3. Check disk space

### Route Not Found (404)

1. Verify `.htaccess` exists dan benar
2. Check mod_rewrite enabled
3. Run `php artisan route:clear` dan `route:cache`

---

## 📁 File Structure Summary

```
/home/username/
│
├── laravel-pos/                    [755]
│   ├── app/                        [755]
│   ├── bootstrap/
│   │   └── cache/                  [775] ← Writable
│   ├── config/                     [755]
│   ├── database/                   [755]
│   ├── resources/                  [755]
│   ├── routes/                     [755]
│   ├── storage/                    [775] ← Writable
│   │   ├── app/
│   │   │   └── public/             [775]
│   │   ├── framework/
│   │   │   ├── cache/              [775]
│   │   │   ├── sessions/           [775]
│   │   │   └── views/              [775]
│   │   └── logs/                   [775]
│   ├── vendor/                     [755]
│   ├── .env                        [644] ← Secured
│   ├── artisan                     [755]
│   └── composer.json               [644]
│
└── public_html/                    [755]
    ├── index.php                   [644] ← Modified path
    ├── .htaccess                   [644]
    ├── css/                        [755]
    ├── js/                         [755]
    ├── images/                     [755]
    ├── storage -> symlink          [777]
    └── favicon.ico                 [644]
```

---

## 🔒 Security Checklist

- [ ] APP_DEBUG = false
- [ ] APP_ENV = production
- [ ] .env tidak bisa diakses publik
- [ ] HTTPS enabled
- [ ] Database credentials aman
- [ ] Folder permissions benar
- [ ] .htaccess security headers aktif
- [ ] Backup strategy ready

---

## 🔄 Update/Maintenance

### Update Code

```bash
cd /home/username/laravel-pos

# Pull latest
git pull origin main

# Install dependencies
composer install --optimize-autoloader --no-dev

# Run migrations
php artisan migrate --force

# Clear & rebuild cache
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Maintenance Mode

```bash
# Enable maintenance
php artisan down --secret="your-secret-token"

# Access via: https://yourdomain.com/your-secret-token

# Disable maintenance
php artisan up
```

---

## 📞 Support

Jika ada kendala:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check cPanel error logs
3. Contact Rumahweb support untuk issue server
4. Refer ke Laravel documentation

---

## ✅ Post-Deployment Checklist

- [ ] Website accessible via HTTPS
- [ ] Login page works
- [ ] Can create test transaction
- [ ] Can register supplier
- [ ] Database backup scheduled
- [ ] Monitoring aktif
