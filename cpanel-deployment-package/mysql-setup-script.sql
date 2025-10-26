-- ========================================
-- MYSQL DATABASE SETUP FOR MEKARMUKTI.ID
-- Koperasi UMB Production Database
-- ========================================

-- Step 1: Create Database (Execute in cPanel MySQL Databases)
-- Database Name: mekarmuk_koperasi
-- Username: mekarmuk_admin  
-- Password: [SECURE_PASSWORD]

-- Step 2: Grant Privileges
-- GRANT ALL PRIVILEGES ON mekarmuk_koperasi.* TO 'mekarmuk_admin'@'localhost';
-- FLUSH PRIVILEGES;

-- Step 3: Use Database
USE mekarmuk_koperasi;

-- ========================================
-- CREATE INITIAL ADMIN USER
-- ========================================

-- Create Super Admin User
-- Password: admin123 (CHANGE IMMEDIATELY AFTER FIRST LOGIN)
INSERT INTO users (
    id, 
    email, 
    password, 
    name, 
    role, 
    isActive, 
    createdAt, 
    updatedAt
) VALUES (
    'admin-super-001',
    'admin@mekarmukti.id',
    '$2b$12$8mJxUq1qvJC8dn2.nXmJFOW8UfK8J5S2W6QrGkx9kT2Uj5K8L7P3O',
    'Super Administrator',
    'SUPER_ADMIN',
    1,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE email = email;

-- ========================================
-- CREATE BASIC CATEGORIES
-- ========================================

INSERT INTO categories (id, name, description, createdAt, updatedAt) VALUES
('cat-001', 'Makanan Ringan', 'Snack dan makanan ringan', NOW(), NOW()),
('cat-002', 'Minuman', 'Minuman segar dan kemasan', NOW(), NOW()),
('cat-003', 'Kue & Roti', 'Kue basah dan roti', NOW(), NOW()),
('cat-004', 'Alat Tulis', 'Perlengkapan kantor dan sekolah', NOW(), NOW()),
('cat-005', 'Perlengkapan', 'Barang kebutuhan umum', NOW(), NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ========================================
-- POST-IMPORT INSTRUCTIONS
-- ========================================

-- 1. Verify tables created successfully:
--    SHOW TABLES;

-- 2. Check admin user created:
--    SELECT * FROM users WHERE role = 'SUPER_ADMIN';

-- 3. Test login with:
--    Email: admin@mekarmukti.id
--    Password: admin123

-- 4. IMPORTANT: Change admin password immediately after first login!

-- 5. Update .env file with correct DATABASE_URL:
--    DATABASE_URL="mysql://mekarmuk_admin:[YOUR_PASSWORD]@localhost:3306/mekarmuk_koperasi"

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check database structure
-- DESCRIBE users;
-- DESCRIBE categories;
-- DESCRIBE products;
-- DESCRIBE transactions;

-- Check initial data
-- SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'mekarmuk_koperasi';
-- SELECT COUNT(*) as total_users FROM users;
-- SELECT COUNT(*) as total_categories FROM categories;

-- ========================================
-- BACKUP COMMANDS (for later use)
-- ========================================

-- Create backup:
-- mysqldump -u mekarmuk_admin -p mekarmuk_koperasi > backup_$(date +%Y%m%d).sql

-- Restore backup:
-- mysql -u mekarmuk_admin -p mekarmuk_koperasi < backup_file.sql