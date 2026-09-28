import React, { useState, useEffect } from '../core/react.js';
import { INSTITUTION, SPORTS_DIVISIONS } from '../../config/eventConfig.js';
import { submitRegistration } from '../api/client.js';

export function RegistrationForm({ initialCategory, initialDivision, initialEvent, onSuccess }) {
  const [formData, setFormData] = useState({
    participantName: '',
    teamName: '',
    college: '',
    email: '',
    phoneNumber: '',
    category: initialCategory || 'Sports',
    division: initialDivision || 'Boys',
    event: initialEvent || 'Basketball'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [apiError, setApiError] = useState(null);

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
        "Dance — Group",
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

  const validate = () => {
    const errs = {};
    if (!formData.participantName.trim() || formData.participantName.trim().length < 2) {
      errs.participantName = "Full Name is required (minimum 2 characters)";
    }
    if (!formData.college.trim() || formData.college.trim().length < 2) {
      errs.college = "College or Institution name is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address";
    }
    const cleanPhone = formData.phoneNumber.replace(/[^0-9]/g, '');
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
      const response = await submitRegistration(formData);
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
      teamName: '',
      college: '',
      email: '',
      phoneNumber: '',
      category: 'Sports',
      division: 'Boys',
      event: 'Basketball'
    });
    setErrors({});
  };

  if (submissionSuccess) {
    return (
      <div className="section-wrapper registration-page">
        <div className="container">
          <div className="success-card" style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div className="success-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <span className="eyebrow" style={{ justifyContent: 'center' }}>
              <span className="eyebrow-dot"></span>
              OFFICIAL CONFIRMATION
            </span>

            <h2 className="heading-section" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              Registration Confirmed
            </h2>

            <p className="text-body">
              Your official entry for the <strong>{INSTITUTION.name} Inter-College Meet 2026</strong> has been recorded in the central database.
            </p>

            {/* Official Registration Ticket */}
            <div className="registration-ticket">
              <div className="ticket-row">
                <span className="ticket-label">Registration ID</span>
                <span className="ticket-val" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-institution)' }}>
                  {submissionSuccess.registrationId}
                </span>
              </div>
              <div className="ticket-row">
                <span className="ticket-label">Participant / Lead</span>
                <span className="ticket-val">{submissionSuccess.participantName}</span>
              </div>
              <div className="ticket-row">
                <span className="ticket-label">Team Designation</span>
                <span className="ticket-val">{submissionSuccess.teamName || 'Individual Entry'}</span>
              </div>
              <div className="ticket-row">
                <span className="ticket-label">College / Institution</span>
                <span className="ticket-val">{submissionSuccess.college}</span>
              </div>
              <div className="ticket-row">
                <span className="ticket-label">Category & Division</span>
                <span className="ticket-val">{submissionSuccess.category} • {submissionSuccess.division}</span>
              </div>
              <div className="ticket-row">
                <span className="ticket-label">Registered Event</span>
                <span className="ticket-val" style={{ color: 'var(--accent-cultural)' }}>{submissionSuccess.event}</span>
              </div>
              <div className="ticket-row">
                <span className="ticket-label">Recorded Timestamp</span>
                <span className="ticket-val" style={{ fontSize: '0.75rem' }}>
                  {new Date(submissionSuccess.registrationDate).toLocaleString()}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={resetForm}
              >
                Register Another Participant
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => window.print()}
              >
                Print Ticket Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get available events dynamically
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
      "Dance — Group",
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
              Submit institutional participant entries for the RVRJCCE Inter-College Sports and
              Literary & Cultural competitions. Verified student IDs required at reporting.
            </p>

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
                <li>✓ Valid college identity cards must be presented during technical verification.</li>
                <li>✓ For team sports and group stage events, specify the team or troupe name.</li>
                <li>✓ Single participants may represent their college across both sports and cultural disciplines provided schedules do not conflict.</li>
                <li>✓ Confirmation IDs are issued immediately upon submission.</li>
              </ul>
            </div>

            <div className="badge badge-navy">
              Host: {INSTITUTION.fullName}, Andhra Pradesh
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
              {/* Participant Name */}
              <div className="form-group">
                <label className="form-label">
                  Participant Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.participantName ? 'error' : ''}`}
                  placeholder="e.g. K. Siddhartha Reddy"
                  value={formData.participantName}
                  onChange={(e) => handleChange('participantName', e.target.value)}
                />
                {errors.participantName && (
                  <div className="form-error-msg">{errors.participantName}</div>
                )}
              </div>

              {/* Team Name & College Grid */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Team / Troupe Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. RVR Thunder (or leave blank if Solo)"
                    value={formData.teamName}
                    onChange={(e) => handleChange('teamName', e.target.value)}
                  />
                  <div className="form-hint">Optional for solo competitions</div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    College / Institution <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input ${errors.college ? 'error' : ''}`}
                    placeholder="e.g. RVR & JC College of Engineering"
                    value={formData.college}
                    onChange={(e) => handleChange('college', e.target.value)}
                  />
                  {errors.college && (
                    <div className="form-error-msg">{errors.college}</div>
                  )}
                </div>
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
                    placeholder="name@college.edu.in"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                  {errors.email && (
                    <div className="form-error-msg">{errors.email}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Contact Phone Number <span className="required">*</span>
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
                  {formData.category === 'Sports'
                    ? `Showing sports available for ${formData.division} division`
                    : 'Showing all curated literary & cultural events'}
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ marginTop: '2rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting Registration...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
