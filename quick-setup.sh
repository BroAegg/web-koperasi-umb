#!/bin/bash
# Quick Setup Script untuk Web Koperasi UMB (Local Development)
# Jalankan: bash quick-setup.sh

echo "🚀 Web Koperasi UMB - Quick Setup Script"
echo "========================================"
echo ""

# Check Node.js
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js belum terinstall!"
    echo "   Install dari: https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js version: $(node --version)"

if ! command -v npm &> /dev/null; then
    echo "❌ npm belum terinstall!"
    exit 1
fi
echo "✅ npm version: $(npm --version)"

# Check MySQL (XAMPP)
echo ""
echo "📋 Checking MySQL..."
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL command not found in PATH"
    echo "   Pastikan XAMPP MySQL sudah running!"
    echo "   Linux: sudo /opt/lampp/lampp status"
    echo "   Windows: Check XAMPP Control Panel"
else
    echo "✅ MySQL found"
fi

# Check if .env.local exists
echo ""
echo "📋 Checking environment config..."
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local tidak ditemukan!"
    echo "   File sudah dibuat secara otomatis."
    echo "   Edit jika perlu ganti password MySQL."
else
    echo "✅ .env.local exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
echo "   (Ini akan memakan waktu 2-5 menit)"
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed!"
    echo "   Coba: npm cache clean --force"
    echo "   Lalu: npm install lagi"
    exit 1
fi
echo "✅ Dependencies installed"

# Generate Prisma Client
echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Prisma generate failed!"
    exit 1
fi
echo "✅ Prisma Client generated"

# Push schema to database
echo ""
echo "🗄️  Setting up database..."
echo "   Pastikan database 'koperasi_umb' sudah dibuat!"
echo "   Tekan Enter untuk continue, atau Ctrl+C untuk cancel..."
read

npx prisma db push

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Database push failed!"
    echo ""
    echo "Troubleshooting:"
    echo "1. Pastikan MySQL XAMPP sudah running"
    echo "2. Database 'koperasi_umb' sudah dibuat di phpMyAdmin"
    echo "3. Check .env.local - DATABASE_URL sudah benar"
    echo "4. Test koneksi: mysql -u root -p koperasi_umb"
    exit 1
fi
echo "✅ Database schema synced"

# Seed default users
echo ""
echo "🌱 Seeding default users..."
npx tsx prisma/seed-auth.ts

if [ $? -ne 0 ]; then
    echo "⚠️  Seeding failed (tapi tidak fatal)"
    echo "   Bisa jalankan manual: npx tsx prisma/seed-auth.ts"
else
    echo "✅ Default users created"
fi

# Summary
echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Start development server:"
echo "   npm run dev"
echo ""
echo "2. Open browser:"
echo "   http://localhost:3000"
echo ""
echo "3. Login dengan:"
echo "   Email: manager@umb.ac.id"
echo "   Password: KoperasiUMB2025"
echo ""
echo "📚 Documentation:"
echo "   - Setup Guide: SETUP_GUIDE_LOCAL.md"
echo "   - README: README.md"
echo ""
echo "🔧 Troubleshooting:"
echo "   - Check MySQL: sudo /opt/lampp/lampp status"
echo "   - View logs: Check terminal output"
echo "   - Database GUI: npx prisma studio"
echo ""
