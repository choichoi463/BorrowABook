# Quick Start Guide for BorrowABook Frontend

## Prerequisites

Make sure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**

## Installation & Setup

### Step 1: Navigate to the Frontend Directory
```bash
cd BorrowABookFrontend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all the required packages listed in `package.json`:
- React 18
- React Router DOM
- Axios
- React Scripts

### Step 3: Create Environment Configuration
```bash
copy .env.example .env
```

Or on Linux/Mac:
```bash
cp .env.example .env
```

Then edit the `.env` file if needed:
```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENV=development
```

### Step 4: Start the Development Server
```bash
npm start
```

The application will automatically open at `http://localhost:3000`

## What's Included

### Pages
- **Home** (`/`) - Landing page with features overview
- **Login** (`/login`) - User login form
- **Register** (`/register`) - User registration form
- **Books List** (`/books`) - Browse and search books
- **Book Details** (`/books/:id`) - Book details and borrow functionality
- **User Profile** (`/profile`) - User profile and borrowed books management

### Components
- **Navigation** - Responsive navigation bar with mobile menu
- **LoadingSpinner** - Reusable loading indicator
- **ErrorMessage** - Reusable error message display

### Services
- **API Service** (`src/services/api.js`) - Configured axios instance with interceptors for API communication

### Features
✅ Responsive design (mobile, tablet, desktop)
✅ Search and filter books
✅ User authentication UI
✅ Book borrowing workflow
✅ Reading list management
✅ User profile management

## Available npm Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject configuration (⚠️ irreversible)
npm run eject
```

## Connecting to Backend

Once your backend API is running on `http://localhost:8080`, the frontend will automatically connect to it.

### API Endpoints Used

The application expects the following endpoints:

**Authentication:**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

**Books:**
- `GET /api/books` - List all books
- `GET /api/books/{id}` - Get book details
- `POST /api/books/{id}/borrow` - Borrow a book
- `POST /api/books/{id}/return` - Return a book

**Users:**
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/borrowed-books` - Get borrowed books
- `GET /api/users/reading-list` - Get reading list

**Ratings:**
- `GET /api/ratings/books/{id}` - Get book ratings
- `POST /api/ratings/books/{id}` - Add rating

See `src/services/api.js` for more details.

## File Structure

```
BorrowABookFrontend/
├── public/
│   ├── index.html           # Main HTML file
│   └── manifest.json        # PWA manifest
├── src/
│   ├── components/          # Reusable components
│   │   ├── Navigation.js
│   │   ├── LoadingSpinner.js
│   │   └── ErrorMessage.js
│   ├── pages/              # Page components
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── BooksList.js
│   │   ├── BookDetails.js
│   │   └── UserProfile.js
│   ├── services/           # API services
│   │   └── api.js
│   ├── constants/          # App constants
│   │   └── constants.js
│   ├── App.js              # Main App component
│   ├── App.css
│   ├── index.js            # Entry point
│   └── index.css
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies and scripts
└── README.md               # Project documentation
```

## Troubleshooting

### Port 3000 already in use
If port 3000 is already in use, React will prompt you to use another port.

### API Connection Issues
- Verify the backend is running on the configured URL
- Check the `REACT_APP_API_URL` in `.env`
- Ensure CORS is properly configured on the backend

### Dependencies Installation Failed
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules
npm install
```

## Browser DevTools

Recommended React DevTools browser extensions:
- React Developer Tools (Chrome/Firefox)
- Redux DevTools (if using Redux in future)

## Performance

The application is optimized for:
- Fast page loads with code splitting
- Lazy loading of routes
- Responsive images and assets
- CSS optimization

## Next Steps

1. Integrate with the backend API
2. Add user authentication and token management
3. Implement real-time data loading
4. Add more features (recommendations, notifications, etc.)
5. Set up CI/CD pipeline
6. Deploy to production

## Support

For issues or questions, please refer to:
- React Documentation: https://react.dev
- React Router: https://reactrouter.com
- Axios: https://axios-http.com

