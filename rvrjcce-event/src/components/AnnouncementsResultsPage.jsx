import React, { useState, useEffect } from '../core/react.js';
import { fetchAnnouncements, fetchResults, fetchFaculty } from '../api/client.js';
import { generateCertificatePDF } from '../utils/pdfCertificateGenerator.js';
import TextAnimation from './ui/staggerText.js';

export function AnnouncementsResultsPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('results'); // 'results' | 'announcements' | 'faculty'
  const [results, setResults] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for Results
  const [resultCategory, setResultCategory] = useState('all');
  const [resultDivision, setResultDivision] = useState('all');
  const [resultSearch, setResultSearch] = useState('');

  // Filters for Announcements
  const [announcementCategory, setAnnouncementCategory] = useState('all');

  // Certificate Download State
  const [downloadingId, setDownloadingId] = useState(null);

  // Load initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [resData, annData, facData] = await Promise.all([
        fetchResults(),
        fetchAnnouncements(),
        fetchFaculty()
      ]);
      setResults(resData || []);
      setAnnouncements(annData || []);
      setFaculty(facData || []);
    } catch (err) {
      console.error('Failed to load announcements & results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Results
  const filteredResults = results.filter(r => {
    if (resultCategory !== 'all' && r.category !== resultCategory) return false;
    if (resultDivision !== 'all' && r.division !== resultDivision) return false;
    if (resultSearch) {
      const s = resultSearch.toLowerCase();
      const match = (r.participantName && r.participantName.toLowerCase().includes(s)) ||
                    (r.teamName && r.teamName.toLowerCase().includes(s)) ||
                    (r.college && r.college.toLowerCase().includes(s)) ||
                    (r.event && r.event.toLowerCase().includes(s)) ||
                    (r.certificateId && r.certificateId.toLowerCase().includes(s));
      if (!match) return false;
    }
    return true;
  });

  // Filtered Announcements
  const filteredAnnouncements = announcements.filter(a => {
    if (announcementCategory !== 'all' && a.category !== announcementCategory) return false;
    return true;
  });

  const handleDownloadCertificate = async (resItem) => {
    try {
      setDownloadingId(resItem.certificateId || resItem._id);
      generateCertificatePDF(resItem);
    } catch (err) {
      console.error('Certificate generation error:', err);
      alert('Failed to generate certificate PDF. Please try again.');
    } finally {
      setTimeout(() => setDownloadingId(null), 800);
    }
  };

  return (
    <div className="announcements-results-page">
      {/* Background with custom wave ribbon backdrop */}
      <div className="page-wave-ribbon-bg" aria-hidden="true">
        <div
          className="wave-ribbon-layer"
          style={{ backgroundImage: "url('/wave-ribbon.png')" }}
        />
      </div>

      <div className="container relative z-10">
        {/* Editorial Page Header */}
        <div className="page-editorial-header">
          <div className="page-header-tag">
            <span className="editorial-dot" />
            <span>OFFICIAL BULLETIN &amp; HONORS • COLORIDO 2K26</span>
          </div>

          <h1 className="page-main-heading">
            <TextAnimation divideBy="word" delay={0.1}>
              Results &amp; Announcements
            </TextAnimation>
          </h1>

          <p className="page-main-sub">
            Verified tournament verdicts, downloadable merit certificates, and real-time scheduling circulars from the university organizing committee.
          </p>

          {/* Navigation Tab Switcher */}
          <div className="ar-tab-bar">
            <button
              className={`ar-tab-btn ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
              <span>Tournament Laurels ({results.length})</span>
            </button>

            <button
              className={`ar-tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
              onClick={() => setActiveTab('announcements')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span>Official Notices ({announcements.length})</span>
            </button>

            <button
              className={`ar-tab-btn ${activeTab === 'faculty' ? 'active' : ''}`}
              onClick={() => setActiveTab('faculty')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Faculty Panel ({faculty.length || 4})</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: TOURNAMENT RESULTS & DOWNLOADABLE CERTIFICATES
           ========================================================================= */}
        {activeTab === 'results' && (
          <div className="ar-content-area">
            {/* Filter Bar */}
            <div className="ar-filter-box">
              <div className="ar-search-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by winner name, team, college, or certificate ID..."
                  value={resultSearch}
                  onChange={(e) => setResultSearch(e.target.value)}
                  className="ar-search-input"
                />
                {resultSearch && (
                  <button className="ar-clear-btn" onClick={() => setResultSearch('')}>×</button>
                )}
              </div>

              <div className="ar-dropdown-group">
                <select
                  value={resultCategory}
                  onChange={(e) => setResultCategory(e.target.value)}
                  className="ar-select"
                >
                  <option value="all">All Categories</option>
                  <option value="Sports">Sports Disciplines</option>
                  <option value="Literary & Cultural">Literary &amp; Cultural</option>
                </select>

                <select
                  value={resultDivision}
                  onChange={(e) => setResultDivision(e.target.value)}
                  className="ar-select"
                >
                  <option value="all">All Divisions</option>
                  <option value="Boys">Boys / Men</option>
                  <option value="Girls">Girls / Women</option>
                  <option value="Open">Open Category</option>
                </select>
              </div>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="ar-loading-state">
                <div className="ar-spinner" />
                <p>Loading tournament results from official database...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="ar-empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <h3>No Tournament Results Found</h3>
                <p>Try adjusting your search query or discipline filter options.</p>
              </div>
            ) : (
              <div className="results-cards-grid">
                {filteredResults.map((r, i) => {
                  const isGold = r.position && r.position.includes('1st');
                  const isSilver = r.position && r.position.includes('2nd');
                  const isBronze = r.position && r.position.includes('3rd');

                  return (
                    <div
                      key={r._id || r.id || r.certificateId || i}
                      className={`result-laurel-card ${isGold ? 'gold-tier' : isSilver ? 'silver-tier' : isBronze ? 'bronze-tier' : ''}`}
                    >
                      {/* Card Top: Event & Position Ribbon */}
                      <div className="result-card-header">
                        <div className="result-event-tag">
                          <span className="result-cat-lbl">{r.category}</span>
                          <span className="result-dot-sep">•</span>
                          <span className="result-div-lbl">{r.division}</span>
                        </div>
                        <div className={`result-position-badge ${isGold ? 'pos-gold' : isSilver ? 'pos-silver' : 'pos-bronze'}`}>
                          {isGold && '🥇 '}
                          {isSilver && '🥈 '}
                          {isBronze && '🥉 '}
                          {r.position}
                        </div>
                      </div>

                      {/* Main Event Title */}
                      <h3 className="result-event-title">{r.event}</h3>

                      {/* Winner Showcase */}
                      <div className="result-winner-section">
                        <div className="winner-lead-row">
                          <span className="winner-crown-icon">🏆</span>
                          <div>
                            <div className="winner-name-highlight">{r.participantName}</div>
                            {r.teamName && (
                              <div className="winner-team-subtitle">Squad: <strong>{r.teamName}</strong></div>
                            )}
                          </div>
                        </div>

                        <div className="winner-institution">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 21h18M3 7l9-4 9 4v14H3zM9 10h6" />
                          </svg>
                          <span>{r.college}</span>
                        </div>

                        {r.scoreOrRound && (
                          <div className="winner-score-pill">
                            <span>Score: {r.scoreOrRound}</span>
                          </div>
                        )}

                        {/* Teammates List if Team Event */}
                        {Array.isArray(r.teammates) && r.teammates.length > 0 && (
                          <div className="winner-squad-block">
                            <span className="squad-title">Team Roster:</span>
                            <div className="squad-chips">
                              {r.teammates.map((mate, mIdx) => (
                                <span key={mIdx} className="squad-chip">{mate}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Certificate ID & Download CTA */}
                      <div className="result-card-footer">
                        <div className="result-cert-id" title="Official Verification ID">
                          <span className="cert-id-lbl">ID:</span>
                          <code>{r.certificateId || 'CERT-VERIFIED'}</code>
                        </div>

                        <button
                          className="btn-download-cert"
                          onClick={() => handleDownloadCertificate(r)}
                          disabled={downloadingId === (r.certificateId || r._id)}
                          title="Download Official Certificate of Merit in PDF format"
                        >
                          {downloadingId === (r.certificateId || r._id) ? (
                            <>
                              <span className="btn-spinner" />
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                              <span>Certificate (PDF)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: OFFICIAL ANNOUNCEMENTS & CIRCULARS
           ========================================================================= */}
        {activeTab === 'announcements' && (
          <div className="ar-content-area">
            {/* Filter Chips */}
            <div className="announcement-filter-chips">
              <button
                className={`filter-chip ${announcementCategory === 'all' ? 'active' : ''}`}
                onClick={() => setAnnouncementCategory('all')}
              >
                All Bulletins ({announcements.length})
              </button>
              <button
                className={`filter-chip ${announcementCategory === 'Schedule Update' ? 'active' : ''}`}
                onClick={() => setAnnouncementCategory('Schedule Update')}
              >
                Schedule Updates
              </button>
              <button
                className={`filter-chip ${announcementCategory === 'Venue Alert' ? 'active' : ''}`}
                onClick={() => setAnnouncementCategory('Venue Alert')}
              >
                Venue Alerts
              </button>
              <button
                className={`filter-chip ${announcementCategory === 'Prize Ceremony' ? 'active' : ''}`}
                onClick={() => setAnnouncementCategory('Prize Ceremony')}
              >
                Prize Ceremonies
              </button>
              <button
                className={`filter-chip ${announcementCategory === 'General' ? 'active' : ''}`}
                onClick={() => setAnnouncementCategory('General')}
              >
                General Notices
              </button>
            </div>

            {loading ? (
              <div className="ar-loading-state">
                <div className="ar-spinner" />
                <p>Loading university circulars...</p>
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="ar-empty-state">
                <h3>No Announcements in this Category</h3>
                <p>Check back later or choose another bulletin category.</p>
              </div>
            ) : (
              <div className="announcements-cards-list">
                {filteredAnnouncements.map((a, i) => (
                  <article key={a._id || a.id || i} className={`announcement-card ${a.pinned ? 'is-pinned' : ''}`}>
                    {/* Top Row: Meta Badges */}
                    <div className="announcement-top-bar">
                      <div className="announcement-badges">
                        <span className="ann-category-pill">{a.category}</span>
                        <span className={`ann-priority-pill priority-${(a.priority || 'Normal').toLowerCase()}`}>
                          {a.priority || 'Normal'}
                        </span>
                        {a.pinned && (
                          <span className="ann-pinned-pill">
                            ★ Pinned Notice
                          </span>
                        )}
                      </div>
                      <time className="announcement-date">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>{a.date}</span>
                      </time>
                    </div>

                    {/* Announcement Title */}
                    <h2 className="announcement-card-title">{a.title}</h2>

                    {/* Optional Announcement Media Image */}
                    {a.imageUrl && (
                      <div className="announcement-media-frame">
                        <img src={a.imageUrl} alt={a.title} className="announcement-img" loading="lazy" />
                      </div>
                    )}

                    {/* Content Body */}
                    <p className="announcement-body-text">{a.content}</p>

                    {/* Additional Section 1: Venue Details */}
                    {a.venue && (
                      <div className="announcement-section-venue">
                        <div className="section-label">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span>VENUE &amp; COURT ALLOCATION</span>
                        </div>
                        <div className="section-value-box">{a.venue}</div>
                      </div>
                    )}

                    {/* Additional Section 2: Key Guidelines & Protocols */}
                    {Array.isArray(a.instructions) && a.instructions.length > 0 && (
                      <div className="announcement-section-instructions">
                        <div className="section-label">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 11 12 14 22 4" />
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                          </svg>
                          <span>KEY INSTRUCTIONS &amp; PROTOCOLS</span>
                        </div>
                        <ul className="instructions-list">
                          {a.instructions.map((inst, instIdx) => (
                            <li key={instIdx}>{inst}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Additional Section 3: Coordinator / Faculty In-Charge Contact */}
                    {a.coordinator && (a.coordinator.name || a.coordinator.contact) && (
                      <div className="announcement-section-contact">
                        <div className="section-label">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          <span>OFFICIAL CONVENER CONTACT</span>
                        </div>
                        <div className="coordinator-info">
                          {a.coordinator.name && <strong>{a.coordinator.name}</strong>}
                          {a.coordinator.contact && <span> • {a.coordinator.contact}</span>}
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: FACULTY & ORGANIZING COMMITTEE
           ========================================================================= */}
        {activeTab === 'faculty' && (
          <div className="ar-content-area">
            <div className="faculty-editorial-intro">
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                ACADEMIC &amp; TOURNAMENT LEADERSHIP
              </span>
              <h2 className="heading-section">Organizing Faculty Council</h2>
              <p className="text-body" style={{ maxWidth: '780px' }}>
                Under the guidance of the Governing Body and Department of Physical Education &amp; Cultural Affairs, the organizing committee ensures accredited fair play, student hospitality, and seamless championship coordination.
              </p>
            </div>

            <div className="faculty-cards-grid">
              {(faculty.length > 0 ? faculty : [
                {
                  id: "FAC-01",
                  name: "Dr. K. Ravindra",
                  designation: "Principal & Chief Patron",
                  department: "Administration & Mechanical Engineering",
                  role: "Chief Patron — COLORIDO 2K26",
                  bio: "Guiding academic and athletic development at RVRJCCE with over 30 years of educational leadership and national accreditation oversight.",
                  email: "principal@rvrjcce.ac.in",
                  office: "Administrative Block, Level 1"
                },
                {
                  id: "FAC-02",
                  name: "Dr. G. Kishore Babu",
                  designation: "Dean of Student Affairs & Overall Convener",
                  department: "Electronics & Communication Engineering",
                  role: "Organizing Committee Convener",
                  bio: "Steering student council activities, inter-university collaborations, and collegiate fest management for over two decades.",
                  email: "dean_sa@rvrjcce.ac.in",
                  office: "Student Welfare Center, Block III"
                },
                {
                  id: "FAC-03",
                  name: "Dr. P. Gopi Krishna",
                  designation: "Director of Physical Education",
                  department: "Department of Physical Education & Sports",
                  role: "Sports Tournament Director",
                  bio: "National collegiate referee commissioner, managing stadium fixtures, court allocations, and state university championship squads.",
                  email: "sports@rvrjcce.ac.in",
                  office: "Sports Pavilion & Indoor Stadium"
                },
                {
                  id: "FAC-04",
                  name: "Dr. Ch. Suneetha",
                  designation: "Professor & Head of Cultural Council",
                  department: "Computer Science & Engineering",
                  role: "Literary & Cultural Coordinator",
                  bio: "Pioneering creative arts, debate moderation, and fine arts symposiums across Andhra Pradesh collegiate platforms.",
                  email: "cultural@rvrjcce.ac.in",
                  office: "Silver Jubilee Auditorium, Media Suite"
                }
              ]).map((fac) => (
                <div key={fac.id} className="faculty-profile-card">
                  <div className="faculty-avatar-box">
                    <div className="faculty-monogram">
                      {fac.name.split(' ').map(n => n[0]).filter((_, idx) => idx < 3).join('')}
                    </div>
                    <div className="faculty-role-pill">{fac.role}</div>
                  </div>

                  <h3 className="faculty-name">{fac.name}</h3>
                  <div className="faculty-designation">{fac.designation}</div>
                  <div className="faculty-dept">{fac.department}</div>

                  <p className="faculty-bio">{fac.bio}</p>

                  <div className="faculty-footer-meta">
                    <div className="faculty-meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <a href={`mailto:${fac.email}`}>{fac.email}</a>
                    </div>
                    <div className="faculty-meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{fac.office}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnnouncementsResultsPage;
