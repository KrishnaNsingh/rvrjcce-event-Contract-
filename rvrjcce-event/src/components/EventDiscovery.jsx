import React, { useState } from '../core/react.js';
import { CATEGORIES } from '../../config/eventConfig.js';

export function EventDiscovery({ onSelectCategory }) {
  const [hoveredSide, setHoveredSide] = useState(null);

  return (
    <section className="section-wrapper discovery-section" id="discovery-section">
      {/* Award-Winning Vertical Split Background */}
      <div className={`discovery-split-bg ${hoveredSide ? `hover-${hoveredSide}` : ''}`} aria-hidden="true">
        {/* Left Vertical Half: Sports */}
        <div className="discovery-split-side discovery-split-sports">
          <div
            className="discovery-split-image"
            style={{ backgroundImage: "url('/sports-web.jpg')" }}
          />
          <div className="discovery-split-overlay sports-gradient" />
          <div className="discovery-split-ambient sports-ambient" />
        </div>

        {/* Center Vertical Seam Line & Emblem */}
        <div className="discovery-split-seam">
          <div className="seam-line" />
          <div className="seam-badge">
            <span className="seam-dot sports-dot" />
            <span className="seam-text">2026</span>
            <span className="seam-dot cultural-dot" />
          </div>
        </div>

        {/* Right Vertical Half: Cultural */}
        <div className="discovery-split-side discovery-split-cultural">
          <div
            className="discovery-split-image"
            style={{ backgroundImage: "url('/cultural-web.jpg')" }}
          />
          <div className="discovery-split-overlay cultural-gradient" />
          <div className="discovery-split-ambient cultural-ambient" />
        </div>
      </div>

      <div className="container relative z-10">
        <div className="section-header-editorial">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-dot"></span>
              TWO DISCIPLINES • ONE STAGE
            </span>
            <h2 className="heading-section">
              Event Architecture
            </h2>
          </div>
          <p className="text-body" style={{ maxWidth: '460px' }}>
            Choose between competitive inter-collegiate sports brackets or our expansive
            literary, dramatic, musical, and visual arts competitions.
          </p>
        </div>

        <div className="discovery-pillars">
          {/* Pillar 01: Sports */}
          <div
            className="discovery-card discovery-card-sports"
            onClick={() => onSelectCategory('sports')}
            onMouseEnter={() => setHoveredSide('sports')}
            onMouseLeave={() => setHoveredSide(null)}
          >
            {/* Ambient card aura */}
            <div
              className="card-bg-aura sports-aura"
              style={{ backgroundImage: "url('/sports-web.jpg')" }}
            />

            <div className="card-content-wrap">
              <div className="pillar-number">01 / CATEGORY</div>
              <h3 className="pillar-title">Sports Championship</h3>
              <div className="pillar-tagline sports">{CATEGORIES.SPORTS.tagline}</div>
              <p className="pillar-desc">
                High-stakes athletic tournaments across Basketball, Volleyball, Throwball,
                Lawn Tennis, and Table Tennis, segmented into dedicated Boys and Girls divisions.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <span className="badge badge-navy">Boys: Basketball • Volleyball • Table Tennis</span>
                <span className="badge badge-navy">Girls: Throwball • Tennis • Table Tennis</span>
              </div>
            </div>

            <div className="pillar-footer">
              <span className="text-caption">Official refereeing & tournament brackets</span>
              <span className="pillar-link">
                <span>View Sports Fixtures</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>

          {/* Pillar 02: Literary & Cultural */}
          <div
            className="discovery-card discovery-card-cultural"
            onClick={() => onSelectCategory('cultural')}
            onMouseEnter={() => setHoveredSide('cultural')}
            onMouseLeave={() => setHoveredSide(null)}
          >
            {/* Ambient card aura */}
            <div
              className="card-bg-aura cultural-aura"
              style={{ backgroundImage: "url('/cultural-web.jpg')" }}
            />

            <div className="card-content-wrap">
              <div className="pillar-number" style={{ color: 'var(--accent-cultural)' }}>02 / CATEGORY</div>
              <h3 className="pillar-title">Literary & Cultural</h3>
              <div className="pillar-tagline cultural">{CATEGORIES.CULTURAL.tagline}</div>
              <p className="pillar-desc">
                Eight curated creative categories spanning Fine Arts, Music & Band, Solo & Crew Dance,
                thematic Choreoday, Dramatics, Runway Fashion, Tekraft multimedia, and Literary debates.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <span className="badge badge-terracotta">Fine Arts • Music & Band • Dance</span>
                <span className="badge badge-terracotta">Choreoday • Dramatics • Fashion • Literary</span>
              </div>
            </div>

            <div className="pillar-footer">
              <span className="text-caption">Jury evaluated & auditorium showcases</span>
              <span className="pillar-link" style={{ color: 'var(--accent-cultural)' }}>
                <span>Explore Cultural Categories</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
