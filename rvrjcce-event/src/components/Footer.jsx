import React from '../core/react.js';
import { INSTITUTION } from '../../config/eventConfig.js';

export function Footer({ onNavigate }) {
  const handleNav = (route, sectionId = null) => {
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
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand-column">
            <div className="footer-brand-title">{INSTITUTION.name}</div>
            <p className="footer-accreditation">
              {INSTITUTION.fullName}<br />
              {INSTITUTION.location}<br />
              {INSTITUTION.accreditation}
            </p>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Annual Inter-College Sports & Cultural Meet
            </div>
          </div>

          {/* Sports Column */}
          <div>
            <div className="footer-heading">Sports</div>
            <ul className="footer-links">
              <li><a onClick={() => handleNav('home', 'sports-section')}>Basketball (Boys)</a></li>
              <li><a onClick={() => handleNav('home', 'sports-section')}>Volleyball (Boys)</a></li>
              <li><a onClick={() => handleNav('home', 'sports-section')}>Throwball (Girls)</a></li>
              <li><a onClick={() => handleNav('home', 'sports-section')}>Tennis (Girls)</a></li>
              <li><a onClick={() => handleNav('home', 'sports-section')}>Table Tennis (Boys & Girls)</a></li>
            </ul>
          </div>

          {/* Literary & Cultural Column */}
          <div>
            <div className="footer-heading">Literary & Cultural</div>
            <ul className="footer-links">
              <li><a onClick={() => handleNav('home', 'cultural-section')}>Fine Arts</a></li>
              <li><a onClick={() => handleNav('home', 'cultural-section')}>Music & Band (Solo/Group)</a></li>
              <li><a onClick={() => handleNav('home', 'cultural-section')}>Dance (Solo/Group)</a></li>
              <li><a onClick={() => handleNav('home', 'cultural-section')}>Choreoday (Theme Based)</a></li>
              <li><a onClick={() => handleNav('home', 'cultural-section')}>Dramatics & Fashion Show</a></li>
              <li><a onClick={() => handleNav('home', 'cultural-section')}>Tekraft & Literary</a></li>
            </ul>
          </div>

          {/* Event & Portal Links */}
          <div>
            <div className="footer-heading">Portal & Desk</div>
            <ul className="footer-links">
              <li><a onClick={() => handleNav('register')}>Participant Registration</a></li>
              <li><a onClick={() => handleNav('admin')}>Admin Management Portal</a></li>
              <li><a onClick={() => handleNav('home', 'intro-section')}>Institutional Ethos</a></li>
              <li>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Organizing Committee Secretariat<br />
                  Campus Event Office, {INSTITUTION.name}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div>
            © 2026 {INSTITUTION.name}. All institutional rights reserved.
          </div>
          <div>
            Inter-College Sports, Literary & Cultural Festival
          </div>
        </div>
      </div>
    </footer>
  );
}
