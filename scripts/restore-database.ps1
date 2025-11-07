# MySQL Database Restore Script for Koperasi UMB
# Windows PowerShell Version
#
# Usage: .\scripts\restore-database.ps1 <backup-file>
# Example: .\scripts\restore-database.ps1 backups\koperasi_umb_20251103_163000.sql
#
# This script restores a MySQL database from a backup file

param(
    [Parameter(Mandatory=$false)]
    [string]$BackupFile
)

# Configuration
$DB_CONTAINER = "d87627ed7e7e_koperasi-mysql"
$DB_NAME = "koperasi_umb"
$DB_USER = "koperasi_user"
$DB_PASSWORD = "KoperasiUMB2025!"

# Function to list available backups
function Show-AvailableBackups {
    Write-Host ""
    Write-Host "📦 Available backups:" -ForegroundColor Cyan
    Write-Host ""
    
    if (Test-Path "backups") {
        $backups = Get-ChildItem -Path "backups" -Filter "koperasi_umb_*.sql" | 
                   Sort-Object LastWriteTime -Descending
        
        if ($backups.Count -eq 0) {
            Write-Host "   No backups found in backups/ directory" -ForegroundColor Yellow
            return
        }
        
        $index = 1
        foreach ($backup in $backups) {
            $size = [math]::Round($backup.Length / 1MB, 2)
            $date = $backup.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
            Write-Host "   [$index] $($backup.Name)" -ForegroundColor White
            Write-Host "       Size: $size MB | Date: $date" -ForegroundColor Gray
            $index++
        }
    } else {
        Write-Host "   Backup directory not found" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Show header
Write-Host ""
Write-Host "🔄 Database Restore Tool" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""

# If no backup file specified, show available backups and exit
if (-Not $BackupFile) {
    Write-Host "⚠️  No backup file specified!" -ForegroundColor Yellow
    Show-AvailableBackups
    Write-Host "Usage: .\scripts\restore-database.ps1 <backup-file>"
    Write-Host "Example: .\scripts\restore-database.ps1 backups\koperasi_umb_20251103_163000.sql"
    Write-Host ""
    exit 1
}

# Check if backup file exists
if (-Not (Test-Path $BackupFile)) {
    Write-Host "❌ Error: Backup file not found: $BackupFile" -ForegroundColor Red
    Show-AvailableBackups
    exit 1
}

# Get file info
$fileInfo = Get-Item $BackupFile
$fileSizeMB = [math]::Round($fileInfo.Length / 1MB, 2)
$fileDate = $fileInfo.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")

Write-Host "📄 Backup file: $($fileInfo.Name)"
Write-Host "📊 Size: $fileSizeMB MB"
Write-Host "📅 Created: $fileDate"
Write-Host ""

# Confirmation prompt
Write-Host "⚠️  WARNING: This will REPLACE all data in database '$DB_NAME'!" -ForegroundColor Yellow
Write-Host ""
$confirmation = Read-Host "Are you sure you want to continue? Type 'YES' to confirm"

if ($confirmation -ne "YES") {
    Write-Host "❌ Restore cancelled by user" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 Starting database restore..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
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
    
    # Create a backup of current database before restore
    $preRestoreBackup = "backups\pre_restore_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
    Write-Host "📦 Creating safety backup of current database..."
    
    $dumpCommand = "mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME"
    docker exec $DB_CONTAINER sh -c $dumpCommand | Out-File -FilePath $preRestoreBackup -Encoding utf8
    
    if (Test-Path $preRestoreBackup) {
        $backupSize = [math]::Round((Get-Item $preRestoreBackup).Length / 1MB, 2)
        Write-Host "✅ Safety backup created: $preRestoreBackup ($backupSize MB)" -ForegroundColor Green
    }
    
    # Drop and recreate database to ensure clean restore
    Write-Host "🗑️  Dropping existing database..."
    $dropCommand = "mysql -u $DB_USER -p$DB_PASSWORD -e 'DROP DATABASE IF EXISTS $DB_NAME; CREATE DATABASE $DB_NAME;'"
    docker exec $DB_CONTAINER sh -c $dropCommand
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to recreate database"
    }
    
    Write-Host "✅ Database recreated" -ForegroundColor Green
    
    # Restore from backup file
    Write-Host "📥 Restoring database from backup..."
    
    Get-Content $BackupFile | docker exec -i $DB_CONTAINER mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME
    
    if ($LASTEXITCODE -ne 0) {
        throw "Database restore failed"
    }
    
    Write-Host "✅ Database restored successfully!" -ForegroundColor Green
    
    # Verify restore
    Write-Host "🔍 Verifying restore..."
    $verifyCommand = "mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e 'SHOW TABLES;'"
    $tables = docker exec $DB_CONTAINER sh -c $verifyCommand
    
    if ($tables) {
        $tableCount = ($tables -split "`n").Count - 1
        Write-Host "✅ Verification complete - $tableCount tables found" -ForegroundColor Green
    }
    
    # Summary
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host "🎉 Restore completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Restore Summary:"
    Write-Host "   Database: $DB_NAME"
    Write-Host "   Source file: $BackupFile"
    Write-Host "   Size: $fileSizeMB MB"
    Write-Host "   Tables: $tableCount"
    Write-Host "   Safety backup: $preRestoreBackup"
    Write-Host ""
    Write-Host "💡 Next steps:"
    Write-Host "   1. Restart your application: npm run dev"
    Write-Host "   2. Test the restored data"
    Write-Host "   3. If needed, restore from safety backup: $preRestoreBackup"
    Write-Host ""
    
    exit 0
    
} catch {
    Write-Host ""
    Write-Host "❌ Restore failed!" -ForegroundColor Red
    Write-Host "   Error: $_"
    Write-Host ""
    
    if (Test-Path $preRestoreBackup) {
        Write-Host "💡 You can restore from safety backup:" -ForegroundColor Yellow
        Write-Host "   .\scripts\restore-database.ps1 $preRestoreBackup"
    }
    
    Write-Host ""
    exit 1
}
