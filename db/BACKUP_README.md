# Database Backup and Restore Script

This PowerShell script allows you to backup your PostgreSQL database and restore it to a new database.

## Prerequisites

- PostgreSQL installed with psql and pg_dump in your PATH, or specify the paths
- Database user with appropriate permissions

## Usage

### Backup Database

```powershell
# Basic backup (creates timestamped file)
.\backup_db.ps1

# Backup with custom filename
.\backup_db.ps1 -BackupFile "my_backup.sql"

# Backup with custom paths
.\backup_db.ps1 -PsqlPath "C:\path\to\psql.exe" -PgDumpPath "C:\path\to\pg_dump.exe"
```

### Restore Database

```powershell
# Restore to a new database
.\backup_db.ps1 -Restore -BackupFile "db_backup_20260402_123456.sql" -TargetDatabase "mcneese_bookstore_copy"

# Restore with custom paths
.\backup_db.ps1 -Restore -BackupFile "backup.sql" -TargetDatabase "dev_db" -PsqlPath "C:\path\to\psql.exe"
```

### Parameters

- `PsqlPath`: Path to psql.exe (default: C:\Program Files\Coding\PostgreSQL\bin\psql.exe)
- `PgDumpPath`: Path to pg_dump.exe (default: C:\Program Files\Coding\PostgreSQL\bin\pg_dump.exe)
- `HostName`: Database host (default: localhost)
- `Port`: Database port (default: 5432)
- `AdminUser`: Database admin user (default: postgres)
- `SourceDatabase`: Source database to backup (default: mcneese_bookstore)
- `BackupFile`: Backup file path (default: auto-generated timestamped name)
- `TargetDatabase`: Target database for restore
- `Restore`: Switch to enable restore mode
- `ShowSql`: Switch to show SQL commands being executed

## Cross-Machine Restoration

To restore your database backup on another machine:

### Method 1: Using the Script (Recommended)
1. Copy the backup SQL file to the target machine
2. On the target machine, ensure PostgreSQL is installed
3. Copy the `backup_db.ps1` script to the target machine
4. Modify the script parameters if needed (database user, paths, etc.)
5. Run the restore command:
   ```powershell
   .\backup_db.ps1 -Restore -BackupFile "path\to\backup.sql" -TargetDatabase "mcneese_bookstore" -AdminUser "postgres" -HostName "localhost"
   ```

### Method 2: Manual psql Restore
If you prefer to restore manually or the target machine has different setup:

1. Copy the backup SQL file to the target machine
2. Open a command prompt/PowerShell on the target machine
3. Create the target database (if not exists):
   ```bash
   psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE mcneese_bookstore;"
   ```
4. Restore the backup:
   ```bash
   psql -h localhost -p 5432 -U postgres -d mcneese_bookstore -f "path\to\backup.sql"
   ```

### Method 3: Using pgAdmin
1. Install pgAdmin on the target machine
2. Connect to your PostgreSQL server
3. Create a new database named `mcneese_bookstore`
4. Right-click the database → Restore
5. Select your backup SQL file
6. Click Restore

## Important Notes for Cross-Machine Transfer

- **Database User**: Ensure the target machine has a `postgres` user or modify the script to use the appropriate admin user
- **Permissions**: The database user needs CREATE DATABASE permissions
- **PostgreSQL Version**: Try to use similar PostgreSQL versions between source and target
- **File Transfer**: Use secure methods to transfer the backup file (USB drive, secure file transfer, etc.)
- **Environment Variables**: If using password authentication, set `PGPASSWORD` environment variable or use `.pgpass` file
- **Large Databases**: For very large databases, consider using compressed backups or directory format instead of plain SQL

## Examples

### Create a backup
```powershell
cd db
.\backup_db.ps1
```

### Create a development copy
```powershell
cd db
.\backup_db.ps1 -Restore -BackupFile "db_backup_20260402_123456.sql" -TargetDatabase "mcneese_dev"
```

### Backup with verbose output
```powershell
cd db
.\backup_db.ps1 -ShowSql
```

### Cross-machine restore example
```powershell
# On target machine
.\backup_db.ps1 -Restore -BackupFile "C:\backups\mcneese_backup.sql" -TargetDatabase "mcneese_bookstore" -AdminUser "postgres" -HostName "192.168.1.100" -Port "5433"
```

## Troubleshooting

- **Permission Denied**: Ensure the database user has appropriate permissions
- **Database Already Exists**: The script handles this, but you can drop and recreate if needed
- **Connection Refused**: Check PostgreSQL is running and accessible
- **Password Issues**: Set PGPASSWORD or use .pgpass file for password-less operation