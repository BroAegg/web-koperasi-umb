#!/bin/bash
# =====================================================
# DATABASE EXPORT SCRIPT FOR CPANEL DEPLOYMENT
# =====================================================

echo "🗃️  Preparing database for cPanel deployment..."

# 1. Generate clean database schema
echo "📋 Generating schema..."
npx prisma db pull --print > database-schema-export.sql

# 2. Generate Prisma client for production
echo "🔧 Generating Prisma client..."
npx prisma generate

# 3. Create database dump (if needed)
echo "💾 Creating database structure dump..."
# For PostgreSQL (development)
# pg_dump -h localhost -U your_user -d koperasi_dev --schema-only > db-structure.sql

# For production MySQL (what you'll need on cPanel)
echo "-- MySQL Database Structure for cPanel" > mysql-structure.sql
echo "-- Generated on: $(date)" >> mysql-structure.sql
echo "-- " >> mysql-structure.sql
echo "-- Instructions:" >> mysql-structure.sql
echo "-- 1. Create database in cPanel MySQL" >> mysql-structure.sql  
echo "-- 2. Import this file via phpMyAdmin" >> mysql-structure.sql
echo "-- 3. Update .env with correct DATABASE_URL" >> mysql-structure.sql
echo "-- " >> mysql-structure.sql

# Note: You'll need to convert PostgreSQL schema to MySQL manually
# or use prisma migrate deploy on production with MySQL DATABASE_URL

echo "✅ Database export completed!"
echo "📁 Files created:"
echo "   - database-schema-export.sql (Prisma schema)"
echo "   - mysql-structure.sql (Manual structure template)"
echo ""
echo "🚨 IMPORTANT:"
echo "   - Convert to MySQL format for cPanel"
echo "   - Update DATABASE_URL in .env.production"
echo "   - Test connection before deploying"