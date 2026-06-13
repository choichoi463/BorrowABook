-- Insert test users first
INSERT INTO users (email, login, password_hash, name, surname, contact, user_role, is_active)
VALUES
    ('john@example.com', 'john', '$2a$10$dXJ3SW6G7P50eS.mY0ubU.Xx2UzM5EPlEelh1ljCf5rqVFI9C7oLe', 'John', 'Doe', '+1-202-555-0100', 'bookOwner', true),
    ('jane@example.com', 'jane', '$2a$10$dXJ3SW6G7P50eS.mY0ubU.Xx2UzM5EPlEelh1ljCf5rqVFI9C7oLe', 'Jane', 'Smith', '+1-202-555-0133', 'localAdmin', true)
ON CONFLICT DO NOTHING;

-- Insert sample books linked to users
INSERT INTO books (owner_id, title, author, genre, language, description, date_added, user_role)
SELECT u.id, 'Clean Code', 'Robert C. Martin', 'Software Engineering', 'English', 'A handbook of agile software craftsmanship', CURRENT_DATE, 'bookOwner'
FROM users u WHERE u.login = 'john' LIMIT 1;

INSERT INTO books (owner_id, title, author, genre, language, description, date_added, user_role)
SELECT u.id, 'The Pragmatic Programmer', 'Andrew Hunt', 'Software Engineering', 'English', 'Classic software engineering guidance', CURRENT_DATE, 'localAdmin'
FROM users u WHERE u.login = 'jane' LIMIT 1;


