import React, { useState, useEffect } from '../core/react.js';
import { INSTITUTION, SPORTS_DIVISIONS } from '../../config/eventConfig.js';
import {
  fetchRegistrations,
  fetchStats,
  deleteRegistration,
  updateRegistration,
  submitRegistration,
  toggleAttendance,
  getCsvExportUrl,
  adminLogin,
  verifyAdminSession,
  adminLogout
} from '../api/client.js';
import { generateRegistrationPDF } from '../utils/pdfPassGenerator.js';
import { EVENT_DETAILS, getEventDetails } from '../../backend/config/eventSchedule.js';

export function AdminDashboard({ onNavigate }) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data & Filter State
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    sports: 0,
    cultural: 0,
    boys: 0,
    girls: 0,
    attended: 0,
    pendingAttendance: 0,
    colleges: 0
  });
  const [dbStatus, setDbStatus] = useState(null);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [attendanceFilter, setAttendanceFilter] = useState('all'); // 'all', 'true', 'false'
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [showOnSpotModal, setShowOnSpotModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // On-spot registration form state
  const [onSpotData, setOnSpotData] = useState({
    participantName: '',
    studentId: '',
    department: 'Computer Science (CSE)',
    year: '2nd Year',
    gender: 'Male',
    college: 'RVR & JC College of Engineering',
    email: '',
    phoneNumber: '',
    category: 'Sports',
    division: 'Boys',
    event: 'Basketball',
    teamName: '',
    teammates: [],
    attended: true
  });
  const [onSpotError, setOnSpotError] = useState('');
  const [onSpotSuccess, setOnSpotSuccess] = useState(null);

  const PAGE_SIZE = 10;

  // Check auth session on load
  useEffect(() => {
    async function checkAuth() {
      setAuthChecking(true);
      const res = await verifyAdminSession();
      if (res.authenticated) {
        setIsAuthenticated(true);
      }
      setAuthChecking(false);
    }
    checkAuth();
  }, []);

  const loadData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [regs, statData] = await Promise.all([
        fetchRegistrations({
          category: categoryFilter,
          division: divisionFilter,
          event: eventFilter,
          attended: attendanceFilter === 'all' ? undefined : attendanceFilter,
          search: searchTerm
        }),
        fetchStats()
      ]);
      setRegistrations(regs || []);
      if (statData) setStats(statData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      showNotification('Failed to load registrations from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, categoryFilter, divisionFilter, eventFilter, attendanceFilter]);

  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle Login
  const handleLoginSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      await adminLogin(loginForm.username, loginForm.password);
      setIsAuthenticated(true);
      showNotification('Signed in successfully as Administrator.', 'success');
    } catch (err) {
      setLoginError(err.message || 'Invalid administrator username or password');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    adminLogout();
    setIsAuthenticated(false);
    setLoginForm({ username: '', password: '' });
  };

  // 1-Click Attendance Toggle
  const handleToggleAttendance = async (reg, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    try {
      const newStatus = !Boolean(reg.attended);
      const res = await toggleAttendance(reg._id || reg.registrationId, newStatus);
      showNotification(
        `${reg.participantName} (${reg.registrationId}) marked as ${newStatus ? 'Attended ✓' : 'Absent'}`,
        'success'
      );
      // Update local state smoothly
      setRegistrations(prev =>
        prev.map(r => (r._id === reg._id || r.registrationId === reg.registrationId ? { ...r, attended: newStatus } : r))
      );
      // Refresh stats
      fetchStats().then(s => s && setStats(s));
    } catch (err) {
      showNotification(`Attendance update failed: ${err.message}`, 'error');
    }
  };

  // Delete Record
  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteRegistration(deleteCandidate._id || deleteCandidate.registrationId);
      showNotification(`Record ${deleteCandidate.registrationId} removed successfully.`, 'success');
      setDeleteCandidate(null);
      loadData();
    } catch (err) {
      showNotification(`Error deleting record: ${err.message}`, 'error');
    }
  };

  // Save Edit / Override Record
  const handleSaveEdit = async () => {
    if (!editRecord) return;
    try {
      const res = await updateRegistration(editRecord._id || editRecord.registrationId, editRecord);
      showNotification(`Registration ${editRecord.registrationId} updated successfully.`, 'success');
      setEditRecord(null);
      loadData();
    } catch (err) {
      showNotification(`Failed to save updates: ${err.message}`, 'error');
    }
  };

  // On-Spot Registration Submit
  const handleOnSpotSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setOnSpotError('');
    if (!onSpotData.participantName.trim()) {
      setOnSpotError('Participant Name is required');
      return;
    }
    if (!onSpotData.college.trim()) {
      setOnSpotError('College Name is required');
      return;
    }
    if (!onSpotData.phoneNumber.trim()) {
      setOnSpotError('Phone number is required');
      return;
    }

    try {
      const eventMeta = getEventDetails(onSpotData.event);
      const payload = {
        ...onSpotData,
        email: onSpotData.email || `${onSpotData.participantName.toLowerCase().replace(/\s+/g, '')}@walkin.rvrjcce.ac.in`,
        venue: eventMeta.venue,
        schedule: eventMeta.schedule,
        registrationType: eventMeta.isTeam ? 'Team Participation' : 'Individual Participation'
      };

      const res = await submitRegistration(payload);
      setOnSpotSuccess(res.registration);
      showNotification(`On-spot registration ${res.registration.registrationId} recorded!`, 'success');
      loadData();
    } catch (err) {
      setOnSpotError(err.message || 'On-spot registration failed');
    }
  };

  // Filtered & Sorted registrations
  const filteredRecords = registrations.filter(r => {
    const matchesSearch = !searchTerm ||
      (r.participantName && r.participantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.studentId && r.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.college && r.college.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.teamName && r.teamName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.registrationId && r.registrationId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.event && r.event.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesDivision = divisionFilter === 'all' || r.division === divisionFilter;
    const matchesEvent = eventFilter === 'all' || r.event === eventFilter;
    const matchesAttended = attendanceFilter === 'all' ||
      (attendanceFilter === 'true' && Boolean(r.attended)) ||
      (attendanceFilter === 'false' && !Boolean(r.attended));

    return matchesSearch && matchesCategory && matchesDivision && matchesEvent && matchesAttended;
  });

  // Sorting
  filteredRecords.sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.registrationDate) - new Date(a.registrationDate);
    if (sortBy === 'date-asc') return new Date(a.registrationDate) - new Date(b.registrationDate);
    if (sortBy === 'name') return (a.participantName || '').localeCompare(b.participantName || '');
    if (sortBy === 'college') return (a.college || '').localeCompare(b.college || '');
    if (sortBy === 'attended') return (b.attended ? 1 : 0) - (a.attended ? 1 : 0);
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // If checking authentication, show brief loading screen
  if (authChecking) {
    return (
      <div className="section-wrapper admin-page" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="text-body">Verifying institutional credentials...</div>
      </div>
    );
  }

  // 1. ADMIN LOGIN VIEW
  if (!isAuthenticated) {
    return (
      <div className="section-wrapper admin-page">
        <div className="container" style={{ maxWidth: '480px', margin: '3rem auto' }}>
          <div className="form-card" style={{ padding: '2.5rem 2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 1rem',
                background: 'var(--accent-institution)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>

              <span className="eyebrow" style={{ justifyContent: 'center' }}>
                <span className="eyebrow-dot"></span>
                COLORIDO 2K26 PORTAL
              </span>

              <h2 className="heading-section" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                Administrator Sign In
              </h2>
              <p className="text-body" style={{ fontSize: '0.875rem' }}>
                Restricted access for {INSTITUTION.fullName} Event Committee & Coordinators.
              </p>
            </div>

            {loginError && (
              <div style={{
                background: '#FFF5F5',
                border: '1px solid #FEB2B2',
                color: '#C53030',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.5rem',
                fontSize: '0.875rem'
              }}>
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Administrator Username</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="admin"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              <div style={{
                background: 'rgba(14, 32, 56, 0.04)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.6rem 0.85rem',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                marginBottom: '1.5rem'
              }}>
                Default Access: <code>admin</code> / <code>rvrjcce@2026</code> (configurable in .env)
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'Authenticating...' : 'Sign In to Console'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. LOGGED-IN ADMIN CONSOLE
  return (
    <div className="section-wrapper admin-page">
      <div className="container">
        {/* Header Bar */}
        <div className="admin-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <span className="eyebrow" style={{ margin: 0 }}>
                <span className="eyebrow-dot"></span>
                INSTITUTIONAL ADMINISTRATION
              </span>
              <span style={{
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: '12px',
                background: '#ECFDF5',
                color: '#059669',
                border: '1px solid #10B981',
                fontWeight: 600
              }}>
                MongoDB Database Active
              </span>
            </div>

            <h1 className="heading-section" style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>
              COLORIDO 2K26 Registration Console
            </h1>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {INSTITUTION.name} Event Organizing Committee • Inter-College Sports & Cultural Meet
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* On-Spot Registration Button */}
            <button
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              onClick={() => {
                setOnSpotSuccess(null);
                setShowOnSpotModal(true);
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span>On-Spot Registration</span>
            </button>

            {/* Export CSV */}
            <a
              href={getCsvExportUrl({
                category: categoryFilter,
                division: divisionFilter,
                event: eventFilter,
                attended: attendanceFilter === 'all' ? undefined : attendanceFilter,
                search: searchTerm
              })}
              className="btn btn-secondary btn-sm"
              download
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              <span>Export CSV</span>
            </a>

            {/* Refresh */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={loadData}
              title="Refresh Data"
            >
              ↻ Refresh
            </button>

            {/* Sign Out */}
            <button
              className="btn btn-secondary btn-sm"
              style={{ color: '#C53030' }}
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Global Notification */}
        {notification && (
          <div style={{
            padding: '0.75rem 1.25rem',
            backgroundColor: notification.type === 'error' ? '#FDF2F2' : '#EFF6FF',
            border: `1px solid ${notification.type === 'error' ? '#F8B4B4' : '#BFDBFE'}`,
            color: notification.type === 'error' ? '#9B1C1C' : '#1E40AF',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{notification.msg}</span>
            <button
              onClick={() => setNotification(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Overview Metric Cards with Attendance Checklist Summary */}
        <div className="admin-metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
          <div className="admin-metric-card" style={{ borderTop: '3px solid var(--text-primary)' }}>
            <span className="metric-number">{stats.total}</span>
            <span className="metric-label">Total Registrations</span>
          </div>

          <div className="admin-metric-card" style={{ borderTop: '3px solid #059669' }}>
            <span className="metric-number" style={{ color: '#059669' }}>
              {stats.attended}
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>
                ({stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 0}%)
              </span>
            </span>
            <span className="metric-label">Attended Check-ins</span>
          </div>

          <div className="admin-metric-card" style={{ borderTop: '3px solid #D97706' }}>
            <span className="metric-number" style={{ color: '#D97706' }}>{stats.pendingAttendance}</span>
            <span className="metric-label">Pending Arrival</span>
          </div>

          <div className="admin-metric-card" style={{ borderTop: '3px solid var(--accent-institution)' }}>
            <span className="metric-number" style={{ color: 'var(--accent-institution)' }}>{stats.sports}</span>
            <span className="metric-label">Sports Entries</span>
          </div>

          <div className="admin-metric-card" style={{ borderTop: '3px solid var(--accent-cultural)' }}>
            <span className="metric-number" style={{ color: 'var(--accent-cultural)' }}>{stats.cultural}</span>
            <span className="metric-label">Cultural Entries</span>
          </div>

          <div className="admin-metric-card" style={{ borderTop: '3px solid #4F46E5' }}>
            <span className="metric-number" style={{ color: '#4F46E5' }}>{stats.colleges}</span>
            <span className="metric-label">Participating Colleges</span>
          </div>
        </div>

        {/* Attendance Quick Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '0.75rem',
          marginBottom: '1rem',
          flexWrap: 'wrap'
        }}>
          <button
            className={`btn btn-sm ${attendanceFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setAttendanceFilter('all'); setCurrentPage(1); }}
          >
            All Registrations ({stats.total})
          </button>
          <button
            className={`btn btn-sm ${attendanceFilter === 'true' ? 'btn-primary' : 'btn-secondary'}`}
            style={attendanceFilter === 'true' ? { background: '#059669', borderColor: '#059669' } : {}}
            onClick={() => { setAttendanceFilter('true'); setCurrentPage(1); }}
          >
            ✓ Attended ({stats.attended})
          </button>
          <button
            className={`btn btn-sm ${attendanceFilter === 'false' ? 'btn-primary' : 'btn-secondary'}`}
            style={attendanceFilter === 'false' ? { background: '#D97706', borderColor: '#D97706' } : {}}
            onClick={() => { setAttendanceFilter('false'); setCurrentPage(1); }}
          >
            ⏳ Not Yet Attended ({stats.pendingAttendance})
          </button>
        </div>

        {/* Interactive Controls Bar: Search & Specific Event Filters */}
        <div className="admin-controls-card">
          <div className="search-input-wrap">
            <span className="search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by ID (e.g. CD26000001), student name, roll number, college, or team..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="filters-group" style={{ flexWrap: 'wrap' }}>
            {/* Category Filter */}
            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setEventFilter('all');
                setCurrentPage(1);
              }}
            >
              <option value="all">All Categories</option>
              <option value="Sports">Sports</option>
              <option value="Literary & Cultural">Literary & Cultural</option>
            </select>

            {/* Event Specific Filter */}
            <select
              className="filter-select"
              value={eventFilter}
              onChange={(e) => {
                setEventFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Specific Events</option>
              {Object.keys(EVENT_DETAILS).map(eName => (
                <option key={eName} value={eName}>{eName}</option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="attended">Attended First</option>
              <option value="name">Participant Name</option>
              <option value="college">College Name</option>
            </select>
          </div>
        </div>

        {/* Registrations & Attendance Table */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>E-Pass ID</th>
                <th>Participant & ID</th>
                <th>Event & Venue</th>
                <th>Team & College</th>
                <th>Contact</th>
                <th style={{ textAlign: 'center', width: '140px' }}>Attendance</th>
                <th style={{ textAlign: 'right', width: '170px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="text-body">Loading registrations from database...</div>
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="text-body" style={{ color: 'var(--text-muted)' }}>
                      No registration submissions match your filter criteria.
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => {
                  const isAttended = Boolean(r.attended);
                  return (
                    <tr
                      key={r._id || r.registrationId}
                      style={{ background: isAttended ? 'rgba(16, 185, 129, 0.02)' : 'inherit' }}
                    >
                      <td>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: 'var(--accent-institution)'
                        }}>
                          {r.registrationId}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(r.registrationDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div className="participant-cell">
                          <span className="participant-name" style={{ fontWeight: 600 }}>{r.participantName}</span>
                          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                            ID: {r.studentId || 'N/A'} • {r.year || '2nd Year'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', display: 'block' }}>
                            {r.event}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {r.venue || 'RVRJC Arena'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8125rem' }}>
                          <span style={{ fontWeight: 600, color: r.teamName ? 'var(--accent-cultural)' : 'var(--text-secondary)' }}>
                            {r.teamName || 'Solo Entry'}
                          </span>
                          {r.teammates && r.teammates.length > 1 && (
                            <span style={{ fontSize: '0.7rem', marginLeft: '0.35rem', color: 'var(--text-muted)' }}>
                              ({r.teammates.length} members)
                            </span>
                          )}
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {r.college}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="contact-cell">
                          <span className="contact-email">{r.email}</span>
                          <span className="contact-phone">{r.phoneNumber}</span>
                        </div>
                      </td>

                      {/* 1-Click Attendance Checklist Toggle Button */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={(e) => handleToggleAttendance(r, e)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            border: isAttended ? '1px solid #10B981' : '1px solid #CBD5E1',
                            background: isAttended ? '#ECFDF5' : '#F8FAFC',
                            color: isAttended ? '#059669' : '#64748B'
                          }}
                          title={isAttended ? 'Click to toggle Absent' : 'Click to Mark Attended'}
                        >
                          {isAttended ? (
                            <>
                              <span>✓ Attended</span>
                            </>
                          ) : (
                            <>
                              <span>○ Mark Attended</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Action Buttons: PDF, Edit, Delete */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-buttons" style={{ justifyContent: 'flex-end', gap: '0.35rem' }}>
                          {/* Download PDF Pass */}
                          <button
                            className="icon-btn"
                            title="Download Official E-Pass PDF"
                            onClick={() => generateRegistrationPDF(r)}
                            style={{ color: '#1E40AF' }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="12" y1="18" x2="12" y2="12" />
                              <line x1="9" y1="15" x2="15" y2="15" />
                            </svg>
                          </button>

                          {/* Edit / Override */}
                          <button
                            className="icon-btn"
                            title="Edit / Override Participant Details"
                            onClick={() => setEditRecord(JSON.parse(JSON.stringify(r)))}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>

                          {/* Delete */}
                          <button
                            className="icon-btn icon-btn-danger"
                            title="Delete / Archive Entry"
                            onClick={() => setDeleteCandidate(r)}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="pagination-strip">
            <div>
              Showing {filteredRecords.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0} to{' '}
              {Math.min(currentPage * PAGE_SIZE, filteredRecords.length)} of {filteredRecords.length} submissions
            </div>

            <div style={{ display: 'flex', gap: '0.375rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                Previous
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* 3. ON-SPOT REGISTRATION MODAL */}
        {showOnSpotModal && (
          <div className="modal-backdrop" onClick={() => setShowOnSpotModal(false)}>
            <div className="modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cultural)', textTransform: 'uppercase' }}>
                    Desk Registration Desk
                  </div>
                  <h3 className="heading-subsection">On-Spot Participant Registration</h3>
                </div>
                <button className="icon-btn" onClick={() => setShowOnSpotModal(false)}>✕</button>
              </div>

              <div className="modal-body">
                {onSpotSuccess ? (
                  <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
                    <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                      On-Spot Registration Complete!
                    </h4>
                    <div style={{
                      background: '#0B162C',
                      color: '#FFF',
                      padding: '1rem',
                      borderRadius: '8px',
                      maxWidth: '360px',
                      margin: '0 auto 1.5rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.5rem',
                      fontWeight: 700
                    }}>
                      {onSpotSuccess.registrationId}
                    </div>
                    <p className="text-body" style={{ marginBottom: '1.5rem' }}>
                      Registered <strong>{onSpotSuccess.participantName}</strong> for <strong>{onSpotSuccess.event}</strong> ({onSpotSuccess.venue}).
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => generateRegistrationPDF(onSpotSuccess)}
                      >
                        📥 Download Official E-Pass PDF
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setOnSpotSuccess(null);
                          setOnSpotData({
                            participantName: '',
                            studentId: '',
                            department: 'Computer Science (CSE)',
                            year: '2nd Year',
                            gender: 'Male',
                            college: 'RVR & JC College of Engineering',
                            email: '',
                            phoneNumber: '',
                            category: 'Sports',
                            division: 'Boys',
                            event: 'Basketball',
                            teamName: '',
                            teammates: [],
                            attended: true
                          });
                        }}
                      >
                        Register Next
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleOnSpotSubmit}>
                    {onSpotError && (
                      <div style={{
                        background: '#FFF5F5',
                        border: '1px solid #FEB2B2',
                        color: '#C53030',
                        padding: '0.5rem 0.85rem',
                        borderRadius: '4px',
                        marginBottom: '1rem',
                        fontSize: '0.8125rem'
                      }}>
                        {onSpotError}
                      </div>
                    )}

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. S. V. Krishna"
                          value={onSpotData.participantName}
                          onChange={(e) => setOnSpotData(prev => ({ ...prev, participantName: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Roll No / Student ID</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Y22CS099"
                          value={onSpotData.studentId}
                          onChange={(e) => setOnSpotData(prev => ({ ...prev, studentId: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">College / Institution *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="RVR & JC College of Engineering"
                          value={onSpotData.college}
                          onChange={(e) => setOnSpotData(prev => ({ ...prev, college: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Mobile Number *</label>
                        <input
                          type="tel"
                          className="form-input"
                          placeholder="10-digit phone"
                          value={onSpotData.phoneNumber}
                          onChange={(e) => setOnSpotData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Competition Event *</label>
                        <select
                          className="form-select"
                          value={onSpotData.event}
                          onChange={(e) => {
                            const val = e.target.value;
                            const meta = getEventDetails(val);
                            setOnSpotData(prev => ({
                              ...prev,
                              event: val,
                              category: meta.category,
                              division: meta.division
                            }));
                          }}
                        >
                          {Object.keys(EVENT_DETAILS).map(eName => (
                            <option key={eName} value={eName}>{eName} ({EVENT_DETAILS[eName].category})</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Team Name (if team event)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Host City Warriors"
                          value={onSpotData.teamName}
                          onChange={(e) => setOnSpotData(prev => ({ ...prev, teamName: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Check-in checkbox */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'rgba(16, 185, 129, 0.08)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '4px',
                      marginTop: '0.75rem'
                    }}>
                      <input
                        type="checkbox"
                        id="onspot-attended"
                        checked={onSpotData.attended}
                        onChange={(e) => setOnSpotData(prev => ({ ...prev, attended: e.target.checked }))}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      <label htmlFor="onspot-attended" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#059669', cursor: 'pointer' }}>
                        Mark as Attended Immediately (Participant is physically at the desk)
                      </label>
                    </div>

                    <div className="modal-footer" style={{ marginTop: '1.25rem' }}>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowOnSpotModal(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary btn-sm">
                        Register & Generate Pass
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. EDIT / OVERRIDE REGISTRATION MODAL */}
        {editRecord && (
          <div className="modal-backdrop" onClick={() => setEditRecord(null)}>
            <div className="modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-institution)' }}>
                    OVERRIDE ENTRY: {editRecord.registrationId}
                  </div>
                  <h3 className="heading-subsection">Edit Participant Registration</h3>
                </div>
                <button className="icon-btn" onClick={() => setEditRecord(null)}>✕</button>
              </div>

              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Participant Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editRecord.participantName || ''}
                      onChange={(e) => setEditRecord(prev => ({ ...prev, participantName: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Student ID / Roll No</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editRecord.studentId || ''}
                      onChange={(e) => setEditRecord(prev => ({ ...prev, studentId: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">College / Institution</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editRecord.college || ''}
                      onChange={(e) => setEditRecord(prev => ({ ...prev, college: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editRecord.department || ''}
                      onChange={(e) => setEditRecord(prev => ({ ...prev, department: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={editRecord.email || ''}
                      onChange={(e) => setEditRecord(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editRecord.phoneNumber || ''}
                      onChange={(e) => setEditRecord(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Event</label>
                    <select
                      className="form-select"
                      value={editRecord.event || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const meta = getEventDetails(val);
                        setEditRecord(prev => ({
                          ...prev,
                          event: val,
                          venue: meta.venue,
                          schedule: meta.schedule,
                          category: meta.category
                        }));
                      }}
                    >
                      {Object.keys(EVENT_DETAILS).map(eName => (
                        <option key={eName} value={eName}>{eName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Team Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editRecord.teamName || ''}
                      onChange={(e) => setEditRecord(prev => ({ ...prev, teamName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Venue Override</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editRecord.venue || ''}
                      onChange={(e) => setEditRecord(prev => ({ ...prev, venue: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Schedule Override</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editRecord.schedule || ''}
                      onChange={(e) => setEditRecord(prev => ({ ...prev, schedule: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Attendance Status</label>
                    <select
                      className="form-select"
                      value={editRecord.attended ? 'true' : 'false'}
                      onChange={(e) => setEditRecord(prev => ({ ...prev, attended: e.target.value === 'true' }))}
                    >
                      <option value="true">Attended (Present on Campus)</option>
                      <option value="false">Not Attended (Absent)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Registration Status</label>
                    <select
                      className="form-select"
                      value={editRecord.status || 'Confirmed'}
                      onChange={(e) => setEditRecord(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Waitlisted">Waitlisted</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => setEditRecord(null)}>
                  Cancel
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>
                  Save & Override Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. DELETE CONFIRMATION MODAL */}
        {deleteCandidate && (
          <div className="modal-backdrop" onClick={() => setDeleteCandidate(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="heading-subsection" style={{ color: '#C53030' }}>Confirm Removal</h3>
                <button className="icon-btn" onClick={() => setDeleteCandidate(null)}>✕</button>
              </div>
              <div className="modal-body">
                <p className="text-body">
                  Are you sure you want to permanently delete registration <strong>{deleteCandidate.registrationId}</strong> for <strong>{deleteCandidate.participantName}</strong> ({deleteCandidate.event})?
                </p>
                <p className="text-caption" style={{ marginTop: '0.5rem', color: '#C53030' }}>
                  This action will remove the record from MongoDB storage and cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => setDeleteCandidate(null)}>
                  Cancel
                </button>
                <button
                  className="btn btn-sm"
                  style={{ backgroundColor: '#C53030', color: '#FFFFFF', borderColor: '#C53030' }}
                  onClick={handleDeleteConfirm}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
