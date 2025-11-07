# MySQL Database Backup Script for Koperasi UMB
# Windows PowerShell Version
# 
# Usage: .\scripts\backup-database.ps1
# 
# This script creates a timestamped backup of the MySQL database
# and stores it in the backups/ directory

# Configuration
$BACKUP_DIR = "backups"
$DB_CONTAINER = "d87627ed7e7e_koperasi-mysql"
$DB_NAME = "koperasi_umb"
$DB_USER = "koperasi_user"
$DB_PASSWORD = "KoperasiUMB2025!"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR\koperasi_umb_$TIMESTAMP.sql"
$MAX_BACKUPS = 30  # Keep last 30 backups

# Create backup directory if it doesn't exist
if (-Not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
    Write-Host "📁 Created backup directory: $BACKUP_DIR"
}

# Start backup process
Write-Host ""
Write-Host "🚀 Starting database backup..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "⏰ Timestamp: $TIMESTAMP"
Write-Host "📦 Database: $DB_NAME"
Write-Host "💾 Backup file: $BACKUP_FILE"
Write-Host ""

try {
    # Check if Docker container is running
    $containerStatus = docker ps --filter "name=$DB_CONTAINER" --format "{{.Status}}"
    
    if (-Not $containerStatus) {
        Write-Host "❌ Error: MySQL container is not running!" -ForegroundColor Red
        Write-Host "   Please start Docker container first with: docker-compose up -d"
        exit 1
    }
    
    Write-Host "✅ MySQL container is running" -ForegroundColor Green
    
    # Create mysqldump backup
    Write-Host "📤 Exporting database..."
    
    $dumpCommand = "mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME"
    docker exec $DB_CONTAINER sh -c $dumpCommand | Out-File -FilePath $BACKUP_FILE -Encoding utf8
    
    if ($LASTEXITCODE -ne 0) {
        throw "mysqldump failed with exit code $LASTEXITCODE"
    }
    
    # Check if backup file was created and has content
    if (Test-Path $BACKUP_FILE) {
        $fileSize = (Get-Item $BACKUP_FILE).Length
        $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
        
        if ($fileSize -gt 0) {
            Write-Host "✅ Backup created successfully!" -ForegroundColor Green
            Write-Host "   Size: $fileSizeMB MB"
            Write-Host "   Location: $BACKUP_FILE"
        } else {
            throw "Backup file is empty"
        }
    } else {
        throw "Backup file was not created"
    }
    
    # Cleanup old backups (keep last N backups)
    Write-Host ""
    Write-Host "🧹 Cleaning up old backups (keeping last $MAX_BACKUPS)..."
    
    $backups = Get-ChildItem -Path $BACKUP_DIR -Filter "koperasi_umb_*.sql" | 
               Sort-Object LastWriteTime -Descending
    
    $backupCount = $backups.Count
    
    if ($backupCount -gt $MAX_BACKUPS) {
        $toDelete = $backups | Select-Object -Skip $MAX_BACKUPS
        $deleteCount = $toDelete.Count
        
        foreach ($file in $toDelete) {
            Remove-Item $file.FullName -Force
            Write-Host "   🗑️  Deleted old backup: $($file.Name)"
        }
        
        Write-Host "✅ Deleted $deleteCount old backup(s)" -ForegroundColor Green
    } else {
        Write-Host "✅ No old backups to delete (total: $backupCount)" -ForegroundColor Green
    }
    
    # Summary
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host "🎉 Backup completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Backup Summary:"
    Write-Host "   Database: $DB_NAME"
    Write-Host "   File: $BACKUP_FILE"
    Write-Host "   Size: $fileSizeMB MB"
    Write-Host "   Total backups: $backupCount"
    Write-Host ""
    Write-Host "💡 To restore this backup, run:"
    Write-Host "   .\scripts\restore-database.ps1 $BACKUP_FILE"
    Write-Host ""
    
    exit 0
    
} catch {
    Write-Host ""
    Write-Host "❌ Backup failed!" -ForegroundColor Red
    Write-Host "   Error: $_"
    Write-Host ""
    
    # Cleanup failed backup file if it exists
    if (Test-Path $BACKUP_FILE) {
        Remove-Item $BACKUP_FILE -Force
        Write-Host "Cleaned up incomplete backup file"
    }
    
    exit 1
}
