import React, { useState } from '../core/react.js';
import { SPORTS_DIVISIONS } from '../../config/eventConfig.js';

export function SportsSection({ onRegisterEvent }) {
  const [activeDivision, setActiveDivision] = useState('all'); // 'all', 'boys', 'girls'

  const boysEvents = SPORTS_DIVISIONS.BOYS.events;
  const girlsEvents = SPORTS_DIVISIONS.GIRLS.events;

  const displayedEvents = activeDivision === 'boys'
    ? boysEvents
    : (activeDivision === 'girls' ? girlsEvents : [...boysEvents, ...girlsEvents]);

  return (
    <section className="section-wrapper sports-section" id="sports-section">
      <div className="container">
        <div className="section-header-editorial">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-dot"></span>
              ATHLETIC EXCELLENCE • 01
            </span>
            <h2 className="heading-section">
              Compete with purpose.
            </h2>
          </div>

          {/* Division Selector */}
          <div className="division-tabs">
            <button
              className={`division-tab ${activeDivision === 'all' ? 'active' : ''}`}
              onClick={() => setActiveDivision('all')}
            >
              All Sports ({boysEvents.length + girlsEvents.length})
            </button>
            <button
              className={`division-tab ${activeDivision === 'boys' ? 'active' : ''}`}
              onClick={() => setActiveDivision('boys')}
            >
              Boys Division ({boysEvents.length})
            </button>
            <button
              className={`division-tab ${activeDivision === 'girls' ? 'active' : ''}`}
              onClick={() => setActiveDivision('girls')}
            >
              Girls Division ({girlsEvents.length})
            </button>
          </div>
        </div>

        {/* Sports Editorial Grid */}
        <div className="sports-grid">
          {displayedEvents.map((evt) => (
            <div key={`${evt.division}-${evt.id}`} className="sport-card">
              <div>
                <div className="sport-card-header">
                  <span className="badge badge-navy">
                    {evt.division} Division
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {evt.format}
                  </span>
                </div>

                <h3 className="sport-name">{evt.name}</h3>
                <p className="sport-desc">{evt.shortDescription}</p>

                <div className="sport-meta-list">
                  <div className="sport-meta-row">
                    <span>Venue Type:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{evt.venueType}</strong>
                  </div>
                  <div className="sport-meta-row">
                    <span>Match Format:</span>
                    <span>{evt.duration}</span>
                  </div>
                  <div className="sport-meta-row">
                    <span>Tournament Mode:</span>
                    <span>Knockout Bracket</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  {evt.keyAttributes.map((attr, idx) => (
                    <span key={idx} className="badge badge-outline" style={{ fontSize: '0.6875rem' }}>
                      {attr}
                    </span>
                  ))}
                </div>
              </div>

              <div className="sport-card-footer">
                <span className="text-caption">Open Inter-College</span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onRegisterEvent('Sports', evt.division, evt.name)}
                >
                  <span>Register Entry</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
