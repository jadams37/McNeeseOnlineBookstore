$ErrorActionPreference = 'Stop'

param(
    [string]$Password
)

$psql = 'C:\Coding\PostgreSQL\bin\psql.exe'
$projectRoot = Split-Path -Parent $PSScriptRoot

if (-not (Test-Path $psql)) {
    throw "psql.exe not found at $psql"
}

$password = $Password
if ([string]::IsNullOrWhiteSpace($password)) {
    $secure = Read-Host "Enter PostgreSQL password for user 'postgres'" -AsSecureString
    $ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    $password = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
}

$env:PGPASSWORD = $password

try {
    & $psql -h localhost -U postgres -d postgres -v ON_ERROR_STOP=1 -f (Join-Path $PSScriptRoot 'create_database.sql')
    & $psql -h localhost -U postgres -d mcneese_bookstore -v ON_ERROR_STOP=1 -f (Join-Path $PSScriptRoot 'bookstore_schema.sql')
    Write-Host "Database setup complete: mcneese_bookstore"
}
finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
