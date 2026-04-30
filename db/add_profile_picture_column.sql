-- Add profile picture column to users_account table
ALTER TABLE users_account
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
