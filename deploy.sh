#!/bin/bash
# 🚀 KOPERASI UMB - AUTOMATED CPANEL DEPLOYMENT SCRIPT
# This script will be executed in cPanel Terminal

echo "🚀 Starting Koperasi UMB Deployment..."
echo "=================================================="

# Navigate to application directory
cd /home/mekh7277/public_html

# Check if files exist
echo "📋 Checking deployment files..."
if [ ! -f "server.js" ]; then
    echo "❌ server.js not found! Please upload deployment files first."
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ package.json not found! Please upload deployment files first."
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "❌ .env not found! Please rename .env.production.ready to .env"
    exit 1
fi

echo "✅ All required files found!"

# Set proper permissions
echo "🔧 Setting file permissions..."
chmod 644 *.js *.json *.env
chmod 755 server.js
chmod -R 755 .next/
chmod -R 755 public/

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install --production --no-audit --no-fund

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies!"
    exit 1
fi

echo "✅ Dependencies installed successfully!"

# Check Node.js version
echo "🔍 Checking Node.js version..."
node --version
npm --version

# Test database connection
echo "🗄️ Testing database connection..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.\$connect();
    console.log('✅ Database connection successful!');
    await prisma.\$disconnect();
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
"

# Start the application
echo "🚀 Starting Koperasi UMB application..."
export NODE_ENV=production

# Kill any existing Node.js processes
pkill -f "node server.js" 2>/dev/null || true

# Start the application in background
nohup node server.js > app.log 2>&1 &
APP_PID=$!

# Wait a moment for startup
sleep 3

# Check if application started successfully
if ps -p $APP_PID > /dev/null; then
    echo "✅ Application started successfully!"
    echo "🌐 Application should be available at: https://mekarmukti.id"
    echo "👤 Default login: admin@mekarmukti.id / admin123"
    echo "📊 Process ID: $APP_PID"
    echo "📝 Logs: tail -f /home/mekh7277/public_html/app.log"
else
    echo "❌ Failed to start application!"
    echo "📝 Check logs: cat /home/mekh7277/public_html/app.log"
    exit 1
fi

echo "=================================================="
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "=================================================="