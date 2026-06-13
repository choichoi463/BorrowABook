-- BorrowABook bootstrap schema for PostgreSQL.
-- Executed automatically by postgres image on first container startup (empty data volume only).

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    contact VARCHAR(255),
    login VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    user_role VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT uk_users_login UNIQUE (login),
    CONSTRAINT chk_users_user_role CHECK (user_role IN ('admin', 'localAdmin', 'bookOwner'))
);

CREATE TABLE IF NOT EXISTS books (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(255),
    language VARCHAR(255),
    description VARCHAR(2000),
    date_added DATE NOT NULL,
    date_borrowed DATE,
    date_returned DATE,
    borrowed_by_id BIGINT,
    last_reader_id BIGINT,
    user_role VARCHAR(255) NOT NULL,
    CONSTRAINT fk_books_owner FOREIGN KEY (owner_id) REFERENCES users (id),
    CONSTRAINT fk_books_borrowed_by FOREIGN KEY (borrowed_by_id) REFERENCES users (id),
    CONSTRAINT fk_books_last_reader FOREIGN KEY (last_reader_id) REFERENCES users (id),
    CONSTRAINT chk_books_user_role CHECK (user_role IN ('admin', 'localAdmin', 'bookOwner'))
);

CREATE TABLE IF NOT EXISTS book_history (
    id BIGSERIAL PRIMARY KEY,
    book_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    owner VARCHAR(255) NOT NULL,
    previous_borrowed_by VARCHAR(255),
    previous_borrowed_by_surname VARCHAR(255),
    previous_date_borrowed DATE,
    previous_date_returned DATE,
    previous_last_reader VARCHAR(255),
    changed_by VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT chk_book_history_action CHECK (action IN ('CREATED', 'BORROWED', 'RETURNED', 'DELETED'))
);

CREATE TABLE IF NOT EXISTS book_ratings (
    id BIGSERIAL PRIMARY KEY,
    book_id BIGINT NOT NULL,
    rating INTEGER NOT NULL,
    comment VARCHAR(2000) NOT NULL,
    rated_by VARCHAR(255),
    created_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT fk_book_ratings_book FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE,
    CONSTRAINT chk_book_ratings_rating CHECK (rating BETWEEN 1 AND 5)
);

CREATE INDEX IF NOT EXISTS idx_books_user_role ON books (user_role);
CREATE INDEX IF NOT EXISTS idx_books_title_lower ON books ((lower(title)));
CREATE INDEX IF NOT EXISTS idx_books_author_lower ON books ((lower(author)));
CREATE INDEX IF NOT EXISTS idx_books_genre_lower ON books ((lower(genre)));
CREATE INDEX IF NOT EXISTS idx_books_language_lower ON books ((lower(language)));

CREATE INDEX IF NOT EXISTS idx_book_history_book_id_changed_at ON book_history (book_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_book_ratings_book_id_created_at ON book_ratings (book_id, created_at DESC);

-- Case-insensitive uniqueness aligned with existsByEmailIgnoreCase / existsByLoginIgnoreCase queries.
CREATE UNIQUE INDEX IF NOT EXISTS uk_users_email_lower ON users ((lower(email)));
CREATE UNIQUE INDEX IF NOT EXISTS uk_users_login_lower ON users ((lower(login)));

