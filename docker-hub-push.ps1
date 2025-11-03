# Docker Hub Build & Push Script for Web Koperasi UMB
# Usage: .\docker-hub-push.ps1 [username] [version]

param(
    [Parameter(Mandatory=$false)]
    [string]$Username = "broaegg",
    
    [Parameter(Mandatory=$false)]
    [string]$Version = "latest"
)

$ImageName = "web-koperasi-umb"
$FullTag = "${Username}/${ImageName}:${Version}"
$LatestTag = "${Username}/${ImageName}:latest"

Write-Host "🐳 Docker Hub Push Script" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Image: $FullTag" -ForegroundColor Yellow
Write-Host ""

# Step 1: Check Docker login
Write-Host "📝 Step 1: Checking Docker login..." -ForegroundColor Yellow
$dockerInfo = docker info 2>&1 | Select-String "Username"
if ($dockerInfo) {
    Write-Host "✅ Already logged in" -ForegroundColor Green
} else {
    Write-Host "⚠️  Not logged in. Please login:" -ForegroundColor Yellow
    docker login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Login failed!" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Build production image
Write-Host ""
Write-Host "🏗️ Step 2: Building production image..." -ForegroundColor Yellow
Write-Host "This may take 10-15 minutes..." -ForegroundColor Gray
docker build -f Dockerfile.production -t $FullTag .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful!" -ForegroundColor Green

# Step 3: Tag as latest (if not already latest)
if ($Version -ne "latest") {
    Write-Host ""
    Write-Host "🏷️ Step 3: Tagging as latest..." -ForegroundColor Yellow
    docker tag $FullTag $LatestTag
    Write-Host "✅ Tagged as latest" -ForegroundColor Green
}

# Step 4: Show image details
Write-Host ""
Write-Host "📦 Image Details:" -ForegroundColor Yellow
docker images $FullTag

# Step 5: Push to Docker Hub
Write-Host ""
Write-Host "📤 Step 4: Pushing to Docker Hub..." -ForegroundColor Yellow
Write-Host "This may take 5-15 minutes depending on your connection..." -ForegroundColor Gray

docker push $FullTag
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Push failed!" -ForegroundColor Red
    exit 1
}

# Push latest tag if different
if ($Version -ne "latest") {
    Write-Host ""
    Write-Host "📤 Pushing latest tag..." -ForegroundColor Yellow
    docker push $LatestTag
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Push latest failed!" -ForegroundColor Red
        exit 1
    }
}

# Success!
Write-Host ""
Write-Host "🎉 Success! Image pushed to Docker Hub" -ForegroundColor Green
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📦 Your image is now public at:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   docker pull $FullTag" -ForegroundColor White
Write-Host ""
Write-Host "🔗 View on Docker Hub:" -ForegroundColor Cyan
Write-Host "   https://hub.docker.com/r/$Username/$ImageName" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Others can run it with:" -ForegroundColor Cyan
Write-Host "   docker run -d -p 3000:3000 $FullTag" -ForegroundColor White
Write-Host ""
Write-Host "📋 Or with docker-compose:" -ForegroundColor Cyan
Write-Host "   docker-compose -f docker-compose.hub.yml up -d" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan