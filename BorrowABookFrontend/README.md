# Borrow A Book - Frontend

A React-based frontend for the Borrow A Book application, a book borrowing and library management system.

## Features

- 📚 Browse and search books
- 👤 User authentication (Login/Register)
- 📖 Borrow and return books
- ⭐ Rate and review books
- 📝 Manage reading list
- 👨‍💼 User profile management
- 📱 Responsive design

## Tech Stack

- **React 18** - UI JavaScript library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **CSS3** - Styling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running (see BorrowABook backend project)

### Installation

1. Clone the repository:
```bash
cd BorrowABookFrontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
Copy `.env.example` to `.env` and update the API URL if needed:
cp .env.example .env
```

### Running the Application

Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

### Building for Production

Create a production build:
```bash
npm run build
```

The optimized build will be in the `build/` directory.

## Project Structure

```
src/
├── components/        # Reusable UI components
│   └── Navigation.js  # Top navigation bar
├── pages/            # Page components
│   ├── Home.js       # Landing page
│   ├── Login.js      # Login page
│   ├── Register.js   # Registration page
│   ├── BooksList.js  # Books browse page
│   ├── BookDetails.js # Book detail page
│   └── UserProfile.js # User profile page
├── services/         # API services
│   └── api.js        # API integration with axios
├── App.js            # Main App component with routing
├── App.css           # App styles
└── index.js          # Entry point
```

## API Integration

The frontend is configured to work with the BorrowABook backend API. API endpoints are defined in `src/services/api.js`.

Update the `REACT_APP_API_URL` environment variable to point to your backend API URL.

### Available API Services

- **Authentication**: Login, Register
- **Users**: Profile management, borrowed books, reading list
- **Books**: List, search, details, borrow, return
- **Ratings**: Book ratings and reviews

## Available Scripts

### `npm start`
Runs the app in development mode at `http://localhost:3000`

### `npm build`
Creates a production build

### `npm test`
Runs the test suite

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENV=development
```

## Features Currently Implemented

- ✅ Home page with features overview
- ✅ Navigation menu with responsive layout
- ✅ Login and registration pages
- ✅ Books browsing with search and filter
- ✅ Book details page with reviews
- ✅ User profile management
- ✅ Borrowed books tracking
- ✅ Reading list management

## Features Ready for Backend Integration

When the backend API is ready, the following features will be active:

- User authentication with JWT tokens
- Real-time book data from database
- Borrow and return functionality
- Book ratings and reviews
- Reading list persistence
- User profile updates

## Browser Support

- Chrome (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## Future Enhancements

- Add book cover images
- Implement advanced search filters
- Add book recommendations
- Implement notification system
- Add wishlist feature
- Social sharing features

## License

This project is part of the BorrowABook system.

