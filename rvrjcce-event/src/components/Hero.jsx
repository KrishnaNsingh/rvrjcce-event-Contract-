import React from '../core/react.js';
import { INSTITUTION } from '../../config/eventConfig.js';
import AnimatedButton from './ui/animated-button.js';
import TextAnimation from './ui/staggerText.js';

export function Hero({ onExploreEvents, onRegisterClick, liveStats }) {
  const participantCount = liveStats && liveStats.total ? `${liveStats.total}+` : '1,200+';

  return (
    <section className="hero-reference-section" id="home">
      {/* Full Campus Aerial Panoramic Background — Completely Visible */}
      <div className="hero-panoramic-bg" aria-hidden="true">
        <div
          className="hero-panoramic-image"
          style={{ backgroundImage: "url('/campus-hero-web.jpg')" }}
        />
      </div>

      <div className="container relative z-10">
        <div className="hero-reference-grid">
          {/* Main Editorial Serif Typography */}
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
              <TextAnimation divideBy="word" delay={0.25}>
                / Where Athletic Grit Meets Creative Expression • Annual Meet 2026 /
              </TextAnimation>
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

              <AnimatedButton
                className="btn-animated-navy"
                onClick={onRegisterClick}
                id="hero-register-btn"
              >
                Register Now
              </AnimatedButton>
            </div>
          </div>
        </div>

        {/* Bottom Floating Highlights Bar */}
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
          {/* <div className="bottom-statement-right">
            <div className="bottom-statement-title">
              <TextAnimation divideBy="word" delay={0.35}>
                WE UNITE ATHLETIC GRIT &amp; STAGE BRILLIANCE
              </TextAnimation>
            </div>
            <button className="bottom-statement-link" onClick={onExploreEvents}>
              <span>EXPLORE FIXTURES</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div> */}
        </div>
      </div>
    </section>
  );
}
