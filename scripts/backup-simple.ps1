# Simple Database Backup Script
$BACKUP_DIR = 'backups'
$DB_CONTAINER = 'd87627ed7e7e_koperasi-mysql'
$DB_NAME = 'koperasi_umb'
$DB_USER = 'koperasi_user'
$DB_PASSWORD = 'KoperasiUMB2025!'
$TIMESTAMP = Get-Date -Format 'yyyyMMdd_HHmmss'
$BACKUP_FILE = \"$BACKUP_DIR\koperasi_umb_$TIMESTAMP.sql\"

if (-Not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
}

Write-Host 'Starting database backup...'
Write-Host \"File: $BACKUP_FILE\"

$dumpCommand = \"mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME\"
docker exec $DB_CONTAINER sh -c $dumpCommand | Out-File -FilePath $BACKUP_FILE -Encoding utf8

if (Test-Path $BACKUP_FILE) {
    $fileSize = [math]::Round((Get-Item $BACKUP_FILE).Length / 1MB, 2)
    Write-Host \"Backup created successfully! Size: $fileSize MB\"
} else {
    Write-Host 'Backup failed!'
}
