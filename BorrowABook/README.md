# BorrowABook Backend

This backend now includes user registration and persistence for a UI layer.

## Implemented registration flow

- Endpoint: `POST /api/users/register`
- Stores user data in DB: `email`, optional `contact`, `login`, hashed password, `name`, `surname`, `userRole`
- Rejects duplicate `email` and duplicate `login`

## Implemented login flow

- Endpoint: `POST /api/users/login`
- Validates `login` + `password` against stored users
- Returns sanitized user profile (never returns password hash)

## Forgot password flow

- Endpoint: `POST /api/users/forgot-password`
- Accepts user email and sends a temporary password email when account exists
- For privacy, endpoint returns `204` even when email is not registered

### Forgot password request example

```json
{
  "email": "reader@example.com"
}
```

## Login request example

```json
{
  "login": "reader1",
  "password": "superSecret123"
}
```

## Request example

```json
{
  "email": "reader@example.com",
  "contact": "+1-202-555-0188",
  "login": "reader1",
  "password": "superSecret123",
  "name": "John",
  "surname": "Doe",
  "userRole": "bookOwner"
}
```

## Implemented book operations

- Add book: `POST /api/books`
- List/filter books: `GET /api/books`
- Delete book: `DELETE /api/books/{bookId}`
- Borrow book: `POST /api/books/{bookId}/borrow`
- Return book: `POST /api/books/{bookId}/return`
- Borrowing history: `GET /api/books/{bookId}/history`

### Add book request example

```json
{
  "owner": "John Doe",
  "phone": "+1-202-555-0100",
  "email": "owner@example.com",
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "description": "A handbook of agile software craftsmanship",
  "userRole": "bookOwner"
}
```

### Borrow request example

```json
{
  "borrowedBy": "Alice"
}
```

### Return request example

```json
{
  "returnedBy": "Alice"
}
```

### Filter examples

- `GET /api/books?available=true`
- `GET /api/books?title=clean&author=martin&owner=john`
- `GET /api/books?borrowedBy=alice&userRole=bookOwner`

## Implemented rating operations

- Rate with comment: `POST /api/books/{bookId}/ratings`
- Get book rating summary: `GET /api/books/{bookId}/ratings`

### Rate request example

```json
{
  "rating": 5,
  "comment": "Excellent and practical",
  "ratedBy": "Alice"
}
```

## Implemented profile update flow

- Endpoint: `PUT /api/users/{userId}`
- Updates editable fields: `email`, `contact`, `name`, `surname`
- Login (`login`) remains immutable

### Profile update request example

```json
{
  "email": "reader.updated@example.com",
  "contact": "+1-202-555-0199",
  "name": "John",
  "surname": "Doe"
}
```

## Local test run

Use Gradle wrapper:

```powershell
.\gradlew.bat test
```

Test profile uses in-memory H2 configured in `src/test/resources/application.properties`.

## Email templates

Mail content is externalized under `src/main/resources/email-templates`:

- `registration-subject.txt`
- `registration-body.txt`
- `forgot-password-subject.txt`
- `forgot-password-body.txt`

Enable sending with `APP_MAIL_ENABLED=true` and configure SMTP via `SPRING_MAIL_*` properties.

## Local run

```powershell
.\gradlew.bat bootRun
```