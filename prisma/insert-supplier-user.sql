-- Insert Supplier User
-- Email: supplier
-- Password: password (hashed with bcrypt)
-- Role: SUPPLIER

-- Note: The password hash below is for "password" with bcrypt salt rounds 10
-- Hash: $2a$10$veGac3gD.87G12rBI7ENGueMW060NX5EBNT4WLfrZ0.rie.mSpknm

INSERT INTO users (id, email, password, name, role, isActive, mustChangePassword, createdAt, updatedAt)
VALUES (
  'supplier-001',
  'supplier',
  '$2a$10$veGac3gD.87G12rBI7ENGueMW060NX5EBNT4WLfrZ0.rie.mSpknm',
  'Supplier',
  'SUPPLIER',
  1,  -- isActive = true
  0,  -- mustChangePassword = false
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  password = VALUES(password),
  updatedAt = NOW();

-- Verification query
SELECT id, email, name, role, isActive FROM users WHERE email = 'supplier';
