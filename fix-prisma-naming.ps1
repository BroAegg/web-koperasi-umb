# Fix Prisma Model Naming - Mass Replace Script
# Run this from web-koperasi-umb directory

Write-Host "🔧 Fixing Prisma model naming across all files..." -ForegroundColor Cyan

# Define replacements
$replacements = @{
    'prisma.products' = 'prisma.product'
    'prisma.transactions' = 'prisma.transaction'
    'prisma.stock_movements' = 'prisma.stockMovement'
    'prisma.supplier_profiles' = 'prisma.supplierProfile'
    'prisma.users' = 'prisma.user'
    'prisma.categories' = 'prisma.category'
    'prisma.members' = 'prisma.member'
    'prisma.broadcasts' = 'prisma.broadcast'
}

# Files to fix
$files = @(
    "lib\auth.ts",
    "app\api\products\route.ts",
    "app\api\financial\summary\route.ts",
    "app\api\financial\period\route.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "📝 Processing: $file" -ForegroundColor Yellow
        $content = Get-Content $file -Raw
        
        $modified = $false
        foreach ($old in $replacements.Keys) {
            $new = $replacements[$old]
            if ($content -match [regex]::Escape($old)) {
                $content = $content -replace [regex]::Escape($old), $new
                $modified = $true
                Write-Host "   ✅ Replaced: $old → $new" -ForegroundColor Green
            }
        }
        
        if ($modified) {
            Set-Content $file -Value $content -NoNewline
            Write-Host "   💾 Saved: $file" -ForegroundColor Green
        } else {
            Write-Host "   ⏭️  No changes needed" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ❌ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Done! Run 'npm run dev' to test." -ForegroundColor Cyan
