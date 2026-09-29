import React, { useState, useEffect } from '../core/react.js';
import { INSTITUTION, SPORTS_DIVISIONS } from '../../config/eventConfig.js';
import { EVENT_DETAILS, getEventDetails } from '../../backend/config/eventSchedule.js';
import { submitRegistration, getPdfDownloadUrl } from '../api/client.js';
import { generateRegistrationPDF } from '../utils/pdfPassGenerator.js';

export function RegistrationForm({ initialCategory, initialDivision, initialEvent, onSuccess }) {
  const [formData, setFormData] = useState({
    participantName: '',
    studentId: '',
    department: 'Computer Science (CSE)',
    year: '2nd Year',
    gender: 'Male',
    college: '',
    email: '',
    phoneNumber: '',
    category: initialCategory || 'Sports',
    division: initialDivision || 'Boys',
    event: initialEvent || 'Basketball',
    teamName: '',
    teammates: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [apiError, setApiError] = useState(null);

  const eventMeta = getEventDetails(formData.event);
  const isTeamEvent = eventMeta.isTeam;

  // Initialize or adjust teammates array whenever event changes
  useEffect(() => {
    if (isTeamEvent) {
      const requiredCount = eventMeta.defaultMembers || 5;
      setFormData(prev => {
        // If teammates are already set, adjust count if needed
        const existing = prev.teammates || [];
        if (existing.length === 0) {
          // Create default roster: 1st is captain, others are members
          const roster = [
            {
              memberNumber: 1,
              name: prev.participantName || '',
              rollNo: prev.studentId || '',
              phone: prev.phoneNumber || '',
              college: prev.college || ''
            }
          ];
          for (let i = 2; i <= requiredCount; i++) {
            roster.push({
              memberNumber: i,
              name: '',
              rollNo: '',
              phone: '',
              college: prev.college || ''
            });
          }
          return { ...prev, teammates: roster };
        }
        return prev;
      });
    }
  }, [formData.event, isTeamEvent]);

  // Synchronize available events whenever category or division changes
  useEffect(() => {
    if (formData.category === 'Sports') {
      const available = formData.division === 'Girls'
        ? SPORTS_DIVISIONS.GIRLS.events.map(e => e.name)
        : SPORTS_DIVISIONS.BOYS.events.map(e => e.name);

      if (!available.includes(formData.event)) {
        setFormData(prev => ({ ...prev, event: available[0] }));
      }
    } else {
      const culturalEvents = [
        "Fine Arts",
        "Music & Band — Solo",
        "Music & Band — Group",
        "Dance — Solo",
        "Classical / Folk Solo",
        "Dance — Group",
        "Western Group Dance",
        "Choreoday — Theme Based",
        "Dramatics",
        "Fashion Show",
        "Tekraft Events",
        "Literary"
      ];
      if (!culturalEvents.includes(formData.event)) {
        setFormData(prev => ({ ...prev, event: culturalEvents[0], division: 'Cultural / Open' }));
      }
    }
  }, [formData.category, formData.division]);

  // Sync captain info into teammates[0]
  useEffect(() => {
    if (isTeamEvent && formData.teammates && formData.teammates.length > 0) {
      setFormData(prev => {
        const next = [...prev.teammates];
        next[0] = {
          ...next[0],
          name: prev.participantName,
          rollNo: prev.studentId,
          phone: prev.phoneNumber,
          college: prev.college
        };
        return { ...prev, teammates: next };
      });
    }
  }, [formData.participantName, formData.studentId, formData.phoneNumber, formData.college]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleTeammateChange = (index, subfield, value) => {
    setFormData(prev => {
      const nextTeammates = [...prev.teammates];
      nextTeammates[index] = { ...nextTeammates[index], [subfield]: value };
      return { ...prev, teammates: nextTeammates };
    });
  };

  const addTeammateRow = () => {
    setFormData(prev => {
      const nextTeammates = [...(prev.teammates || [])];
      nextTeammates.push({
        memberNumber: nextTeammates.length + 1,
        name: '',
        rollNo: '',
        phone: '',
        college: prev.college || ''
      });
      return { ...prev, teammates: nextTeammates };
    });
  };

  const removeTeammateRow = (index) => {
    if (index === 0) return; // Cannot remove captain
    setFormData(prev => {
      const nextTeammates = prev.teammates.filter((_, i) => i !== index);
      // Re-index
      return {
        ...prev,
        teammates: nextTeammates.map((m, idx) => ({ ...m, memberNumber: idx + 1 }))
      };
    });
  };

  const copyCaptainCollegeToAll = () => {
    if (!formData.college) return;
    setFormData(prev => ({
      ...prev,
      teammates: prev.teammates.map(m => ({ ...m, college: prev.college }))
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.participantName.trim() || formData.participantName.trim().length < 2) {
      errs.participantName = "Full Name is required (minimum 2 characters)";
    }
    if (!formData.studentId || formData.studentId.trim().length < 2) {
      errs.studentId = "Student ID / Roll No is required (e.g. SVEC22CS043)";
    }
    if (!formData.college.trim() || formData.college.trim().length < 2) {
      errs.college = "College or Institution name is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address";
    }
    const cleanPhone = (formData.phoneNumber || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.phoneNumber = "Please provide a valid 10-digit mobile number";
    }
    if (!formData.category) {
      errs.category = "Category selection is required";
    }
    if (formData.category === 'Sports' && !formData.division) {
      errs.division = "Please select Boys or Girls division";
    }
    if (!formData.event) {
      errs.event = "Please select an event";
    }
    if (isTeamEvent) {
      if (!formData.teamName || formData.teamName.trim().length < 2) {
        errs.teamName = "Team Name is required for group and team events";
      }
      // Check that at least some teammate names are filled
      const invalidMembers = (formData.teammates || []).filter((m, idx) => idx > 0 && !m.name.trim());
      if (invalidMembers.length > 0 && formData.teammates.length < (eventMeta.minMembers || 3)) {
        errs.teammates = `Please provide member names for your team (minimum ${eventMeta.minMembers || 3} members required).`;
      }
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setApiError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        venue: eventMeta.venue,
        schedule: eventMeta.schedule,
        registrationType: isTeamEvent ? 'Team Participation' : 'Individual Participation'
      };

      const response = await submitRegistration(payload);
      setSubmissionSuccess(response.registration);
      if (onSuccess) onSuccess(response.registration);
    } catch (err) {
      setApiError(err.message || 'Submission failed. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmissionSuccess(null);
    setFormData({
      participantName: '',
      studentId: '',
      department: 'Computer Science (CSE)',
      year: '2nd Year',
      gender: 'Male',
      college: '',
      email: '',
      phoneNumber: '',
      category: 'Sports',
      division: 'Boys',
      event: 'Basketball',
      teamName: '',
      teammates: []
    });
    setErrors({});
  };

  // SUCCESS VIEW: Registration Confirmed & Instant Downloadable E-Pass
  if (submissionSuccess) {
    return (
      <div className="section-wrapper registration-page">
        <div className="container">
          <div className="success-card" style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'left' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div className="success-icon-wrap" style={{ margin: '0 auto 1rem' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <span className="eyebrow" style={{ justifyContent: 'center' }}>
                <span className="eyebrow-dot"></span>
                OFFICIAL REGISTRATION CONFIRMED
              </span>

              <h2 className="heading-section" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                E-Pass Generated Successfully
              </h2>

              <p className="text-body" style={{ maxWidth: '580px', margin: '0 auto' }}>
                Your entry for <strong>{INSTITUTION.fullName} (COLORIDO 2K26)</strong> is confirmed and recorded.
                Download your official E-Pass PDF below.
              </p>
            </div>

            {/* Official Registration E-Pass Preview Container */}
            <div style={{
              background: '#0B162C',
              borderRadius: 'var(--radius-sm)',
              color: '#ffffff',
              padding: '1.25rem 1.5rem',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              borderTop: '3px solid #F59E0B'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8' }}>
                  E-PASS / REGISTRATION NUMBER
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
                  {submissionSuccess.registrationId}
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#CBD5E1', marginTop: '0.25rem' }}>
                  {submissionSuccess.event} • {submissionSuccess.category}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{
                  display: 'inline-block',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid #10B981',
                  color: '#34D399',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '20px',
                  fontWeight: 700,
                  fontSize: '0.8125rem'
                }}>
                  STATUS: CONFIRMED
                </span>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.5rem' }}>
                  Registered: {new Date(submissionSuccess.registrationDate).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Ticket Details Grid */}
            <div className="registration-ticket" style={{ marginBottom: '1.5rem' }}>
              <div style={{
                background: '#EEF2F9',
                padding: '0.5rem 0.85rem',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '0.8125rem',
                color: '#1E293B',
                marginBottom: '0.75rem'
              }}>
                1. REGISTERED EVENT DETAILS & VENUE
              </div>
              <div className="ticket-row">
                <span className="ticket-label">Event Name</span>
                <span className="ticket-val" style={{ fontWeight: 700, color: 'var(--accent-cultural)' }}>{submissionSuccess.event}</span>
              </div>
              <div className="ticket-row">
                <span className="ticket-label">Venue</span>
                <span className="ticket-val" style={{ fontWeight: 700 }}>{submissionSuccess.venue || eventMeta.venue}</span>
              </div>
              <div className="ticket-row">
                <span className="ticket-label">Date & Schedule</span>
                <span className="ticket-val" style={{ fontWeight: 700, color: '#1E40AF' }}>{submissionSuccess.schedule || eventMeta.schedule}</span>
              </div>
              <div className="ticket-row">
                <span className="ticket-label">Participation Format</span>
                <span className="ticket-val">{submissionSuccess.registrationType || (isTeamEvent ? 'Team Participation' : 'Individual Participation')}</span>
              </div>

              <div style={{
                background: '#EEF2F9',
                padding: '0.5rem 0.85rem',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '0.8125rem',
                color: '#1E293B',
                marginTop: '1.25rem',
                marginBottom: '0.75rem'
              }}>
                2. REGISTERED PARTICIPANT {isTeamEvent ? '(TEAM CAPTAIN)' : ''}
              </div>
              <div className="ticket-row">
                <span className="ticket-label">Full Name</span>
                <span className="ticket-val">{submissionSuccess.participantName}</span>
              </div>
              <div className="ticket-row">
                <span className="ticket-label">Student ID / Roll No</span>
                <span className="ticket-val" style={{ fontFamily: 'var(--font-mono)' }}>{submissionSuccess.studentId || 'N/A'}</span>
              </div>
              <div className="ticket-row">
                <span className="ticket-label">College / Institution</span>
                <span className="ticket-val">{submissionSuccess.college}</span>
              </div>
              <div className="ticket-row">
                <span className="ticket-label">Department & Year</span>
                <span className="ticket-val">{submissionSuccess.department} • {submissionSuccess.year}</span>
              </div>
              <div className="ticket-row">
                <span className="ticket-label">Email & Mobile</span>
                <span className="ticket-val">{submissionSuccess.email} • {submissionSuccess.phoneNumber}</span>
              </div>

              {/* If Team Event: Team Table */}
              {isTeamEvent && submissionSuccess.teammates && submissionSuccess.teammates.length > 0 && (
                <>
                  <div style={{
                    background: '#EEF2F9',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '4px',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    color: '#1E293B',
                    marginTop: '1.25rem',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>3. REGISTERED TEAM MEMBERS ({submissionSuccess.teamName || 'Squad'})</span>
                    <span>Total Members: {submissionSuccess.teammates.length}</span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                      <thead>
                        <tr style={{ background: '#102A43', color: '#FFFFFF', textAlign: 'left' }}>
                          <th style={{ padding: '6px 10px' }}>#</th>
                          <th style={{ padding: '6px 10px' }}>Member Name</th>
                          <th style={{ padding: '6px 10px' }}>Roll No / ID</th>
                          <th style={{ padding: '6px 10px' }}>Phone</th>
                          <th style={{ padding: '6px 10px' }}>College</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissionSuccess.teammates.map((m, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0', background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                            <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                            <td style={{ padding: '6px 10px', fontWeight: idx === 0 ? 700 : 500 }}>
                              {m.name || submissionSuccess.participantName} {idx === 0 && <span style={{ fontSize: '0.7rem', color: '#2563EB' }}>(Captain)</span>}
                            </td>
                            <td style={{ padding: '6px 10px', fontFamily: 'var(--font-mono)' }}>{m.rollNo || 'N/A'}</td>
                            <td style={{ padding: '6px 10px' }}>{m.phone || 'N/A'}</td>
                            <td style={{ padding: '6px 10px' }}>{m.college || submissionSuccess.college}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Official Instructions Notice */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem',
              marginBottom: '1.75rem',
              fontSize: '0.8125rem',
              color: '#475569'
            }}>
              <strong style={{ color: '#2563EB', display: 'block', marginBottom: '0.25rem' }}>
                OFFICIAL VERIFICATION & REPORTING NOTICE
              </strong>
              This computer-generated document confirms official registration for COLORIDO 2K26.
              Please present this E-Pass (digital copy or printout) along with your original College Identity Card upon reporting at the registration desk.
            </div>

            {/* Action Buttons: PDF Download is Primary */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary btn-lg"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(14, 32, 56, 0.25)'
                }}
                onClick={() => generateRegistrationPDF(submissionSuccess)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                <span>Download Official E-Pass (PDF)</span>
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => window.print()}
              >
                Print Ticket
              </button>

              <button
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Register Another Participant
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get available events
  let availableEvents = [];
  if (formData.category === 'Sports') {
    availableEvents = formData.division === 'Girls'
      ? SPORTS_DIVISIONS.GIRLS.events.map(e => e.name)
      : SPORTS_DIVISIONS.BOYS.events.map(e => e.name);
  } else {
    availableEvents = [
      "Fine Arts",
      "Music & Band — Solo",
      "Music & Band — Group",
      "Dance — Solo",
      "Classical / Folk Solo",
      "Dance — Group",
      "Western Group Dance",
      "Choreoday — Theme Based",
      "Dramatics",
      "Fashion Show",
      "Tekraft Events",
      "Literary"
    ];
  }

  return (
    <div className="section-wrapper registration-page">
      <div className="container">
        <div className="form-layout-grid">
          {/* Info Side Column */}
          <div className="form-info-column">
            <span className="eyebrow">
              <span className="eyebrow-dot"></span>
              OFFICIAL ENTRY PORTAL
            </span>
            <h1 className="heading-section" style={{ marginBottom: '1rem' }}>
              Event Registration
            </h1>
            <p className="text-body" style={{ marginBottom: '1.75rem' }}>
              Submit university participant entries for <strong>COLORIDO 2K26</strong>.
              Every confirmed registration automatically receives a verified institutional E-Pass with unique identification.
            </p>

            {/* Event Timing & Venue Live Card */}
            <div style={{
              background: 'linear-gradient(135deg, #0B162C 0%, #172C4C 100%)',
              color: '#ffffff',
              borderRadius: 'var(--radius-sm)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#F59E0B', fontWeight: 700, letterSpacing: '0.05em' }}>
                CURRENT EVENT SPOTLIGHT
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem' }}>
                {formData.event}
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8125rem', color: '#CBD5E1' }}>
                <div>📍 <strong>Venue:</strong> {eventMeta.venue}</div>
                <div>🕒 <strong>Schedule:</strong> {eventMeta.schedule}</div>
                <div>👥 <strong>Format:</strong> {isTeamEvent ? `Team Event (${eventMeta.defaultMembers || 5} Members)` : 'Individual Competition'}</div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                Registration Guidelines:
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <li>✓ Valid college identity cards must be presented during technical verification at desk.</li>
                <li>✓ For team sports (Basketball 5, Volleyball 6, Throwball 7) and group stage performances, add teammates below.</li>
                <li>✓ Sequential official Pass IDs (e.g. <code>CD26000001</code>) are assigned upon registration.</li>
                <li>✓ Downloadable PDF E-Pass is instantly generated upon confirmation.</li>
              </ul>
            </div>

            <div className="badge badge-navy">
              Host: {INSTITUTION.fullName}, Guntur, AP
            </div>
          </div>

          {/* Form Card */}
          <div className="form-card">
            {apiError && (
              <div style={{
                backgroundColor: '#FFF5F5',
                border: '1px solid #FEB2B2',
                color: '#C53030',
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.5rem',
                fontSize: '0.875rem'
              }}>
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-institution)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Section 1: Event Selection
              </div>

              {/* Category Segmented Control */}
              <div className="form-group">
                <label className="form-label">
                  Competition Category <span className="required">*</span>
                </label>
                <div className="segmented-control">
                  <button
                    type="button"
                    className={`segment-btn ${formData.category === 'Sports' ? 'active' : ''}`}
                    onClick={() => handleChange('category', 'Sports')}
                  >
                    Sports Championship
                  </button>
                  <button
                    type="button"
                    className={`segment-btn ${formData.category === 'Literary & Cultural' ? 'active' : ''}`}
                    onClick={() => handleChange('category', 'Literary & Cultural')}
                  >
                    Literary & Cultural
                  </button>
                </div>
              </div>

              {/* Dynamic Division Selector (Only for Sports) */}
              {formData.category === 'Sports' && (
                <div className="form-group">
                  <label className="form-label">
                    Division <span className="required">*</span>
                  </label>
                  <div className="segmented-control">
                    <button
                      type="button"
                      className={`segment-btn ${formData.division === 'Boys' ? 'active' : ''}`}
                      onClick={() => handleChange('division', 'Boys')}
                    >
                      Boys Division (Basketball, Volleyball, Table Tennis)
                    </button>
                    <button
                      type="button"
                      className={`segment-btn ${formData.division === 'Girls' ? 'active' : ''}`}
                      onClick={() => handleChange('division', 'Girls')}
                    >
                      Girls Division (Throwball, Tennis, Table Tennis)
                    </button>
                  </div>
                  {errors.division && (
                    <div className="form-error-msg">{errors.division}</div>
                  )}
                </div>
              )}

              {/* Dynamic Event Dropdown */}
              <div className="form-group">
                <label className="form-label">
                  Competition Event <span className="required">*</span>
                </label>
                <select
                  className={`form-select ${errors.event ? 'error' : ''}`}
                  value={formData.event}
                  onChange={(e) => handleChange('event', e.target.value)}
                >
                  {availableEvents.map((evt, idx) => (
                    <option key={idx} value={evt}>
                      {evt}
                    </option>
                  ))}
                </select>
                {errors.event && (
                  <div className="form-error-msg">{errors.event}</div>
                )}
                <div className="form-hint">
                  Venue: {eventMeta.venue} • Schedule: {eventMeta.schedule}
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--border-light)', margin: '1.5rem 0' }}></div>

              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-institution)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Section 2: Primary Participant / Team Captain Details
              </div>

              {/* Participant Name & Student ID */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Participant Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input ${errors.participantName ? 'error' : ''}`}
                    placeholder="e.g. Karthik Reddy"
                    value={formData.participantName}
                    onChange={(e) => handleChange('participantName', e.target.value)}
                  />
                  {errors.participantName && (
                    <div className="form-error-msg">{errors.participantName}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Student ID / Roll No <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input ${errors.studentId ? 'error' : ''}`}
                    placeholder="e.g. VRS22ME008 or Y22CS045"
                    value={formData.studentId}
                    onChange={(e) => handleChange('studentId', e.target.value)}
                  />
                  {errors.studentId && (
                    <div className="form-error-msg">{errors.studentId}</div>
                  )}
                </div>
              </div>

              {/* Department, Year & Gender Grid */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Department / Branch</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Mechanical Engineering"
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Academic Year</label>
                  <select
                    className="form-select"
                    value={formData.year}
                    onChange={(e) => handleChange('year', e.target.value)}
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* College */}
              <div className="form-group">
                <label className="form-label">
                  College / Institution Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.college ? 'error' : ''}`}
                  placeholder="e.g. VR Siddhartha Engineering College"
                  value={formData.college}
                  onChange={(e) => handleChange('college', e.target.value)}
                />
                {errors.college && (
                  <div className="form-error-msg">{errors.college}</div>
                )}
              </div>

              {/* Email & Phone Grid */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Official / Personal Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="karthik.r@vrsiddhartha.ac.in"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                  {errors.email && (
                    <div className="form-error-msg">{errors.email}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Contact Mobile Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                    placeholder="10-digit mobile number"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  />
                  {errors.phoneNumber && (
                    <div className="form-error-msg">{errors.phoneNumber}</div>
                  )}
                </div>
              </div>

              {/* Section 3: Team Information & Squad Members (For Team Events) */}
              {isTeamEvent && (
                <>
                  <div style={{ height: '1px', background: 'var(--border-light)', margin: '1.5rem 0' }}></div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-cultural)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Section 3: Team Information & Squad Members
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {formData.event} requires team registration (standard: {eventMeta.defaultMembers} players)
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={copyCaptainCollegeToAll}
                      title="Set all member colleges to captain's college"
                    >
                      Fill College for All
                    </button>
                  </div>

                  {/* Team Name */}
                  <div className="form-group">
                    <label className="form-label">
                      Official Team Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-input ${errors.teamName ? 'error' : ''}`}
                      placeholder="e.g. Rhythm Fusion Crew or RVR Thunder"
                      value={formData.teamName}
                      onChange={(e) => handleChange('teamName', e.target.value)}
                    />
                    {errors.teamName && (
                      <div className="form-error-msg">{errors.teamName}</div>
                    )}
                  </div>

                  {/* Team Members List */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                        Squad Roster ({formData.teammates.length} Members Registered)
                      </span>
                      <button
                        type="button"
                        onClick={addTeammateRow}
                        style={{
                          background: 'none',
                          border: '1px solid var(--border-light)',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          color: 'var(--accent-institution)',
                          fontWeight: 600
                        }}
                      >
                        + Add Member
                      </button>
                    </div>

                    {errors.teammates && (
                      <div className="form-error-msg" style={{ marginBottom: '0.75rem' }}>{errors.teammates}</div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {formData.teammates.map((m, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: idx === 0 ? 'rgba(14, 32, 56, 0.04)' : 'var(--bg-surface)',
                            border: '1px solid var(--border-light)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.75rem',
                            position: 'relative'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            <span>
                              Member #{idx + 1} {idx === 0 ? '— Team Captain / Primary Registrant' : ''}
                            </span>
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => removeTeammateRow(idx)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#C53030',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem'
                                }}
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                            <div>
                              <input
                                type="text"
                                className="form-input"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8125rem' }}
                                placeholder="Member Full Name *"
                                value={idx === 0 ? formData.participantName : m.name}
                                disabled={idx === 0}
                                onChange={(e) => handleTeammateChange(idx, 'name', e.target.value)}
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                className="form-input"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8125rem' }}
                                placeholder="Roll No / ID"
                                value={idx === 0 ? formData.studentId : m.rollNo}
                                disabled={idx === 0}
                                onChange={(e) => handleTeammateChange(idx, 'rollNo', e.target.value)}
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                className="form-input"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8125rem' }}
                                placeholder="Phone"
                                value={idx === 0 ? formData.phoneNumber : m.phone}
                                disabled={idx === 0}
                                onChange={(e) => handleTeammateChange(idx, 'phone', e.target.value)}
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                className="form-input"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8125rem' }}
                                placeholder="College"
                                value={idx === 0 ? formData.college : m.college}
                                disabled={idx === 0}
                                onChange={(e) => handleTeammateChange(idx, 'college', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <div style={{ marginTop: '2rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registering & Generating E-Pass...' : 'Complete Registration & Generate Official E-Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
