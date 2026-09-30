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
  adminLogout,
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  fetchResults,
  createResult,
  updateResult,
  deleteResult
} from '../api/client.js';
import { generateRegistrationPDF } from '../utils/pdfPassGenerator.js';
import { generateCertificatePDF } from '../utils/pdfCertificateGenerator.js';
import { EVENT_DETAILS, getEventDetails } from '../../config/eventSchedule.js';

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

  // Admin Navigation Tabs
  const [adminTab, setAdminTab] = useState('registrations'); // 'registrations' | 'announcements' | 'results'

  // Announcements Management State
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementCategoryFilter, setAnnouncementCategoryFilter] = useState('all');
  const [announcementSearch, setAnnouncementSearch] = useState('');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcementFormData, setAnnouncementFormData] = useState({
    title: '',
    category: 'General',
    priority: 'Normal',
    pinned: false,
    date: new Date().toISOString().split('T')[0],
    content: '',
    imageUrl: '',
    venue: '',
    instructions: '',
    coordinator: ''
  });

  // Tournament Results Management State
  const [resultsList, setResultsList] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultCategoryFilter, setResultCategoryFilter] = useState('all');
  const [resultSearch, setResultSearch] = useState('');
  const [showResultModal, setShowResultModal] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [resultFormData, setResultFormData] = useState({
    event: 'Basketball',
    category: 'Sports',
    division: 'Boys',
    position: 'Winner',
    winnerType: 'Team',
    teamName: '',
    participantName: '',
    teammates: '',
    college: '',
    department: '',
    scoreOrRound: '',
    dateAnnounced: new Date().toISOString().split('T')[0],
    certificateId: '',
    status: 'Official'
  });

  const [deleteCustomCandidate, setDeleteCustomCandidate] = useState(null); // { type: 'announcement'|'result', item }

  const loadAnnouncements = async () => {
    setAnnouncementsLoading(true);
    try {
      const data = await fetchAnnouncements();
      setAnnouncementsList(data || []);
    } catch (err) {
      console.error('Failed to load announcements in admin:', err);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const loadResults = async () => {
    setResultsLoading(true);
    try {
      const data = await fetchResults();
      setResultsList(data || []);
    } catch (err) {
      console.error('Failed to load results in admin:', err);
    } finally {
      setResultsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      loadAnnouncements();
      loadResults();
    }
  }, [isAuthenticated, categoryFilter, divisionFilter, eventFilter, attendanceFilter]);

  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenCreateAnnouncement = () => {
    setEditingAnnouncement(null);
    setAnnouncementFormData({
      title: '',
      category: 'General',
      priority: 'Normal',
      pinned: false,
      date: new Date().toISOString().split('T')[0],
      content: '',
      imageUrl: '',
      venue: '',
      instructions: '',
      coordinator: ''
    });
    setShowAnnouncementModal(true);
  };

  const handleOpenEditAnnouncement = (ann) => {
    setEditingAnnouncement(ann);
    setAnnouncementFormData({
      title: ann.title || '',
      category: ann.category || 'General',
      priority: ann.priority || 'Normal',
      pinned: Boolean(ann.pinned),
      date: ann.date ? ann.date.split('T')[0] : new Date().toISOString().split('T')[0],
      content: ann.content || '',
      imageUrl: ann.imageUrl || '',
      venue: ann.venue || '',
      instructions: Array.isArray(ann.instructions) ? ann.instructions.join('\n') : (ann.instructions || ''),
      coordinator: ann.coordinator || ''
    });
    setShowAnnouncementModal(true);
  };

  const handleSaveAnnouncement = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!announcementFormData.title.trim()) {
      showNotification('Announcement title is required.', 'error');
      return;
    }
    if (!announcementFormData.content.trim()) {
      showNotification('Announcement content is required.', 'error');
      return;
    }

    const payload = {
      ...announcementFormData,
      instructions: typeof announcementFormData.instructions === 'string'
        ? announcementFormData.instructions.split('\n').map(s => s.trim()).filter(Boolean)
        : []
    };

    try {
      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement._id || editingAnnouncement.id, payload);
        showNotification('Announcement updated successfully!', 'success');
      } else {
        await createAnnouncement(payload);
        showNotification('New announcement published successfully!', 'success');
      }
      setShowAnnouncementModal(false);
      loadAnnouncements();
    } catch (err) {
      showNotification(`Failed to save announcement: ${err.message}`, 'error');
    }
  };

  const handleTogglePinAnnouncement = async (ann) => {
    try {
      const newPinned = !Boolean(ann.pinned);
      await updateAnnouncement(ann._id || ann.id, { pinned: newPinned });
      showNotification(`Announcement ${newPinned ? 'pinned to top 📌' : 'unpinned'}`, 'success');
      loadAnnouncements();
    } catch (err) {
      showNotification(`Pin toggle failed: ${err.message}`, 'error');
    }
  };

  const handleOpenCreateResult = () => {
    setEditingResult(null);
    setResultFormData({
      event: 'Basketball',
      category: 'Sports',
      division: 'Boys',
      position: 'Winner',
      winnerType: 'Team',
      teamName: '',
      participantName: '',
      teammates: '',
      college: '',
      department: '',
      scoreOrRound: '',
      dateAnnounced: new Date().toISOString().split('T')[0],
      certificateId: `RVR-CLR26-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'Official'
    });
    setShowResultModal(true);
  };

  const handleOpenEditResult = (res) => {
    setEditingResult(res);
    setResultFormData({
      event: res.event || 'Basketball',
      category: res.category || 'Sports',
      division: res.division || 'Boys',
      position: res.position || 'Winner',
      winnerType: res.winnerType || 'Team',
      teamName: res.teamName || '',
      participantName: res.participantName || '',
      teammates: Array.isArray(res.teammates) ? res.teammates.join(', ') : (res.teammates || ''),
      college: res.college || '',
      department: res.department || '',
      scoreOrRound: res.scoreOrRound || '',
      dateAnnounced: res.dateAnnounced ? res.dateAnnounced.split('T')[0] : new Date().toISOString().split('T')[0],
      certificateId: res.certificateId || '',
      status: res.status || 'Official'
    });
    setShowResultModal(true);
  };

  const handleSaveResult = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!resultFormData.participantName.trim() && !resultFormData.teamName.trim()) {
      showNotification('Participant or Team Name is required.', 'error');
      return;
    }
    if (!resultFormData.college.trim()) {
      showNotification('College Name is required.', 'error');
      return;
    }

    const payload = {
      ...resultFormData,
      teammates: typeof resultFormData.teammates === 'string'
        ? resultFormData.teammates.split(',').map(s => s.trim()).filter(Boolean)
        : []
    };

    try {
      if (editingResult) {
        await updateResult(editingResult._id || editingResult.id, payload);
        showNotification('Tournament result updated successfully!', 'success');
      } else {
        await createResult(payload);
        showNotification('Tournament laurel and certificate published!', 'success');
      }
      setShowResultModal(false);
      loadResults();
    } catch (err) {
      showNotification(`Failed to save result: ${err.message}`, 'error');
    }
  };

  const handleDeleteCustomItem = async () => {
    if (!deleteCustomCandidate) return;
    const { type, item } = deleteCustomCandidate;
    try {
      if (type === 'announcement') {
        await deleteAnnouncement(item._id || item.id);
        showNotification('Announcement deleted successfully.', 'success');
        loadAnnouncements();
      } else if (type === 'result') {
        await deleteResult(item._id || item.id);
        showNotification('Tournament result removed.', 'success');
        loadResults();
      }
      setDeleteCustomCandidate(null);
    } catch (err) {
      showNotification(`Failed to delete item: ${err.message}`, 'error');
    }
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

        {/* Primary Admin Navigation Tabs */}
        <div className="admin-primary-tabs">
          <button
            className={`admin-nav-tab ${adminTab === 'registrations' ? 'active' : ''}`}
            onClick={() => setAdminTab('registrations')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Registrations &amp; Attendance</span>
            <span className="admin-badge">{registrations.length}</span>
          </button>

          <button
            className={`admin-nav-tab ${adminTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setAdminTab('announcements')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span>Announcements Manager</span>
            <span className="admin-badge">{announcementsList.length}</span>
          </button>

          <button
            className={`admin-nav-tab ${adminTab === 'results' ? 'active' : ''}`}
            onClick={() => setAdminTab('results')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="7" />
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
            <span>Results &amp; Certificate Publisher</span>
            <span className="admin-badge">{resultsList.length}</span>
          </button>
        </div>

        {adminTab === 'registrations' && (
          <>
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
          </>
        )}

        {/* 2. ANNOUNCEMENTS MANAGER TAB */}
        {adminTab === 'announcements' && (
          <div className="admin-announcements-section">
            <div className="admin-sub-header">
              <div>
                <h2 className="heading-subsection" style={{ marginBottom: '0.25rem' }}>
                  Institutional Announcements &amp; Bulletins
                </h2>
                <p className="text-body" style={{ fontSize: '0.875rem' }}>
                  Create and manage official notices, schedule changes, and venue allocations visible on the public portal.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleOpenCreateAnnouncement}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Post Announcement</span>
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigate('results')}
                  title="View Public Announcements Page"
                >
                  View Public Page ↗
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="admin-controls-card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label className="form-label" style={{ margin: 0, fontSize: '0.8125rem' }}>Category:</label>
                  <select
                    className="form-select form-select-sm"
                    value={announcementCategoryFilter}
                    onChange={(e) => setAnnouncementCategoryFilter(e.target.value)}
                    style={{ minWidth: '150px' }}
                  >
                    <option value="all">All Categories</option>
                    <option value="General">General</option>
                    <option value="Sports">Sports</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Literary">Literary</option>
                    <option value="Schedule">Schedule</option>
                    <option value="Venue">Venue</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                <div className="search-input-wrapper" style={{ minWidth: '280px' }}>
                  <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    className="form-input form-input-sm"
                    placeholder="Search announcements..."
                    value={announcementSearch}
                    onChange={(e) => setAnnouncementSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Announcements List/Cards */}
            {announcementsLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                Loading announcements...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {announcementsList
                  .filter(a => {
                    if (announcementCategoryFilter !== 'all' && a.category !== announcementCategoryFilter) return false;
                    if (announcementSearch) {
                      const s = announcementSearch.toLowerCase();
                      const match = (a.title && a.title.toLowerCase().includes(s)) ||
                                    (a.content && a.content.toLowerCase().includes(s)) ||
                                    (a.venue && a.venue.toLowerCase().includes(s)) ||
                                    (a.coordinator && a.coordinator.toLowerCase().includes(s));
                      if (!match) return false;
                    }
                    return true;
                  })
                  .map(a => (
                    <div
                      key={a._id || a.id}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid var(--border-light)',
                        borderLeft: a.pinned ? '4px solid var(--accent-cultural)' : '1px solid var(--border-light)',
                        borderRadius: '10px',
                        padding: '1.25rem 1.5rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {a.pinned && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#FEF3C7', color: '#92400E', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                              📌 Pinned
                            </span>
                          )}
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            background: a.priority === 'Urgent' ? '#FEE2E2' : a.priority === 'High' ? '#FFEDD5' : '#E0E7FF',
                            color: a.priority === 'Urgent' ? '#991B1B' : a.priority === 'High' ? '#C2410C' : '#3730A3'
                          }}>
                            {a.priority || 'Normal'} Priority
                          </span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, background: '#F3F4F6', color: '#374151', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            {a.category || 'General'}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {a.date ? new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => handleTogglePinAnnouncement(a)}
                            title={a.pinned ? 'Unpin Announcement' : 'Pin to Top'}
                          >
                            {a.pinned ? 'Unpin' : '📌 Pin'}
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => handleOpenEditAnnouncement(a)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' }}
                            onClick={() => setDeleteCustomCandidate({ type: 'announcement', item: a })}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                          {a.title}
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: '#4B5563', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                          {a.content}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.78125rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '0.6rem' }}>
                        {a.venue && (
                          <span>📍 <strong>Venue:</strong> {a.venue}</span>
                        )}
                        {a.coordinator && (
                          <span>👤 <strong>Coordinator:</strong> {a.coordinator}</span>
                        )}
                        {a.imageUrl && (
                          <span>🖼️ <strong>Image Attached</strong></span>
                        )}
                        {Array.isArray(a.instructions) && a.instructions.length > 0 && (
                          <span>📋 <strong>{a.instructions.length} Guidelines</strong></span>
                        )}
                      </div>
                    </div>
                  ))}

                {announcementsList.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem 0', background: '#FFFFFF', borderRadius: '10px', border: '1px dashed var(--border-light)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📢</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No Announcements Found</div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Click "Post Announcement" to create the first bulletin.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. TOURNAMENT RESULTS PUBLISHER TAB */}
        {adminTab === 'results' && (
          <div className="admin-results-section">
            <div className="admin-sub-header">
              <div>
                <h2 className="heading-subsection" style={{ marginBottom: '0.25rem' }}>
                  Tournament Laurels &amp; Certificate Publisher
                </h2>
                <p className="text-body" style={{ fontSize: '0.875rem' }}>
                  Authorize official winners, runners-up, rosters, and enable instant PDF merit certificates.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleOpenCreateResult}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Publish Result</span>
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigate('results')}
                  title="View Public Results Page"
                >
                  View Public Page ↗
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="admin-controls-card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label className="form-label" style={{ margin: 0, fontSize: '0.8125rem' }}>Category:</label>
                  <select
                    className="form-select form-select-sm"
                    value={resultCategoryFilter}
                    onChange={(e) => setResultCategoryFilter(e.target.value)}
                    style={{ minWidth: '150px' }}
                  >
                    <option value="all">All Disciplines</option>
                    <option value="Sports">Sports</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Literary">Literary</option>
                  </select>
                </div>

                <div className="search-input-wrapper" style={{ minWidth: '280px' }}>
                  <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    className="form-input form-input-sm"
                    placeholder="Search winner, team, college, or cert ID..."
                    value={resultSearch}
                    onChange={(e) => setResultSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Results Table */}
            {resultsLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                Loading tournament laurels...
              </div>
            ) : (
              <div className="admin-table-card" style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Placement</th>
                      <th>Event &amp; Category</th>
                      <th>Winner / Team</th>
                      <th>Institution</th>
                      <th>Score / Details</th>
                      <th>Certificate ID</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultsList
                      .filter(r => {
                        if (resultCategoryFilter !== 'all' && r.category !== resultCategoryFilter) return false;
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
                      })
                      .map(r => {
                        const isGold = r.position === 'Winner';
                        const isSilver = r.position === 'Runner-Up';
                        const isBronze = r.position === 'Second Runner-Up';

                        return (
                          <tr key={r._id || r.id}>
                            <td>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '4px',
                                fontSize: '0.78125rem',
                                fontWeight: 700,
                                background: isGold ? '#FEF3C7' : isSilver ? '#F1F5F9' : '#FFEDD5',
                                color: isGold ? '#92400E' : isSilver ? '#334155' : '#9A3412'
                              }}>
                                {isGold ? '🥇 Winner' : isSilver ? '🥈 Runner-Up' : isBronze ? '🥉 2nd Runner-Up' : '🎖️ ' + r.position}
                              </span>
                            </td>

                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.event}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {r.category} • {r.division}
                              </div>
                            </td>

                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {r.participantName}
                              </div>
                              {r.teamName && (
                                <div style={{ fontSize: '0.78125rem', color: 'var(--accent-cultural)' }}>
                                  Team: {r.teamName}
                                </div>
                              )}
                              {Array.isArray(r.teammates) && r.teammates.length > 0 && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  +{r.teammates.length} teammates
                                </div>
                              )}
                            </td>

                            <td>
                              <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>{r.college}</div>
                              {r.department && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.department}</div>
                              )}
                            </td>

                            <td>
                              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#059669' }}>
                                {r.scoreOrRound || 'Official Decision'}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {r.dateAnnounced ? new Date(r.dateAnnounced).toLocaleDateString() : ''}
                              </div>
                            </td>

                            <td>
                              <code style={{ fontSize: '0.75rem', background: '#F3F4F6', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                {r.certificateId}
                              </code>
                            </td>

                            <td style={{ textAlign: 'right' }}>
                              <div className="action-buttons" style={{ justifyContent: 'flex-end', gap: '0.35rem' }}>
                                <button
                                  className="icon-btn"
                                  title="Download Merit Certificate PDF"
                                  onClick={() => generateCertificatePDF(r)}
                                  style={{ color: '#D97706' }}
                                >
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="8" r="7" />
                                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                                  </svg>
                                </button>

                                <button
                                  className="icon-btn"
                                  title="Edit Laurel Record"
                                  onClick={() => handleOpenEditResult(r)}
                                >
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                </button>

                                <button
                                  className="icon-btn icon-btn-danger"
                                  title="Delete Laurel Record"
                                  onClick={() => setDeleteCustomCandidate({ type: 'result', item: r })}
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
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. ON-SPOT REGISTRATION MODAL */}
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

        {/* 6. ANNOUNCEMENT FORM MODAL (CREATE / EDIT) */}
        {showAnnouncementModal && (
          <div className="modal-backdrop" onClick={() => setShowAnnouncementModal(false)}>
            <div className="modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cultural)', textTransform: 'uppercase' }}>
                    Institutional Bulletin Publisher
                  </div>
                  <h3 className="heading-subsection">
                    {editingAnnouncement ? 'Edit Official Announcement' : 'Post New Official Announcement'}
                  </h3>
                </div>
                <button className="icon-btn" onClick={() => setShowAnnouncementModal(false)}>✕</button>
              </div>

              <form onSubmit={handleSaveAnnouncement}>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <div className="form-group">
                    <label className="form-label">Announcement Title *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Basketball Championship Finals Relocation & Timing"
                      value={announcementFormData.title}
                      onChange={(e) => setAnnouncementFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        value={announcementFormData.category}
                        onChange={(e) => setAnnouncementFormData(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="General">General Notice</option>
                        <option value="Sports">Sports</option>
                        <option value="Cultural">Cultural</option>
                        <option value="Literary">Literary</option>
                        <option value="Schedule">Schedule Update</option>
                        <option value="Venue">Venue Allocation</option>
                        <option value="Emergency">Urgent / Emergency</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Priority Level</label>
                      <select
                        className="form-select"
                        value={announcementFormData.priority}
                        onChange={(e) => setAnnouncementFormData(prev => ({ ...prev, priority: e.target.value }))}
                      >
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent / Flash</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={announcementFormData.date}
                        onChange={(e) => setAnnouncementFormData(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '1.75rem' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={announcementFormData.pinned}
                          onChange={(e) => setAnnouncementFormData(prev => ({ ...prev, pinned: e.target.checked }))}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cultural)' }}
                        />
                        <span>Pin to top of public feed 📌</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Venue / Location Allocation</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Main Wooden Indoor Court (Silver Jubilee)"
                        value={announcementFormData.venue}
                        onChange={(e) => setAnnouncementFormData(prev => ({ ...prev, venue: e.target.value }))}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Faculty Coordinator &amp; Contact</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Dr. P. Sudhakar • 98480 12345"
                        value={announcementFormData.coordinator}
                        onChange={(e) => setAnnouncementFormData(prev => ({ ...prev, coordinator: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Banner / Image URL (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. /gallery/campus-center.jpg or external https:// link"
                      value={announcementFormData.imageUrl}
                      onChange={(e) => setAnnouncementFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Tip: You can use local gallery images like <code>/gallery/basketball.jpg</code> or <code>/gallery/campus-center.jpg</code>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Key Guidelines &amp; Protocols (One per line)</label>
                    <textarea
                      className="form-input"
                      rows="3"
                      placeholder="Valid College ID Mandatory&#10;Report 30 mins before match whistle&#10;Non-marking court shoes compulsory"
                      value={announcementFormData.instructions}
                      onChange={(e) => setAnnouncementFormData(prev => ({ ...prev, instructions: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Announcement Content / Full Bulletin *</label>
                    <textarea
                      className="form-input"
                      rows="4"
                      placeholder="Enter the complete detailed notice for student and faculty attendees..."
                      value={announcementFormData.content}
                      onChange={(e) => setAnnouncementFormData(prev => ({ ...prev, content: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAnnouncementModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    {editingAnnouncement ? 'Save & Update Announcement' : 'Publish Announcement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 7. TOURNAMENT RESULT MODAL (CREATE / EDIT) */}
        {showResultModal && (
          <div className="modal-backdrop" onClick={() => setShowResultModal(false)}>
            <div className="modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cultural)', textTransform: 'uppercase' }}>
                    Merit &amp; Certificate Authority
                  </div>
                  <h3 className="heading-subsection">
                    {editingResult ? 'Edit Tournament Laurel' : 'Publish Tournament Result & Certificate'}
                  </h3>
                </div>
                <button className="icon-btn" onClick={() => setShowResultModal(false)}>✕</button>
              </div>

              <form onSubmit={handleSaveResult}>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Event Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Basketball, Cricket, Classical Dance"
                        value={resultFormData.event}
                        onChange={(e) => setResultFormData(prev => ({ ...prev, event: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        value={resultFormData.category}
                        onChange={(e) => setResultFormData(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="Sports">Sports</option>
                        <option value="Cultural">Cultural</option>
                        <option value="Literary">Literary</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Division</label>
                      <select
                        className="form-select"
                        value={resultFormData.division}
                        onChange={(e) => setResultFormData(prev => ({ ...prev, division: e.target.value }))}
                      >
                        <option value="Boys">Boys Division</option>
                        <option value="Girls">Girls Division</option>
                        <option value="Open">Open / Mixed</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Placement / Award *</label>
                      <select
                        className="form-select"
                        value={resultFormData.position}
                        onChange={(e) => setResultFormData(prev => ({ ...prev, position: e.target.value }))}
                      >
                        <option value="Winner">Winner (First Place 🥇)</option>
                        <option value="Runner-Up">Runner-Up (Second Place 🥈)</option>
                        <option value="Second Runner-Up">Second Runner-Up (Third Place 🥉)</option>
                        <option value="Special Mention">Special Mention / Jury Award 🎖️</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Winner Type</label>
                      <select
                        className="form-select"
                        value={resultFormData.winnerType}
                        onChange={(e) => setResultFormData(prev => ({ ...prev, winnerType: e.target.value }))}
                      >
                        <option value="Team">Team Entry</option>
                        <option value="Individual">Individual Participant</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Participant / Captain Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Rohan Varma (Captain)"
                        value={resultFormData.participantName}
                        onChange={(e) => setResultFormData(prev => ({ ...prev, participantName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  {resultFormData.winnerType === 'Team' && (
                    <div className="form-group">
                      <label className="form-label">Team Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. VRSEC Titans or RVR Thunder"
                        value={resultFormData.teamName}
                        onChange={(e) => setResultFormData(prev => ({ ...prev, teamName: e.target.value }))}
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Teammates Roster (Comma-separated)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Nikhil Reddy, K. Sai Teja, M. Akhil, D. Dinesh"
                      value={resultFormData.teammates}
                      onChange={(e) => setResultFormData(prev => ({ ...prev, teammates: e.target.value }))}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">College / Institution *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Velagapudi Ramakrishna Siddhartha Engineering College"
                        value={resultFormData.college}
                        onChange={(e) => setResultFormData(prev => ({ ...prev, college: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Computer Science & Engineering"
                        value={resultFormData.department}
                        onChange={(e) => setResultFormData(prev => ({ ...prev, department: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Score / Margin / Round Summary</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Finals: 68 - 54 or Unanimous 1st Place"
                        value={resultFormData.scoreOrRound}
                        onChange={(e) => setResultFormData(prev => ({ ...prev, scoreOrRound: e.target.value }))}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Date Announced</label>
                      <input
                        type="date"
                        className="form-input"
                        value={resultFormData.dateAnnounced}
                        onChange={(e) => setResultFormData(prev => ({ ...prev, dateAnnounced: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Certificate Unique Verification ID</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. RVR-CLR26-88219"
                        value={resultFormData.certificateId}
                        onChange={(e) => setResultFormData(prev => ({ ...prev, certificateId: e.target.value }))}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Verification Status</label>
                      <select
                        className="form-select"
                        value={resultFormData.status}
                        onChange={(e) => setResultFormData(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <option value="Official">Official &amp; Verified</option>
                        <option value="Provisional">Provisional</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowResultModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    {editingResult ? 'Save & Update Result' : 'Publish Result & Certificate'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 8. CUSTOM ITEM DELETE CONFIRMATION MODAL */}
        {deleteCustomCandidate && (
          <div className="modal-backdrop" onClick={() => setDeleteCustomCandidate(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="heading-subsection" style={{ color: '#C53030' }}>
                  Confirm Deletion
                </h3>
                <button className="icon-btn" onClick={() => setDeleteCustomCandidate(null)}>✕</button>
              </div>
              <div className="modal-body">
                <p className="text-body">
                  Are you sure you want to permanently delete this {deleteCustomCandidate.type === 'announcement' ? 'Announcement' : 'Tournament Laurel'}?
                </p>
                <div style={{
                  background: '#FDF2F2',
                  border: '1px solid #FECACA',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  marginTop: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#991B1B'
                }}>
                  <strong>
                    {deleteCustomCandidate.item.title ||
                     deleteCustomCandidate.item.participantName ||
                     deleteCustomCandidate.item.event}
                  </strong>
                  {deleteCustomCandidate.item.certificateId && (
                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      Certificate ID: {deleteCustomCandidate.item.certificateId}
                    </div>
                  )}
                </div>
                <p className="text-caption" style={{ marginTop: '0.5rem', color: '#C53030' }}>
                  This action will permanently delete the entry from the database and remove it from the public portal.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => setDeleteCustomCandidate(null)}>
                  Cancel
                </button>
                <button
                  className="btn btn-sm"
                  style={{ backgroundColor: '#C53030', color: '#FFFFFF', borderColor: '#C53030' }}
                  onClick={handleDeleteCustomItem}
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
