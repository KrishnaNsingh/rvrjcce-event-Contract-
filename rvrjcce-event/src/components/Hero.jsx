import React from '../core/react.js';
import { INSTITUTION } from '../../config/eventConfig.js';
import AnimatedButton from './ui/animated-button.tsx';

export function Hero({ onExploreEvents, onRegisterClick }) {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-grid">
          {/* Left Column: Editorial Copy & CTAs */}
          <div className="hero-content">
            <div className="hero-eyebrow">
              <span className="eyebrow" style={{ marginBottom: 0 }}>
                <span className="eyebrow-dot"></span>
                RVRJCCE • ANDHRA PRADESH
              </span>
              <span className="badge badge-navy">Annual Meet 2026</span>
            </div>

            <h1 className="heading-display hero-title">
              Where <em>Competition</em> Meets <em>Expression</em>.
            </h1>

            <p className="text-lead hero-copy">
              A university platform bringing together students through high-intensity sports,
              literature, fine arts, music, dance, dramatics, fashion, and cultural competitions.
              Designed for grit, creative audacity, and inter-collegiate camaraderie.
            </p>

            <div className="hero-ctas">
              <button
                className="btn btn-primary btn-lg"
                onClick={onExploreEvents}
              >
                <span>Explore Events</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              <AnimatedButton
                className="btn-animated-light"
                style={{ padding: '0.875rem 1.75rem', fontSize: '0.9375rem' }}
                onClick={onRegisterClick}
              >
                Register Now
              </AnimatedButton>
            </div>

            {/* Micro Details */}
            <div className="hero-micro-details">
              <span>SPORTS</span>
              <span className="hero-micro-divider"></span>
              <span>LITERARY</span>
              <span className="hero-micro-divider"></span>
              <span>CULTURAL</span>
            </div>
          </div>

          {/* Right Column: Visual Composition representing Sports, Fine Arts & Stage */}
          <div className="hero-visual-frame">
            <div className="hero-visual-grid">
              {/* Cell 1: Athletic Court / Sports */}
              <div className="visual-cell visual-cell-sports">
                <div className="visual-cell-tag">
                  <span>01 • ATHLETIC ARENA</span>
                  <span className="badge badge-navy" style={{ fontSize: '0.625rem' }}>COURT / FIELD</span>
                </div>
                {/* Court vector diagram & athletic composition */}
                <div style={{ margin: 'auto 0', textAlign: 'center' }}>
                  <svg width="100%" height="110" viewBox="0 0 200 110" fill="none" style={{ opacity: 0.85 }}>
                    <rect x="10" y="10" width="180" height="90" rx="3" stroke="#0E223D" strokeWidth="1.5" fill="#F4F8FB" />
                    <line x1="100" y1="10" x2="100" y2="100" stroke="#0E223D" strokeWidth="1.5" />
                    <circle cx="100" cy="55" r="22" stroke="#0E223D" strokeWidth="1.5" fill="none" />
                    <path d="M10 32.5 h35 a22.5 22.5 0 0 1 0 45 h-35" stroke="#0E223D" strokeWidth="1.5" fill="none" />
                    <path d="M190 32.5 h-35 a22.5 22.5 0 0 0 0 45 h35" stroke="#0E223D" strokeWidth="1.5" fill="none" />
                    {/* Dynamic ball trajectory arc */}
                    <path d="M35 80 Q 95 10 165 45" stroke="#9E472A" strokeWidth="2" strokeDasharray="3 3" fill="none" />
                    <circle cx="165" cy="45" r="4.5" fill="#9E472A" />
                  </svg>
                </div>
                <div>
                  <div className="visual-cell-caption">
                    Hardcourt Agility & Rally Spirit
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Basketball • Volleyball • Tennis • Table Tennis
                  </div>
                </div>
              </div>

              {/* Cell 2: Fine Arts / Creative Crafts */}
              <div className="visual-cell visual-cell-arts">
                <div className="visual-cell-tag">
                  <span style={{ color: 'var(--accent-cultural)' }}>02 • VISUAL ARTS</span>
                  <span className="badge badge-terracotta" style={{ fontSize: '0.625rem' }}>STUDIO</span>
                </div>
                <div style={{ margin: 'auto 0' }}>
                  <svg width="100%" height="60" viewBox="0 0 180 60" fill="none" style={{ opacity: 0.9 }}>
                    <path d="M20 45 C 50 15, 80 50, 110 20 C 130 5, 150 35, 170 15" stroke="#9E472A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <circle cx="20" cy="45" r="3" fill="#9E472A" />
                    <circle cx="110" cy="20" r="3" fill="#9E472A" />
                    <circle cx="170" cy="15" r="3" fill="#9E472A" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    Canvas & Brushcraft
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    Fine Arts • Tekraft Media
                  </div>
                </div>
              </div>

              {/* Cell 3: Performing Stage */}
              <div className="visual-cell visual-cell-stage">
                <div className="visual-cell-tag">
                  <span>03 • AUDITORIUM</span>
                  <span className="badge" style={{ fontSize: '0.625rem' }}>STAGE</span>
                </div>
                <div style={{ margin: 'auto 0' }}>
                  <svg width="100%" height="45" viewBox="0 0 180 45" fill="none" style={{ opacity: 0.85 }}>
                    <path d="M15 35 Q 90 5 165 35" stroke="#0E223D" strokeWidth="1.5" fill="none" />
                    <line x1="30" y1="33" x2="30" y2="40" stroke="#0E223D" strokeWidth="1" />
                    <line x1="60" y1="23" x2="60" y2="40" stroke="#0E223D" strokeWidth="1" />
                    <line x1="90" y1="19" x2="90" y2="40" stroke="#0E223D" strokeWidth="1" />
                    <line x1="120" y1="23" x2="120" y2="40" stroke="#0E223D" strokeWidth="1" />
                    <line x1="150" y1="33" x2="150" y2="40" stroke="#0E223D" strokeWidth="1" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    Stage & Soundwaves
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    Choreoday • Band • Dramatics
                  </div>
                </div>
              </div>
            </div>

            {/* Official Institutional Badge Stamp */}
            <div className="hero-stamp-badge">
              <span>{INSTITUTION.name} • 2026</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
