import React, { useState, useEffect } from '../core/react.js';
import { INSTITUTION } from '../../config/eventConfig.js';
import AnimatedButton from './ui/animated-button.js';
import SpotlightNavbar from './ui/spotlight-navbar.js';

export function Navbar({ currentRoute, onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNavIndex, setActiveNavIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const threshold = currentRoute === 'home' ? 50 : 10;
      setIsScrolled(window.scrollY > threshold);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentRoute]);

  // Scroll-responsive synchronization for middle spotlight navbar
  useEffect(() => {
    if (currentRoute === 'results') {
      setActiveNavIndex(5);
      return;
    }
    if (currentRoute === 'register') {
      setActiveNavIndex(6);
      return;
    }
    if (currentRoute === 'admin') {
      setActiveNavIndex(7);
      return;
    }

    const handleScrollSpy = () => {
      const scrollY = window.scrollY;
      if (scrollY < 280) {
        setActiveNavIndex(0); // Home
        return;
      }

      const galleryEl = document.getElementById('gallery-section');
      const culturalEl = document.getElementById('cultural-section');
      const sportsEl = document.getElementById('sports-section');
      const discoveryEl = document.getElementById('discovery-section');

      const triggerLine = window.innerHeight * 0.45;

      if (galleryEl && galleryEl.getBoundingClientRect().top <= triggerLine) {
        setActiveNavIndex(4); // Gallery
        return;
      }
      if (culturalEl && culturalEl.getBoundingClientRect().top <= triggerLine) {
        setActiveNavIndex(3); // Literary & Cultural
        return;
      }
      if (sportsEl && sportsEl.getBoundingClientRect().top <= triggerLine) {
        setActiveNavIndex(2); // Sports
        return;
      }
      if (discoveryEl && discoveryEl.getBoundingClientRect().top <= triggerLine) {
        setActiveNavIndex(1); // Events
        return;
      }

      setActiveNavIndex(0); // Home fallback
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [currentRoute]);

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

  const NAV_ITEMS = [
    { label: "Home", href: "#", route: "home", sectionId: null },
    { label: "Events", href: "#discovery-section", route: "home", sectionId: "discovery-section" },
    { label: "Sports", href: "#sports-section", route: "home", sectionId: "sports-section" },
    { label: "Literary & Cultural", href: "#cultural-section", route: "home", sectionId: "cultural-section" },
    { label: "Gallery", href: "#gallery-section", route: "home", sectionId: "gallery-section" },
    { label: "Results & Notices", href: "/results", route: "results", sectionId: null },
    { label: "Register", href: "/register", route: "register", sectionId: null },
    { label: "Admin", href: "/admin", route: "admin", sectionId: null }
  ];

  return (
    <header className={`site-nav ${isScrolled ? 'scrolled' : ''} ${currentRoute !== 'home' ? 'nav-solid' : ''}`}>
      <div className="container">
        <div className="nav-inner">
          {/* University Logo */}
          <div
            className="nav-brand"
            style={{ cursor: 'pointer' }}
            onClick={() => handleNavClick('home')}
            title={`${INSTITUTION.name} — Home`}
          >
            <img
              src="/rvricon.ico"
              alt={`${INSTITUTION.name} University Logo`}
              className="brand-logo"
            />
          </div>

          {/* Middle Section: Award-Winning Spotlight Navbar */}
          <SpotlightNavbar
            className="desktop-spotlight-nav"
            items={NAV_ITEMS}
            activeIndex={activeNavIndex}
            onItemClick={(item, idx) => {
              setActiveNavIndex(idx);
              handleNavClick(item.route, item.sectionId);
            }}
          />

          {/* Action CTAs */}
          <div className="nav-actions">
            <AnimatedButton
              className="btn-animated-navy"
              onClick={() => handleNavClick('register')}
            >
              Register Now
            </AnimatedButton>
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
        <a className="mobile-nav-link" onClick={() => handleNavClick('home', 'discovery-section')}>
          Events Overview
        </a>
        <a className="mobile-nav-link" onClick={() => handleNavClick('home', 'sports-section')}>
          Sports (Boys & Girls)
        </a>
        <a className="mobile-nav-link" onClick={() => handleNavClick('home', 'cultural-section')}>
          Literary & Cultural
        </a>
        <a className="mobile-nav-link" onClick={() => handleNavClick('home', 'gallery-section')}>
          Campus Gallery
        </a>
        <a className="mobile-nav-link" onClick={() => handleNavClick('results')}>
          Results &amp; Announcements
        </a>
        <a className="mobile-nav-link" onClick={() => handleNavClick('register')}>
          Event Registration
        </a>
        <a className="mobile-nav-link" onClick={() => handleNavClick('admin')}>
          Admin Portal
        </a>
        <div style={{ marginTop: '1.25rem' }}>
          <AnimatedButton
            className="btn-animated-navy"
            style={{ width: '100%' }}
            onClick={() => handleNavClick('register')}
          >
            Register Now
          </AnimatedButton>
        </div>
      </div>
    </header>
  );
}
