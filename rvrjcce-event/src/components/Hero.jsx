import React, { useState } from '../core/react.js';
import { INSTITUTION } from '../../config/eventConfig.js';

export function Hero({ onExploreEvents, onRegisterClick, liveStats }) {
  const [activeCategory, setActiveCategory] = useState('sports');
  const [activeHotspot, setActiveHotspot] = useState(null);

  const participantCount = liveStats && liveStats.total ? `${liveStats.total}+` : '1,200+';

  const hotspots = [
    {
      id: 'sports',
      label: 'Main Sports Arena',
      venue: 'Volleyball, Cricket & Hardcourt Brackets',
      x: 32,
      y: 32,
      category: 'sports'
    },
    {
      id: 'oat',
      label: 'Open Air Theatre (OAT)',
      venue: 'Dance, Band & Dramatics Main Stage',
      x: 64,
      y: 52,
      category: 'oat'
    },
    {
      id: 'studio',
      label: 'Creative Arts Wing',
      venue: 'Fine Arts, Tekraft & Literary Arenas',
      x: 82,
      y: 72,
      category: 'cultural'
    }
  ];

  return (
    <section className="hero-reference-section" id="home">
      {/* Full Campus Aerial Panoramic Background */}
      <div className="hero-panoramic-bg" aria-hidden="true">
        <div
          className="hero-panoramic-image"
          style={{ backgroundImage: "url('/campus-hero-web.jpg')" }}
        />
        <div className="hero-panoramic-overlay" />
      </div>

      <div className="container relative z-10">
        <div className="hero-reference-grid">
          {/* Left Column: Big Editorial Serif Typography (Reference Style) */}
          <div className="hero-editorial-col">
            <div className="hero-editorial-tag">
              <span className="editorial-dot" />
              <span>{INSTITUTION.name} • 40TH INTER-COLLEGIATE FESTIVAL</span>
            </div>

            <h1 className="hero-editorial-heading">
              <span className="editorial-line editorial-line-1">WHERE</span>
              <span className="editorial-line editorial-line-2">COMPETITION</span>
              <span className="editorial-line editorial-line-3">
                MEETS ART<span className="editorial-reg">®</span>
              </span>
            </h1>

            <p className="hero-editorial-sub">
              / Where Athletic Grit Meets Creative Expression • Annual Meet 2026 /
            </p>

            <div className="hero-editorial-actions">
              <button
                className="btn-editorial-start"
                onClick={onExploreEvents}
                id="hero-start-btn"
                title="Start Exploring Events"
              >
                <span>START</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              <button
                className="btn-editorial-register"
                onClick={onRegisterClick}
                id="hero-register-btn"
                title="Register for Competitions"
              >
                <span>Register Now</span>
              </button>
            </div>
          </div>

          {/* Right Column: Floating Architectural Card with Hotspots & Tour Callout */}
          <div className="hero-showcase-col">
            <div className="hero-floating-card">
              {/* Top Pill Controls */}
              <div className="showcase-top-bar">
                <div className="showcase-pills">
                  <button
                    className={`showcase-pill ${activeCategory === 'sports' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('sports')}
                  >
                    Sports
                  </button>
                  <button
                    className={`showcase-pill ${activeCategory === 'cultural' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('cultural')}
                  >
                    Cultural
                  </button>
                  <button
                    className={`showcase-pill ${activeCategory === 'oat' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('oat')}
                  >
                    OAT Stage
                  </button>
                </div>
              </div>

              <div className="showcase-text-header">
                <h3 className="showcase-card-title">Unique Discipline &amp; Spirit</h3>
                <p className="showcase-card-sub">From hardcourt rallies to auditorium showcases.</p>
              </div>

              {/* Panoramic Visual Window */}
              <div className="showcase-window">
                <div
                  className="showcase-window-img"
                  style={{ backgroundImage: "url('/campus-hero-web.jpg')" }}
                />
                <div className="showcase-window-overlay" />

                {/* Interactive Pulse Hotspots */}
                {hotspots.map((spot) => (
                  <div
                    key={spot.id}
                    className={`showcase-hotspot ${activeHotspot === spot.id || activeCategory === spot.category ? 'active' : ''}`}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    onMouseEnter={() => setActiveHotspot(spot.id)}
                    onMouseLeave={() => setActiveHotspot(null)}
                    onClick={onExploreEvents}
                  >
                    <span className="hotspot-ping" />
                    <span className="hotspot-center" />

                    {/* Floating Tooltip */}
                    <div className="hotspot-tooltip">
                      <div className="tooltip-title">{spot.label}</div>
                      <div className="tooltip-venue">{spot.venue}</div>
                    </div>
                  </div>
                ))}

                {/* Floating "CAMPUS TOUR" Card linked with leader line (exact match to ROOMTOUR in reference) */}
                <div
                  className="showcase-tour-callout"
                  onClick={onExploreEvents}
                  title="Explore Campus Arena"
                >
                  <div className="tour-callout-header">
                    <span>CAMPUS TOUR</span>
                  </div>
                  <div className="tour-callout-body">
                    <div className="tour-play-btn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="6 4 20 12 6 20 6 4" />
                      </svg>
                    </div>
                    <div
                      className="tour-thumb"
                      style={{ backgroundImage: "url('/sports-web.jpg')" }}
                    />
                  </div>
                  <div className="tour-callout-footer">
                    <span>Virtual Arena View</span>
                  </div>
                  <div className="tour-leader-line" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Floating Highlights Bar (Exact match to reference bottom strip!) */}
        <div className="hero-bottom-strip">
          {/* Bottom Left Terracotta Card */}
          <div className="bottom-card-terracotta">
            <div className="bottom-card-text">
              <div className="bottom-card-headline">24 Hours of Pure Grit!</div>
              <div className="bottom-card-caption">02 Flagship Disciplines • OAT Venues</div>
            </div>
            <div className="bottom-card-icon-area">
              <svg width="42" height="42" viewBox="0 0 48 48" fill="none">
                <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" fill="rgba(255,255,255,0.20)" stroke="#FFFFFF" strokeWidth="1.5" />
                <path d="M24 4V44M6 14L24 24L42 14M6 34L24 24" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.8" />
                <circle cx="24" cy="24" r="5" fill="#FFFFFF" />
              </svg>
            </div>
          </div>

          {/* Bottom Center: Avatars + Big Serif Italic Stat */}
          <div className="bottom-stats-center">
            <div className="bottom-avatars">
              <div className="bottom-avatar" style={{ backgroundImage: "url('/sports-web.jpg')" }} title="Athletics" />
              <div className="bottom-avatar" style={{ backgroundImage: "url('/cultural-web.jpg')" }} title="Cultural Arts" />
            </div>
            <div className="bottom-stat-details">
              <div className="bottom-stat-num">{participantCount}</div>
              <div className="bottom-stat-lbl">Registered Participants</div>
            </div>
          </div>

          {/* Bottom Right: Statement + Underlined Link */}
          <div className="bottom-statement-right">
            <div className="bottom-statement-title">
              WE UNITE ATHLETIC GRIT &amp; STAGE BRILLIANCE
            </div>
            <button className="bottom-statement-link" onClick={onExploreEvents}>
              <span>EXPLORE FIXTURES</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
