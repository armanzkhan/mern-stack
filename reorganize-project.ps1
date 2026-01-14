# Project Reorganization Script
# This script analyzes the project structure for reorganization

Write-Host "Starting Project Reorganization Analysis..." -ForegroundColor Cyan
Write-Host ""

$directories = @('routes', 'controllers', 'models', 'middleware', 'services', 'utils', 'scripts', 'tests', 'config', 'data', 'uploads', 'docs')
$files = @('server.js', 'package.json', 'package-lock.json', 'nodemon.json', 'vercel.json')

Write-Host "Checking directories..." -ForegroundColor Yellow
foreach ($dir in $directories) {
    if (Test-Path $dir) {
        if (Test-Path "backend\$dir") {
            Write-Host "  WARNING: $dir exists in both root and backend" -ForegroundColor Yellow
            $rootFiles = (Get-ChildItem -Path $dir -Recurse -File -ErrorAction SilentlyContinue).Count
            $backendFiles = (Get-ChildItem -Path "backend\$dir" -Recurse -File -ErrorAction SilentlyContinue).Count
            Write-Host "     Root: $rootFiles files | Backend: $backendFiles files" -ForegroundColor Gray
            if ($rootFiles -eq $backendFiles) {
                Write-Host "     OK: Appears identical - can remove root version" -ForegroundColor Green
            } else {
                Write-Host "     WARNING: Different file counts - manual review needed" -ForegroundColor Red
            }
        } else {
            Write-Host "  OK: $dir only in root - can move to backend" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "Checking files..." -ForegroundColor Yellow
foreach ($file in $files) {
    if (Test-Path $file) {
        if (Test-Path "backend\$file") {
            Write-Host "  WARNING: $file exists in both locations" -ForegroundColor Yellow
            $rootHash = (Get-FileHash $file -Algorithm MD5 -ErrorAction SilentlyContinue).Hash
            $backendHash = (Get-FileHash "backend\$file" -Algorithm MD5 -ErrorAction SilentlyContinue).Hash
            if ($rootHash -eq $backendHash) {
                Write-Host "     OK: Files are identical - can remove root version" -ForegroundColor Green
            } else {
                Write-Host "     WARNING: Files differ - manual review needed" -ForegroundColor Red
            }
        } else {
            Write-Host "  OK: $file only in root - can move to backend" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "Checking for nested backend folder..." -ForegroundColor Yellow
if (Test-Path "backend\backend") {
    Write-Host "  WARNING: Found nested backend\backend folder - should be removed" -ForegroundColor Red
} else {
    Write-Host "  OK: No nested backend folder found" -ForegroundColor Green
}

Write-Host ""
Write-Host "Analysis complete. Review the output above." -ForegroundColor Cyan
