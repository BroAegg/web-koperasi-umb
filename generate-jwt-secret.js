#!/usr/bin/env node

/**
 * 🔐 JWT SECRET GENERATOR
 * Simple tool to generate secure JWT secrets for production
 * 
 * Usage: node generate-jwt-secret.js
 */

const crypto = require('crypto');

console.log('\n' + '='.repeat(60));
console.log('🔐 JWT SECRET GENERATOR');
console.log('='.repeat(60) + '\n');

// Generate 3 different secrets untuk pilihan
console.log('Generated 3 secure JWT secrets (pick one):\n');

for (let i = 1; i <= 3; i++) {
  const secret = crypto.randomBytes(48).toString('base64');
  console.log(`Option ${i}:`);
  console.log(`JWT_SECRET="${secret}"`);
  console.log('');
}

console.log('='.repeat(60));
console.log('📋 HOW TO USE:');
console.log('1. Copy one of the JWT_SECRET lines above');
console.log('2. Paste it into your .env file');
console.log('3. Save the file');
console.log('4. NEVER commit .env to Git!');
console.log('='.repeat(60) + '\n');

// Also show in format ready to paste
const finalSecret = crypto.randomBytes(48).toString('base64');
console.log('✅ READY TO PASTE (Recommended):');
console.log('─'.repeat(60));
console.log(`JWT_SECRET="${finalSecret}"`);
console.log('─'.repeat(60) + '\n');

console.log('💡 Tips:');
console.log('- Each secret is 64 characters (base64 encoded)');
console.log('- These are cryptographically secure random strings');
console.log('- Use different secrets for dev/staging/production');
console.log('- Store production secret in password manager\n');
