#!/bin/bash

# Quick UAT Deployment Script
# Run this to prepare project for Vercel deployment

echo "🚀 Koperasi UMB - UAT Deployment Setup"
echo "======================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit for UAT deployment"
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo ""
    echo "⚠️  Vercel CLI not found"
    echo "Install with: npm i -g vercel"
    echo ""
    read -p "Install Vercel CLI now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm i -g vercel
    fi
fi

# Generate NEXTAUTH_SECRET
echo ""
echo "🔐 Generating NEXTAUTH_SECRET..."
SECRET=$(openssl rand -base64 32)
echo "Copy this secret for Vercel environment variables:"
echo ""
echo "NEXTAUTH_SECRET=\"$SECRET\""
echo ""

# Instructions
echo "📋 Next Steps:"
echo ""
echo "1. Push code to GitHub:"
echo "   git remote add origin https://github.com/[username]/web-koperasi-umb.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "2. Setup Database (choose one):"
echo "   - PlanetScale: https://planetscale.com (Free)"
echo "   - Railway: https://railway.app (Free tier)"
echo ""
echo "3. Deploy to Vercel:"
echo "   - Web: https://vercel.com/new"
echo "   - CLI: vercel (then follow prompts)"
echo ""
echo "4. Set Environment Variables in Vercel:"
echo "   DATABASE_URL = [your cloud database URL]"
echo "   NEXTAUTH_URL = https://[your-project].vercel.app"
echo "   NEXTAUTH_SECRET = $SECRET"
echo "   NODE_ENV = production"
echo ""
echo "5. After deploy, setup database:"
echo "   npx prisma db push"
echo ""
echo "✨ Full guide available in DEPLOYMENT_UAT_GUIDE.md"
echo ""
