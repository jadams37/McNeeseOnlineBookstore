# Apply Wishlist Migration Script
# This script applies the wishlist database schema to your PostgreSQL database

[CmdletBinding()]
param(
    [string]$PsqlPath = "C:\Program Files\Coding\PostgreSQL\bin\psql.exe",
    [string]$HostName = "localhost",
    [string]$Port = "5432",
    [string]$AdminUser = "postgres",
    [string]$DatabaseName = "mcneese_bookstore",
    [string]$Password
)

$ErrorActionPreference = "Stop"

Write-Host "=== Wishlist Feature Database Migration ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $PsqlPath)) {
    Write-Host "Error: psql.exe not found at: $PsqlPath" -ForegroundColor Red
    Write-Host "Please update the -PsqlPath parameter or install PostgreSQL" -ForegroundColor Yellow
    exit 1
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$migrationFile = Join-Path $scriptDir "add_wishlist_table.sql"

if (-not (Test-Path $migrationFile)) {
    Write-Host "Error: Migration file not found at $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "- psql: $PsqlPath"
Write-Host "- host: ${HostName}:$Port"
Write-Host "- user: $AdminUser"
Write-Host "- database: $DatabaseName"
Write-Host ""

$plainPwdPtr = [IntPtr]::Zero
$plainPwd = $Password
try {
    if ([string]::IsNullOrWhiteSpace($plainPwd)) {
        Write-Host "Awaiting PostgreSQL password input..." -ForegroundColor Yellow
        $securePwd = Read-Host "Enter PostgreSQL password for user '$AdminUser'" -AsSecureString
        $plainPwdPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePwd)
        $plainPwd = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($plainPwdPtr)
    }

    $env:PGPASSWORD = $plainPwd

    Write-Host "Applying wishlist migration..." -ForegroundColor Yellow
    
    $psqlArgs = @(
        '-h', $HostName,
        '-p', $Port,
        '-U', $AdminUser,
        '-d', $DatabaseName,
        '-v', 'ON_ERROR_STOP=1',
        '-f', $migrationFile
    )

    & $PsqlPath @psqlArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Migration applied successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Verifying tables..." -ForegroundColor Yellow
        
        $verifyCmd = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('wishlist', 'wishlist_item') ORDER BY table_name;"
        
        Write-Output $verifyCmd | & $PsqlPath -h $HostName -p $Port -U $AdminUser -d $DatabaseName -t
        
        Write-Host ""
        Write-Host "Wishlist feature is ready to use!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Migration failed with exit code $LASTEXITCODE" -ForegroundColor Red
        Write-Host "Please check the error messages above." -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
} finally {
    $env:PGPASSWORD = $null
    if ($plainPwdPtr -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($plainPwdPtr)
    }
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
