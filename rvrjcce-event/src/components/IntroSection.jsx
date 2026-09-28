import React from '../core/react.js';
import { INSTITUTION } from '../../config/eventConfig.js';

export function IntroSection({ liveStats }) {
  // Use dynamic count if available from API/database, otherwise display clean dynamic placeholder
  const eventsCount = "XX+ Events";
  const participantsCount = liveStats && liveStats.total ? `${liveStats.total}+ Registered` : "XX+ Participants";
  const daysCount = "XX Days";
  const venuesCount = "XX Venues";

  return (
    <section className="section-wrapper intro-section" id="intro-section">
      <div className="container">
        <div className="intro-grid">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-dot"></span>
              INSTITUTIONAL ETHOS
            </span>
            <h2 className="intro-statement">
              An event built for participation.
            </h2>
          </div>

          <div className="intro-paragraphs">
            <p className="text-body" style={{ fontSize: '1.0625rem' }}>
              At {INSTITUTION.fullName}, athletic rigor and cultural inquiry stand as complementary pillars of student formation.
              This annual inter-college championship unites collegiate teams from across the state in a shared arena of sportsmanship,
              creative expression, and intellectual vitality.
            </p>
            <p className="text-caption">
              Competitions are structured with accredited refereeing, jury-moderated cultural stages, and verified
              inter-collegiate eligibility protocols.
            </p>
          </div>
        </div>

        {/* Dynamic Statistics Strip with clear placeholder indicators */}
        <div className="stats-strip">
          <div className="stat-item">
            <span className="stat-value">{eventsCount}</span>
            <span className="stat-label">Competitions</span>
            <span className="stat-footnote">* Dynamic database placeholder</span>
          </div>

          <div className="stat-item">
            <span className="stat-value">{participantsCount}</span>
            <span className="stat-label">Student Entries</span>
            <span className="stat-footnote">* Live sync with MongoDB registrations</span>
          </div>

          <div className="stat-item stat-item-cultural">
            <span className="stat-value">{daysCount}</span>
            <span className="stat-label">Championship Duration</span>
            <span className="stat-footnote">* Schedule placeholder pending university notification</span>
          </div>

          <div className="stat-item stat-item-cultural">
            <span className="stat-value">{venuesCount}</span>
            <span className="stat-label">Dedicated Grounds</span>
            <span className="stat-footnote">* Courts & auditorium facilities</span>
          </div>
        </div>
      </div>
    </section>
  );
}
