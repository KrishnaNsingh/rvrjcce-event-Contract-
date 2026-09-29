import React from '../core/react.js';
import WaveGridBackground from './ui/wave-grid-background.tsx';

export function FeaturedArena({ onSelectCategory, onRegisterClick }) {
  return (
    <section className="section-wrapper featured-arena-section" id="featured-arena">
      <div className="featured-arena-wave-bg" aria-hidden="true">
        <WaveGridBackground
          colorBase="#ffffff"
          colorHigh="#0055ff"
        />
      </div>

      <div className="container featured-arena-container">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
          <span className="eyebrow" style={{ justifyContent: 'center' }}>
            <span className="eyebrow-dot"></span>
            DISCIPLINE SELECTOR
          </span>
          <h2 className="heading-section" style={{ marginBottom: '0.75rem' }}>
            Choose your arena.
          </h2>
          <p className="text-body">
            Whether your talent thrives on the high-intensity court or beneath the auditorium spotlight,
            find your competition and represent your college.
          </p>
        </div>

        <div className="arena-grid">
          {/* Sports Arena: Compete */}
          <div className="arena-box arena-box-sports">
            <div>
              <div className="arena-eyebrow">ATHLETIC TOURNAMENTS</div>
              <h3 className="arena-title">SPORTS — <em>Compete</em></h3>
              <p className="arena-desc">
                Dedicated hardcourt and outdoor championship grounds for Basketball, Volleyball,
                Throwball, Lawn Tennis, and Table Tennis with official collegiate referee panels.
              </p>

              <ul className="arena-features">
                <li>Boys & Girls specific divisional brackets</li>
                <li>Knockout fixtures and match refereeing</li>
                <li>Team championship trophies and individual player laurels</li>
                <li>Official tournament balls and court provisions</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => onRegisterClick('Sports')}
              >
                Register for Sports
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => onSelectCategory('sports')}
              >
                Explore Sports Fixtures
              </button>
            </div>
          </div>

          {/* Cultural Arena: Create */}
          <div className="arena-box arena-box-cultural">
            <div>
              <div className="arena-eyebrow">STAGE & STUDIO</div>
              <h3 className="arena-title">LITERARY & CULTURAL — <em>Create</em></h3>
              <p className="arena-desc">
                Acoustically engineered auditoriums, outdoor amphitheatre, and fine arts studios
                showcasing vocal harmonies, choreographies, runway fashion, and dramatic theatre.
              </p>

              <ul className="arena-features">
                <li>Solo and group classifications across Dance & Music</li>
                <li>Flagship Choreoday thematic ensemble showcase</li>
                <li>Professional lighting, concert acoustic audio, and stage tech</li>
                <li>Distinguished external jury evaluation panel</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-cultural"
                onClick={() => onRegisterClick('Literary & Cultural')}
              >
                Register for Cultural
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => onSelectCategory('cultural')}
              >
                Explore Cultural Events
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
