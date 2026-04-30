-- Migration: Add image_path column to product table
-- This allows products to have associated images

ALTER TABLE product
ADD COLUMN IF NOT EXISTS image_path TEXT;
