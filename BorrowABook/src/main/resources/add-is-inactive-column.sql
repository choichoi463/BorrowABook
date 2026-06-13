-- Migration script to add is_inactive column to books table
-- Marks books as deactivated but retains them in the database

BEGIN;

-- Add is_inactive column with default value of false
ALTER TABLE books
ADD COLUMN IF NOT EXISTS is_inactive BOOLEAN NOT NULL DEFAULT FALSE;

COMMIT;

