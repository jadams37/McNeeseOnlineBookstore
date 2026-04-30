[CmdletBinding()]
param(
    [string]$PsqlPath = "C:\Program Files\Coding\PostgreSQL\bin\psql.exe",
    [string]$HostName = "localhost",
    [string]$Port = "5432",
    [string]$AdminUser = "postgres",
    [string]$DatabaseName = "mcneese_bookstore",
    [string]$Password,
    [switch]$ShowSql
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $PsqlPath)) {
    throw "psql.exe not found at: $PsqlPath"
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$createDbSql = Join-Path $scriptDir "create_database.sql"
$schemaSql = Join-Path $scriptDir "bookstore_schema.sql"
$wishlistSql = Join-Path $scriptDir "add_wishlist_table.sql"
$imagePathSql = Join-Path $scriptDir "add_image_path_column.sql"
$sampleDataSql = Join-Path $scriptDir "sample_data.sql"
$updateImagesSql = Join-Path $scriptDir "update_product_images.sql"

if (-not (Test-Path $createDbSql)) { throw "Missing file: $createDbSql" }
if (-not (Test-Path $schemaSql)) { throw "Missing file: $schemaSql" }
if (-not (Test-Path $wishlistSql)) { throw "Missing file: $wishlistSql" }
if (-not (Test-Path $imagePathSql)) { throw "Missing file: $imagePathSql" }
if (-not (Test-Path $sampleDataSql)) { throw "Missing file: $sampleDataSql" }
if (-not (Test-Path $updateImagesSql)) { throw "Missing file: $updateImagesSql" }

function Invoke-PsqlStep {
    param(
        [string]$StepName,
        [string]$Database,
        [string]$SqlFile
    )

    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] START: $StepName" -ForegroundColor Cyan

    $psqlArgs = @(
        '-h', $HostName,
        '-p', $Port,
        '-U', $AdminUser,
        '-d', $Database,
        '-v', 'ON_ERROR_STOP=1',
        '-f', $SqlFile
    )

    if ($ShowSql) {
        $psqlArgs += @('-a', '-e', '-v', 'ECHO=all')
    }

    & $PsqlPath @psqlArgs

    if ($LASTEXITCODE -ne 0) {
        throw "Step failed: $StepName (exit code $LASTEXITCODE)"
    }

    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] DONE:  $StepName" -ForegroundColor Green
}

$plainPwdPtr = [IntPtr]::Zero
$plainPwd = $Password
try {
    Write-Host "Preparing database initialization..." -ForegroundColor Yellow
    Write-Host "- psql: $PsqlPath"
    Write-Host "- host: ${HostName}:$Port"
    Write-Host "- admin user: $AdminUser"
    Write-Host "- target DB: $DatabaseName"
    Write-Host "- SQL echo: $($ShowSql.IsPresent)"

    if ([string]::IsNullOrWhiteSpace($plainPwd)) {
        Write-Host "Awaiting PostgreSQL password input..." -ForegroundColor Yellow
        $securePwd = Read-Host "Enter PostgreSQL password for user '$AdminUser'" -AsSecureString
        $plainPwdPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePwd)
        $plainPwd = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($plainPwdPtr)
    }

    $env:PGPASSWORD = $plainPwd

    Invoke-PsqlStep -StepName "Create database if missing" -Database "postgres" -SqlFile $createDbSql

    Invoke-PsqlStep -StepName "Apply bookstore schema" -Database $DatabaseName -SqlFile $schemaSql

    Invoke-PsqlStep -StepName "Apply wishlist tables" -Database $DatabaseName -SqlFile $wishlistSql

    Invoke-PsqlStep -StepName "Add image_path column" -Database $DatabaseName -SqlFile $imagePathSql

    Invoke-PsqlStep -StepName "Load sample data" -Database $DatabaseName -SqlFile $sampleDataSql

    Invoke-PsqlStep -StepName "Update product images" -Database $DatabaseName -SqlFile $updateImagesSql

    Write-Host "Done. Database '$DatabaseName' is ready." -ForegroundColor Green
}
finally {
    $env:PGPASSWORD = $null
    if ($plainPwdPtr -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($plainPwdPtr)
    }
}