import React, { useState, useEffect } from './core/react.js';
import { Navbar } from './components/Navbar.jsx';
import { Hero } from './components/Hero.jsx';
import { IntroSection } from './components/IntroSection.jsx';
import { EventDiscovery } from './components/EventDiscovery.jsx';
import { SportsSection } from './components/SportsSection.jsx';
import { LiteraryCulturalSection } from './components/LiteraryCulturalSection.jsx';
import { GallerySection } from './components/GallerySection.jsx';
import { FeaturedArena } from './components/FeaturedArena.jsx';
import { RegistrationCTA } from './components/RegistrationCTA.jsx';
import { RegistrationForm } from './components/RegistrationForm.jsx';
import { AdminDashboard } from './components/AdminDashboard.jsx';
import { Footer } from './components/Footer.jsx';
import { fetchStats } from './api/client.js';

export function App() {
  const getInitialRoute = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\//, '');
      if (path === 'register') return 'register';
      if (path === 'admin') return 'admin';
    }
    return 'home';
  };

  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
  const [prefilledEvent, setPrefilledEvent] = useState({
    category: 'Sports',
    division: 'Boys',
    event: 'Basketball'
  });
  const [liveStats, setLiveStats] = useState(null);

  // Synchronize route with browser history
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '');
      if (path === 'register') setCurrentRoute('register');
      else if (path === 'admin') setCurrentRoute('admin');
      else setCurrentRoute('home');
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState();

    // Fetch initial live stats
    fetchStats().then(stats => {
      if (stats) setLiveStats(stats);
    });

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route, pushState = true) => {
    setCurrentRoute(route);
    if (pushState) {
      const url = route === 'home' ? '/' : `/${route}`;
      window.history.pushState({}, '', url);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegisterSpecificEvent = (category, division, eventName) => {
    setPrefilledEvent({
      category: category || 'Sports',
      division: division || 'Boys',
      event: eventName || 'Basketball'
    });
    navigateTo('register');
  };

  const handleScrollToSection = (sectionId) => {
    if (currentRoute !== 'home') {
      navigateTo('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="site-wrapper">
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigateTo}
      />

      <main className={currentRoute !== 'home' ? 'main-with-nav-offset' : ''}>
        {currentRoute === 'home' && (
          <>
            {/* 1. Hero Section */}
            <Hero
              onExploreEvents={() => handleScrollToSection('discovery-section')}
              onRegisterClick={() => navigateTo('register')}
              liveStats={liveStats}
            />

            {/* 2. Institutional Introduction & Dynamic Stats */}
            <IntroSection liveStats={liveStats} />

            {/* 3. Event Discovery Overview (01 Sports vs 02 Cultural) */}
            <EventDiscovery
              onSelectCategory={(cat) => handleScrollToSection(cat === 'sports' ? 'sports-section' : 'cultural-section')}
            />

            {/* 4. Sports Visual & Divisional Section */}
            <SportsSection
              onRegisterEvent={handleRegisterSpecificEvent}
            />

            {/* 5. Transition & Literary & Cultural Section */}
            <LiteraryCulturalSection
              onRegisterEvent={handleRegisterSpecificEvent}
            />

            {/* 5b. Dynamic 3D Cylinder Campus & Event Gallery */}
            <GallerySection />

            {/* 6. Featured "Choose Your Arena" Experience */}
            <FeaturedArena
              onSelectCategory={(cat) => handleScrollToSection(cat === 'sports' ? 'sports-section' : 'cultural-section')}
              onRegisterClick={(cat) => {
                setPrefilledEvent(prev => ({
                  ...prev,
                  category: cat || 'Sports'
                }));
                navigateTo('register');
              }}
            />

            {/* 7. Registration Closing CTA */}
            <RegistrationCTA
              onRegisterClick={() => navigateTo('register')}
            />
          </>
        )}

        {currentRoute === 'register' && (
          <RegistrationForm
            initialCategory={prefilledEvent.category}
            initialDivision={prefilledEvent.division}
            initialEvent={prefilledEvent.event}
            onSuccess={() => {
              // Refresh stats after successful registration
              fetchStats().then(stats => {
                if (stats) setLiveStats(stats);
              });
            }}
          />
        )}

        {currentRoute === 'admin' && (
          <AdminDashboard
            onNavigate={navigateTo}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}
