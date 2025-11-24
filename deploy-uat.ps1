# Koperasi UMB - UAT Deployment (Windows PowerShell)
# Run this to prepare project for Vercel deployment

Write-Host "🚀 Koperasi UMB - UAT Deployment Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-Not (Test-Path .git)) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit for UAT deployment"
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git already initialized" -ForegroundColor Green
}

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-Not $vercelInstalled) {
    Write-Host ""
    Write-Host "⚠️  Vercel CLI not found" -ForegroundColor Yellow
    Write-Host "Install with: npm i -g vercel" -ForegroundColor Yellow
    Write-Host ""
    $install = Read-Host "Install Vercel CLI now? (y/n)"
    if ($install -eq "y" -or $install -eq "Y") {
        npm i -g vercel
    }
}

# Generate NEXTAUTH_SECRET
Write-Host ""
Write-Host "🔐 Generating NEXTAUTH_SECRET..." -ForegroundColor Yellow
$bytes = New-Object Byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$SECRET = [Convert]::ToBase64String($bytes)
Write-Host "Copy this secret for Vercel environment variables:" -ForegroundColor Green
Write-Host ""
Write-Host "NEXTAUTH_SECRET=`"$SECRET`"" -ForegroundColor Cyan
Write-Host ""

# Instructions
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Push code to GitHub:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/[username]/web-koperasi-umb.git" -ForegroundColor Gray
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Setup Database (choose one):" -ForegroundColor White
Write-Host "   - PlanetScale: https://planetscale.com (Free)" -ForegroundColor Gray
Write-Host "   - Railway: https://railway.app (Free tier)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Deploy to Vercel:" -ForegroundColor White
Write-Host "   - Web: https://vercel.com/new" -ForegroundColor Gray
Write-Host "   - CLI: vercel (then follow prompts)" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Set Environment Variables in Vercel:" -ForegroundColor White
Write-Host "   DATABASE_URL = [your cloud database URL]" -ForegroundColor Gray
Write-Host "   NEXTAUTH_URL = https://[your-project].vercel.app" -ForegroundColor Gray
Write-Host "   NEXTAUTH_SECRET = $SECRET" -ForegroundColor Gray
Write-Host "   NODE_ENV = production" -ForegroundColor Gray
Write-Host ""
Write-Host "5. After deploy, setup database:" -ForegroundColor White
Write-Host "   npx prisma db push" -ForegroundColor Gray
Write-Host ""
Write-Host "✨ Full guide available in DEPLOYMENT_UAT_GUIDE.md" -ForegroundColor Green
Write-Host ""

# Keep window open
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
