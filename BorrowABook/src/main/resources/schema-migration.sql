-- Migration script to add user relationships to books table
-- Run this against your existing database to add foreign key support

BEGIN;

-- Step 1: Add foreign key columns
ALTER TABLE books
ADD COLUMN IF NOT EXISTS owner_id BIGINT,
ADD COLUMN IF NOT EXISTS borrowed_by_id BIGINT,
ADD COLUMN IF NOT EXISTS last_reader_id BIGINT;

-- Step 2: Migrate existing data - associate existing books with a default admin user
-- Assumes there's at least one admin user in the system
-- If you have multiple users, adjust this logic to match books to their actual owners
UPDATE books
SET owner_id = (SELECT id FROM users ORDER BY id LIMIT 1)
WHERE owner_id IS NULL;

-- Step 3: Add foreign key constraints
ALTER TABLE books
ADD CONSTRAINT fk_books_owner_id
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT;

ALTER TABLE books
ADD CONSTRAINT fk_books_borrowed_by_id
  FOREIGN KEY (borrowed_by_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE books
ADD CONSTRAINT fk_books_last_reader_id
  FOREIGN KEY (last_reader_id) REFERENCES users(id) ON DELETE SET NULL;

-- Step 4: Make owner_id NOT NULL after migration
ALTER TABLE books
ALTER COLUMN owner_id SET NOT NULL;

-- Step 5: Drop old string columns (after verifying migration)
-- Uncomment when ready:
-- ALTER TABLE books
-- DROP COLUMN owner,
-- DROP COLUMN email,
-- DROP COLUMN phone,
-- DROP COLUMN borrowed_by,
-- DROP COLUMN last_reader;

COMMIT;

