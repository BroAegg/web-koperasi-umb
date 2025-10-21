-- Check for DEVELOPER role users
SELECT 
  id, 
  name, 
  email, 
  role, 
  is_active,
  created_at
FROM users
WHERE role = 'DEVELOPER'
ORDER BY created_at DESC;

-- Check all roles in database
SELECT DISTINCT role FROM users ORDER BY role;
