import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <header className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Borrow A Book</h1>
          <p>Discover, browse, and borrow books from our extensive collection</p>
          <div className="hero-buttons">
            <Link to="/books" className="btn btn-primary">
              Browse Books
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="features">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📖</div>
            <h3>Browse Books</h3>
            <p>Explore thousands of books in our collection</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏪</div>
            <h3>Easy Borrowing</h3>
            <p>Borrow books with just a few clicks</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Rate & Review</h3>
            <p>Share your thoughts and see community ratings</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Track Books</h3>
            <p>Keep track of your borrowed and reading list</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to explore?</h2>
        <Link to="/books" className="btn btn-primary">
          Start Browsing
        </Link>
      </section>
    </div>
  );
};

export default Home;

