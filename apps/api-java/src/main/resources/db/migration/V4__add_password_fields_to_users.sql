-- Migration to add password authentication fields to users table
-- Adds password_hash and password_salt columns for email/password authentication

ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN password_salt VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN users.password_hash IS 'BCrypt hash of the user password (nullable for OAuth-only users)';
COMMENT ON COLUMN users.password_salt IS 'Random salt used for password hashing (nullable for OAuth-only users)';
