import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Home.css';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="home">
      <header className="hero-section">
        <div className="hero-content">
          <h1>{t('home.welcome')}</h1>
          <p>{t('home.subtitle')}</p>
          <div className="hero-buttons">
            <Link to="/books" className="btn btn-primary">
              {t('home.browseBooks')}
            </Link>
            <Link to="/register" className="btn btn-secondary">
              {t('home.getStarted')}
            </Link>
          </div>
        </div>
      </header>

      <section className="features">
        <h2>{t('home.features')}</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📖</div>
            <h3>{t('home.featureBrowseTitle')}</h3>
            <p>{t('home.featureBrowseText')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏪</div>
            <h3>{t('home.featureBorrowTitle')}</h3>
            <p>{t('home.featureBorrowText')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>{t('home.featureReviewTitle')}</h3>
            <p>{t('home.featureReviewText')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>{t('home.featureTrackTitle')}</h3>
            <p>{t('home.featureTrackText')}</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>{t('home.cta')}</h2>
        <Link to="/books" className="btn btn-primary">
          {t('home.startBrowsing')}
        </Link>
      </section>
    </div>
  );
};

export default Home;

