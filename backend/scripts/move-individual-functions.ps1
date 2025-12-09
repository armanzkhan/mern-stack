# Script to move individual function files to backup directory
# This prevents Vercel from detecting them as separate functions

$backupDir = "api\_backup"
$apiDir = "api"

# Create backup directory if it doesn't exist
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# Files to move (all individual function files except api/index.js and api/_utils/)
$filesToMove = @(
    "api\auth\login.js",
    "api\auth\register.js",
    "api\auth\refresh.js",
    "api\auth\me.js",
    "api\auth\current-user.js",
    "api\auth\index.js",
    "api\users\index.js",
    "api\companies\index.js",
    "api\customers\index.js",
    "api\orders\index.js",
    "api\products\index.js",
    "api\roles\index.js",
    "api\permissions\index.js",
    "api\permission-groups\index.js",
    "api\notifications\index.js",
    "api\managers\index.js",
    "api\product-categories\index.js",
    "api\invoices\index.js",
    "api\customer-ledger\index.js",
    "api\product-images\index.js",
    "api\health.js"
)

Write-Host "Moving individual function files to backup directory..." -ForegroundColor Yellow

foreach ($file in $filesToMove) {
    if (Test-Path $file) {
        $destDir = Join-Path $backupDir (Split-Path $file -Parent | Split-Path -Leaf)
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        $destFile = Join-Path $backupDir (Split-Path $file -Leaf)
        Move-Item -Path $file -Destination $destFile -Force
        Write-Host "  Moved: $file" -ForegroundColor Green
    }
}

# Move empty directories
$dirsToRemove = @(
    "api\auth",
    "api\users",
    "api\companies",
    "api\customers",
    "api\orders",
    "api\products",
    "api\roles",
    "api\permissions",
    "api\permission-groups",
    "api\notifications",
    "api\managers",
    "api\product-categories",
    "api\invoices",
    "api\customer-ledger",
    "api\product-images"
)

foreach ($dir in $dirsToRemove) {
    if (Test-Path $dir) {
        $files = Get-ChildItem -Path $dir -File
        if ($files.Count -eq 0) {
            Remove-Item -Path $dir -Force
            Write-Host "  Removed empty directory: $dir" -ForegroundColor Cyan
        }
    }
}

Write-Host "`n✅ Done! Individual function files moved to $backupDir" -ForegroundColor Green
Write-Host "Only api/index.js will be detected by Vercel now." -ForegroundColor Green

