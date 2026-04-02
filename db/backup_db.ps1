[CmdletBinding()]
param(
    [string]$PsqlPath = "C:\Program Files\Coding\PostgreSQL\bin\psql.exe",
    [string]$PgDumpPath = "C:\Program Files\Coding\PostgreSQL\bin\pg_dump.exe",
    [string]$HostName = "localhost",
    [string]$Port = "5432",
    [string]$AdminUser = "postgres",
    [string]$SourceDatabase = "mcneese_bookstore",
    [string]$BackupFile = "",
    [string]$TargetDatabase = "",
    [switch]$Restore,
    [switch]$ShowSql
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $PsqlPath)) {
    throw "psql.exe not found at: $PsqlPath"
}

if (-not (Test-Path $PgDumpPath)) {
    throw "pg_dump.exe not found at: $PgDumpPath"
}

if (-not $BackupFile) {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $BackupFile = "db_backup_$timestamp.sql"
}

function Invoke-PsqlCommand {
    param(
        [string]$Command,
        [string]$Database = "postgres"
    )

    $psqlArgs = @(
        '-h', $HostName,
        '-p', $Port,
        '-U', $AdminUser,
        '-d', $Database,
        '-c', $Command
    )

    if ($ShowSql) {
        $psqlArgs += @('-a', '-e')
    }

    & $PsqlPath @psqlArgs

    if ($LASTEXITCODE -ne 0) {
        throw "psql command failed: $Command (exit code $LASTEXITCODE)"
    }
}

function Invoke-PgDump {
    param(
        [string]$OutputFile
    )

    $pgDumpArgs = @(
        '-h', $HostName,
        '-p', $Port,
        '-U', $AdminUser,
        '-d', $SourceDatabase,
        '-f', $OutputFile,
        '--no-owner',
        '--no-privileges',
        '--clean',
        '--if-exists'
    )

    & $PgDumpPath @pgDumpArgs

    if ($LASTEXITCODE -ne 0) {
        throw "pg_dump failed (exit code $LASTEXITCODE)"
    }
}

function Invoke-PsqlRestore {
    param(
        [string]$InputFile,
        [string]$Database
    )

    $psqlArgs = @(
        '-h', $HostName,
        '-p', $Port,
        '-U', $AdminUser,
        '-d', $Database,
        '-f', $InputFile
    )

    if ($ShowSql) {
        $psqlArgs += @('-a', '-e')
    }

    & $PsqlPath @psqlArgs

    if ($LASTEXITCODE -ne 0) {
        throw "psql restore failed (exit code $LASTEXITCODE)"
    }
}

try {
    Write-Host "Database backup/restore script" -ForegroundColor Cyan
    Write-Host "- psql: $PsqlPath"
    Write-Host "- pg_dump: $PgDumpPath"
    Write-Host "- host: ${HostName}:$Port"
    Write-Host "- admin user: $AdminUser"
    Write-Host "- source DB: $SourceDatabase"
    Write-Host "- backup file: $BackupFile"
    if ($TargetDatabase) {
        Write-Host "- target DB: $TargetDatabase"
    }
    Write-Host "- restore mode: $($Restore.IsPresent)"
    Write-Host "- SQL echo: $($ShowSql.IsPresent)"
    Write-Host ""

    if (-not $Restore) {
        # Backup mode
        Write-Host "Creating backup of database '$SourceDatabase'..." -ForegroundColor Yellow

        Invoke-PgDump -OutputFile $BackupFile

        Write-Host "Backup completed successfully: $BackupFile" -ForegroundColor Green

        if (-not $TargetDatabase) {
            Write-Host "To restore this backup, run:" -ForegroundColor Cyan
            Write-Host ".\backup_db.ps1 -Restore -BackupFile '$BackupFile' -TargetDatabase 'new_database_name'"
        }
    }

    if ($Restore -or $TargetDatabase) {
        if (-not $TargetDatabase) {
            throw "TargetDatabase parameter is required for restore operation"
        }

        if (-not (Test-Path $BackupFile)) {
            throw "Backup file not found: $BackupFile"
        }

        Write-Host "Restoring backup to database '$TargetDatabase'..." -ForegroundColor Yellow

        # Create target database if it doesn't exist
        try {
            Invoke-PsqlCommand -Command "CREATE DATABASE $TargetDatabase" -Database "postgres"
            Write-Host "Created database '$TargetDatabase'"
        } catch {
            Write-Host "Database '$TargetDatabase' already exists, proceeding with restore..."
        }

        # Restore the backup
        Invoke-PsqlRestore -InputFile $BackupFile -Database $TargetDatabase

        Write-Host "Restore completed successfully to database '$TargetDatabase'" -ForegroundColor Green
    }

} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}