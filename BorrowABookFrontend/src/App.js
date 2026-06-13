import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import BooksList from './pages/BooksList';
import BookDetails from './pages/BookDetails';
import EditBook from './pages/EditBook';
import UserProfile from './pages/UserProfile';
import UserManagement from './pages/UserManagement';
import AdminUserProfile from './pages/AdminUserProfile';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/books" element={<BooksList />} />
            <Route path="/books/:id" element={<BookDetails />} />
            <Route path="/books/:id/edit" element={<EditBook />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/users/:userId" element={<AdminUserProfile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

