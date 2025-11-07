# Simple Database Backup Script for Koperasi UMB
$BACKUP_DIR = "backups"
$DB_CONTAINER = "d87627ed7e7e_koperasi-mysql"
$DB_NAME = "koperasi_umb"
$DB_USER = "koperasi_user"
$DB_PASSWORD = "KoperasiUMB2025!"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR\koperasi_umb_$TIMESTAMP.sql"

Write-Host "==================================="
Write-Host " Database Backup Tool"
Write-Host "==================================="
Write-Host ""

# Create backup directory
if (-Not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
    Write-Host "[OK] Created backup directory"
}

# Check Docker container
$containerStatus = docker ps --filter "name=$DB_CONTAINER" --format "{{.Status}}"
if (-Not $containerStatus) {
    Write-Host "[ERROR] MySQL container not running!"
    Write-Host "Please start with: docker-compose up -d"
    exit 1
}

Write-Host "[OK] MySQL container running"
Write-Host "[INFO] Creating backup: $BACKUP_FILE"
Write-Host ""

# Create backup
$dumpCommand = "mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME"
docker exec $DB_CONTAINER sh -c $dumpCommand | Out-File -FilePath $BACKUP_FILE -Encoding utf8

# Check result
if (Test-Path $BACKUP_FILE) {
    $fileSize = [math]::Round((Get-Item $BACKUP_FILE).Length / 1MB, 2)
    Write-Host "[SUCCESS] Backup created!"
    Write-Host "File: $BACKUP_FILE"
    Write-Host "Size: $fileSize MB"
    Write-Host ""
    
    # Cleanup old backups (keep last 30)
    $backups = Get-ChildItem -Path $BACKUP_DIR -Filter "koperasi_umb_*.sql" | Sort-Object LastWriteTime -Descending
    if ($backups.Count -gt 30) {
        $toDelete = $backups | Select-Object -Skip 30
        foreach ($file in $toDelete) {
            Remove-Item $file.FullName -Force
        }
        Write-Host "[OK] Cleaned up old backups (kept last 30)"
    }
} else {
    Write-Host "[ERROR] Backup failed!"
    exit 1
}
