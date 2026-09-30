import React from '../core/react.js';
import { INSTITUTION } from '../../config/eventConfig.js';
import AnimatedButton from './ui/animated-button.js';
import TextAnimation from './ui/staggerText.js';

export function Hero({ onExploreEvents, onRegisterClick, liveStats }) {
  return (
    <section className="hero-reference-section" id="home">
      {/* Full Campus Aerial Panoramic Background */}
      <div className="hero-panoramic-bg" aria-hidden="true">
        <div
          className="hero-panoramic-image"
          style={{ backgroundImage: "url('/campus-hero-web.jpg')" }}
        />
        {/* Soft editorial scrim to guarantee pristine contrast on green grounds */}
        <div className="hero-editorial-scrim" />
      </div>

      <div className="container relative z-10">
        <div className="hero-reference-grid">
          {/* Main Editorial Serif Typography */}
          <div className="hero-editorial-col">
            {/* Highlights Header Row: COLORIDO 2K26 + 100% Free Registration */}
            <div className="hero-badges-wrapper">
              <div className="hero-fest-badge">
                <span className="hero-fest-dot" />
                <span className="hero-fest-name">COLORIDO 2K26</span>
                <span className="hero-badge-sep">•</span>
                <span className="hero-fest-sub">{INSTITUTION.name}</span>
              </div>

              <div className="hero-free-badge">
                <span className="hero-free-icon">✦</span>
                <span className="hero-free-text">FREE REGISTRATION FOR ANY EVENT</span>
                <span className="hero-free-tag">₹0 FEE</span>
              </div>
            </div>

            <h1 className="hero-editorial-heading">
              <span className="editorial-line editorial-line-1">WHERE</span>
              <span className="editorial-line editorial-line-2">COMPETITION</span>
              <span className="editorial-line editorial-line-3">
                MEETS ART — COLORIDO 2K26<span className="editorial-reg">®</span>
              </span>
            </h1>

            <p className="hero-editorial-sub">
              <TextAnimation divideBy="word" delay={0.25}>
                Annual Inter-Collegiate Sports & Cultural Festival. Compete across 15+ championship disciplines with zero entry fee — 100% free registration for all university students.
              </TextAnimation>
            </p>

            <div className="hero-editorial-actions">
              <AnimatedButton
                className="btn-hero-register"
                onClick={onRegisterClick}
                id="hero-register-btn"
              >
                <span className="btn-hero-inner">
                  <span>Register Free Now</span>
                  <span className="btn-zero-pill">100% Free</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </AnimatedButton>

              <button
                className="btn-hero-explore"
                onClick={onExploreEvents}
                id="hero-start-btn"
                title="Explore Events"
              >
                <span>EXPLORE EVENTS</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </button>
            </div>

            {/* Clean Inline Trust Indicators (replaces floating cards) */}
            <div className="hero-trust-bar">
              <div className="hero-trust-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Zero Entry Fee</span>
              </div>
              <span className="hero-trust-dot" />
              <div className="hero-trust-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>All Universities Eligible</span>
              </div>
              <span className="hero-trust-dot" />
              <div className="hero-trust-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>15+ Arenas</span>
              </div>
              <span className="hero-trust-dot" />
              <div className="hero-trust-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Instant E-Pass</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
