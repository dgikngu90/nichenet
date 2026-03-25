import React from 'react';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <div className="home-page">
      <Navbar user={null} />
      <main>
        <section className="hero">
          <div className="hero-content">
            <h1>Find Your People</h1>
            <p className="hero-subtitle">
              Join communities built around your most specific interests
            </p>
            <div className="hero-buttons">
              <button className="btn-primary">Explore Communities</button>
              <button className="btn-secondary">Create Your Own</button>
            </div>
          </div>
          <div className="hero-image">
            {/* Placeholder for hero image */}
            <div className="placeholder-image">
              <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                <rect width="400" height="300" fill="#f8f9fa"/>
                <text x="200" y="150" text-anchor="middle" fill="#6c757d" font-size="16">
                  Community Illustration
                </text>
              </svg>
            </div>
          </div>
        </section>
        
        <section className="features">
          <h2>Why NicheNet?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                  <path d="M12 6v6m0 0v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M6 12h6m0 0h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <h3>Hyper-Specific Communities</h3>
              <p>Find groups for interests so specific they don't exist anywhere else online.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="16" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
                  <path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <h3>Real-World Connections</h3>
              <p>Turn online friendships into offline meetups and events in your area.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.24 12.24a6 6 0 00-2.34-4.76 4 4 0 00-3.42-1.74 2 2 0 00-.76.28 2 2 0 00-.3.16A16.95 16.95 0 008 6c-4.96 0-9 4.04-9 9 0 1.34.16 2.64.46 3.86a2 2 0 00.14.58V20h4v-2.58a2 2 0 00.38-.22 4 4 0 011.24-1.4 2 2 0 00.54-.18 2 2 0 00.68-.06A8.01 8.01 0 0112 12a8 8 0 018-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <h3>Safe & Private</h3>
              <p>Your niche interests stay private unless you choose to share them.</p>
            </div>
          </div>
        </section>
        
        <section className="cta">
          <h2>Ready to find your tribe?</h2>
          <p>Join thousands of people discovering communities built around their unique passions.</p>
          <button className="btn-primary">Get Started - It's Free</button>
        </section>
      </main>
    </div>
  );
};

export default Home;
