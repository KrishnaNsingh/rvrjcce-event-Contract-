import React from '../core/react.js';
import { INSTITUTION } from '../../config/eventConfig.js';

export function RegistrationCTA({ onRegisterClick }) {
  return (
    <section className="section-wrapper registration-cta-section">
      <div className="container">
        <div className="cta-box-inner">
          <span className="eyebrow" style={{ justifyContent: 'center' }}>
            <span className="eyebrow-dot"></span>
            INTER-COLLEGE MEET • 2026
          </span>

          <h2 className="heading-section cta-box-title">
            Ready to take the stage?
          </h2>

          <p className="text-lead cta-box-desc">
            Choose your competition and complete your official institutional registration.
            Open to accredited undergraduate and postgraduate students.
          </p>

          <div className="cta-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => onRegisterClick()}
            >
              <span>Register Now</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
