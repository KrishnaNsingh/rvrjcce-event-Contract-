import React, { useState, useEffect } from '../core/react.js';
import { INSTITUTION } from '../../config/eventConfig.js';

export function Navbar({ currentRoute, onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (route, sectionId = null) => {
    setMobileMenuOpen(false);
    onNavigate(route);
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className={`site-nav ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="nav-inner">
          {/* Institution Crest & Title */}
          <div
            className="nav-brand"
            style={{ cursor: 'pointer' }}
            onClick={() => handleNavClick('home')}
          >
            <div className="brand-crest">
              <span>RVR</span>
            </div>
            <div className="brand-text">
              <span className="brand-title">{INSTITUTION.name}</span>
              <span className="brand-subtitle">Andhra Pradesh</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="nav-links">
            <a
              className={`nav-link ${currentRoute === 'home' ? 'active' : ''}`}
              onClick={() => handleNavClick('home')}
            >
              Home
            </a>
            <a
              className="nav-link"
              onClick={() => handleNavClick('home', 'sports-section')}
            >
              Sports
            </a>
            <a
              className="nav-link"
              onClick={() => handleNavClick('home', 'cultural-section')}
            >
              Literary & Cultural
            </a>
            <a
              className="nav-link"
              onClick={() => handleNavClick('home', 'discovery-section')}
            >
              Events
            </a>
            <a
              className={`nav-link ${currentRoute === 'register' ? 'active' : ''}`}
              onClick={() => handleNavClick('register')}
            >
              Register
            </a>
            <a
              className={`nav-link ${currentRoute === 'admin' ? 'active' : ''}`}
              onClick={() => handleNavClick('admin')}
              style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}
            >
              Admin Portal
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="nav-actions">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleNavClick('register')}
            >
              Register Now
            </button>
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <a className="mobile-nav-link" onClick={() => handleNavClick('home')}>
          Home
        </a>
        <a className="mobile-nav-link" onClick={() => handleNavClick('home', 'sports-section')}>
          Sports (Boys & Girls)
        </a>
        <a className="mobile-nav-link" onClick={() => handleNavClick('home', 'cultural-section')}>
          Literary & Cultural
        </a>
        <a className="mobile-nav-link" onClick={() => handleNavClick('home', 'discovery-section')}>
          Events Overview
        </a>
        <a className="mobile-nav-link" onClick={() => handleNavClick('register')}>
          Event Registration
        </a>
        <a className="mobile-nav-link" onClick={() => handleNavClick('admin')}>
          Admin Portal
        </a>
        <div style={{ marginTop: '1.25rem' }}>
          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={() => handleNavClick('register')}
          >
            Register Now
          </button>
        </div>
      </div>
    </header>
  );
}
