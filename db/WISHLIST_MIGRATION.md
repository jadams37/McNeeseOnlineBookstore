# Wishlist Feature Database Migration

This document describes how to apply the wishlist database schema to your PostgreSQL database.

## Migration File

The wishlist tables are defined in `add_wishlist_table.sql`

## Tables Created

1. **wishlist** - Stores user wishlists (one per user)
   - `wishlist_id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key to users_account, Unique)
   - `created_at` (Timestamp)
   - `updated_at` (Timestamp)

2. **wishlist_item** - Stores individual items in wishlists
   - `wishlist_item_id` (UUID, Primary Key)
   - `wishlist_id` (UUID, Foreign Key to wishlist)
   - `product_id` (UUID, Foreign Key to product)
   - `added_at` (Timestamp)
   - Unique constraint on (wishlist_id, product_id)

## How to Apply the Migration

### Option 1: Using psql (Command Line)

```bash
psql -U your_username -d bookstore -f db/add_wishlist_table.sql
```

### Option 2: Using PowerShell

```powershell
cd db
Get-Content add_wishlist_table.sql | psql -U your_username -d bookstore
```

### Option 3: Using a Database Client (DBeaver, pgAdmin, etc.)

1. Open your database client
2. Connect to your `bookstore` database
3. Open `db/add_wishlist_table.sql`
4. Execute the SQL script

## Verification

After running the migration, verify the tables were created:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('wishlist', 'wishlist_item');

-- Check wishlist table structure
\d wishlist

-- Check wishlist_item table structure
\d wishlist_item
```

## Related Changes

Along with this database migration, the following files have been updated to support the wishlist feature:

- **Backend API**: `server/index.js` - Added wishlist endpoints
- **Results Page**: `scripts/results.js` - Added heart icons to product tiles
- **Profile Page**: `scripts/profile.js` + `Profile.html` - Added wishlist display
- **Styling**: `css/results.css` + `css/Profile.css` - Wishlist UI styles
- **Utilities**: `scripts/wishlist.js` - Wishlist helper functions

## Rollback (if needed)

To remove the wishlist tables:

```sql
DROP TABLE IF EXISTS wishlist_item CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
```
