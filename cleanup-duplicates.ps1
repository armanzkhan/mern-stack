# Cleanup Duplicate Files Script
# This script removes duplicate backend files from root that exist in backend/

Write-Host "Starting cleanup of duplicate files..." -ForegroundColor Cyan
Write-Host ""

$directories = @('routes', 'controllers', 'models', 'middleware', 'services', 'utils', 'scripts', 'tests', 'config', 'data', 'uploads', 'docs')
$files = @('server.js', 'package.json', 'package-lock.json', 'nodemon.json')

# Remove duplicate directories
Write-Host "Removing duplicate directories from root..." -ForegroundColor Yellow
foreach ($dir in $directories) {
    if (Test-Path $dir) {
        if (Test-Path "backend\$dir") {
            Write-Host "  Removing $dir..." -ForegroundColor Gray
            Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "    OK: Removed $dir" -ForegroundColor Green
        }
    }
}

# Remove duplicate files
Write-Host ""
Write-Host "Removing duplicate files from root..." -ForegroundColor Yellow
foreach ($file in $files) {
    if (Test-Path $file) {
        if (Test-Path "backend\$file") {
            Write-Host "  Removing $file..." -ForegroundColor Gray
            Remove-Item -Path $file -Force -ErrorAction SilentlyContinue
            Write-Host "    OK: Removed $file" -ForegroundColor Green
        }
    }
}

# Remove root vercel.json (keep backend one, but we'll use root one for Vercel)
# Actually, we need root vercel.json for Vercel, so skip it

# Move test files to backend/tests
Write-Host ""
Write-Host "Moving test files to backend/tests..." -ForegroundColor Yellow
$testFiles = Get-ChildItem -File -Filter "test-*.js" -ErrorAction SilentlyContinue
$verifyFiles = Get-ChildItem -File -Filter "verify-*.js" -ErrorAction SilentlyContinue

foreach ($file in $testFiles) {
    Write-Host "  Moving $($file.Name)..." -ForegroundColor Gray
    Move-Item -Path $file.FullName -Destination "backend\tests\" -Force -ErrorAction SilentlyContinue
    Write-Host "    OK: Moved $($file.Name)" -ForegroundColor Green
}

foreach ($file in $verifyFiles) {
    Write-Host "  Moving $($file.Name)..." -ForegroundColor Gray
    Move-Item -Path $file.FullName -Destination "backend\scripts\" -Force -ErrorAction SilentlyContinue
    Write-Host "    OK: Moved $($file.Name)" -ForegroundColor Green
}

# Remove nested backend/backend folder
Write-Host ""
Write-Host "Removing nested backend/backend folder..." -ForegroundColor Yellow
if (Test-Path "backend\backend") {
    Remove-Item -Path "backend\backend" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  OK: Removed nested backend folder" -ForegroundColor Green
} else {
    Write-Host "  OK: No nested backend folder found" -ForegroundColor Green
}

Write-Host ""
Write-Host "Cleanup complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review the changes" -ForegroundColor Gray
Write-Host "  2. Test that api/index.js works (it now references ../backend/routes/)" -ForegroundColor Gray
Write-Host "  3. Test local development (cd backend && npm run dev)" -ForegroundColor Gray
Write-Host "  4. Commit the changes" -ForegroundColor Gray

