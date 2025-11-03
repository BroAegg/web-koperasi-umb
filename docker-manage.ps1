# 🐳 Docker Management Script for Web Koperasi UMB
# PowerShell version

function Show-Help {
    Write-Host "🐳 Web Koperasi UMB - Docker Management" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Available Commands:" -ForegroundColor Yellow
    Write-Host "  build       - Build Docker image"
    Write-Host "  start       - Start all Docker services"
    Write-Host "  stop        - Stop all Docker services"
    Write-Host "  restart     - Restart all services"
    Write-Host "  logs        - Show application logs"
    Write-Host "  status      - Show container status"
    Write-Host "  shell       - Access app container shell"
    Write-Host "  db          - Access database shell"
    Write-Host "  clean       - Clean unused Docker resources"
    Write-Host ""
    Write-Host "URLs when running:" -ForegroundColor Green
    Write-Host "  App:     http://localhost:3002"
    Write-Host "  Adminer: http://localhost:8082"
    Write-Host "  Database: localhost:3308"
    Write-Host ""
}

function Build-App {
    Write-Host "🏗️ Building Docker image..." -ForegroundColor Yellow
    docker build -f Dockerfile.fast -t web-koperasi-umb:fast .
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed!" -ForegroundColor Red
    }
}

function Start-Services {
    Write-Host "🚀 Starting Docker services..." -ForegroundColor Yellow
    docker-compose -f docker-compose.fast.yml up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Services started!" -ForegroundColor Green
        Write-Host "🌐 Access: http://localhost:3002" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Failed to start services!" -ForegroundColor Red
    }
}

function Stop-Services {
    Write-Host "🛑 Stopping Docker services..." -ForegroundColor Yellow
    docker-compose -f docker-compose.fast.yml down
    Write-Host "✅ Services stopped!" -ForegroundColor Green
}

function Restart-Services {
    Write-Host "🔄 Restarting Docker services..." -ForegroundColor Yellow
    docker-compose -f docker-compose.fast.yml restart
    Write-Host "✅ Services restarted!" -ForegroundColor Green
}

function Show-Logs {
    Write-Host "📄 Showing application logs..." -ForegroundColor Yellow
    docker-compose -f docker-compose.fast.yml logs -f app
}

function Show-Status {
    Write-Host "📊 Container Status:" -ForegroundColor Yellow
    docker-compose -f docker-compose.fast.yml ps
    Write-Host ""
    Write-Host "🔗 Service URLs:" -ForegroundColor Cyan
    Write-Host "  Web App:  http://localhost:3002"
    Write-Host "  Adminer:  http://localhost:8082"
    Write-Host "  Database: localhost:3308"
}

function Access-Shell {
    Write-Host "🐚 Accessing app container..." -ForegroundColor Yellow
    docker-compose -f docker-compose.fast.yml exec app sh
}

function Access-Database {
    Write-Host "🗄️ Accessing database..." -ForegroundColor Yellow
    docker-compose -f docker-compose.fast.yml exec database mysql -u koperasi_user -pKoperasiUMB2025! koperasi_umb
}

function Clean-Docker {
    Write-Host "🧹 Cleaning Docker resources..." -ForegroundColor Yellow
    docker system prune -f
    docker volume prune -f
    Write-Host "✅ Cleanup completed!" -ForegroundColor Green
}

# Main script logic
param(
    [Parameter(Position=0)]
    [string]$Command
)

switch ($Command) {
    "build"    { Build-App }
    "start"    { Start-Services }
    "stop"     { Stop-Services }
    "restart"  { Restart-Services }
    "logs"     { Show-Logs }
    "status"   { Show-Status }
    "shell"    { Access-Shell }
    "db"       { Access-Database }
    "clean"    { Clean-Docker }
    default    { Show-Help }
}