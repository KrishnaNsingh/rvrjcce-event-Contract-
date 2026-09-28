import React, { useState, useEffect } from '../core/react.js';
import { INSTITUTION } from '../../config/eventConfig.js';
import { fetchRegistrations, fetchStats, deleteRegistration, getCsvExportUrl } from '../api/client.js';

export function AdminDashboard({ onNavigate }) {
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    sports: 0,
    cultural: 0,
    boys: 0,
    girls: 0,
    colleges: 0
  });

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [notification, setNotification] = useState(null);

  const PAGE_SIZE = 8;

  const loadData = async () => {
    setLoading(true);
    try {
      const [regs, statData] = await Promise.all([
        fetchRegistrations(),
        fetchStats()
      ]);
      setRegistrations(regs || []);
      if (statData) setStats(statData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteRegistration(deleteCandidate._id);
      showNotification(`Record ${deleteCandidate.registrationId} removed successfully.`, 'success');
      setDeleteCandidate(null);
      loadData();
    } catch (err) {
      showNotification(`Error deleting record: ${err.message}`, 'error');
    }
  };

  // Filtered & Sorted registrations
  const filteredRecords = registrations.filter(r => {
    const matchesSearch = !searchTerm ||
      (r.participantName && r.participantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.college && r.college.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.teamName && r.teamName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.registrationId && r.registrationId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.event && r.event.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesDivision = divisionFilter === 'all' || r.division === divisionFilter;

    return matchesSearch && matchesCategory && matchesDivision;
  });

  // Sorting
  filteredRecords.sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.registrationDate) - new Date(a.registrationDate);
    if (sortBy === 'date-asc') return new Date(a.registrationDate) - new Date(b.registrationDate);
    if (sortBy === 'name') return (a.participantName || '').localeCompare(b.participantName || '');
    if (sortBy === 'college') return (a.college || '').localeCompare(b.college || '');
    return 0;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="section-wrapper admin-page">
      <div className="container">
        {/* Header Bar */}
        <div className="admin-header">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-dot"></span>
              INSTITUTIONAL ADMINISTRATION
            </span>
            <h1 className="heading-section" style={{ fontSize: '2.25rem' }}>
              University Registration Console
            </h1>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {INSTITUTION.name} Event Organizing Committee • Inter-College Meet 2026
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <a
              href={getCsvExportUrl({ category: categoryFilter, division: divisionFilter, search: searchTerm })}
              className="btn btn-secondary btn-sm"
              download
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              <span>Export CSV</span>
            </a>
            <button
              className="btn btn-primary btn-sm"
              onClick={loadData}
            >
              Refresh Data
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

        {/* Overview Metric Cards */}
        <div className="admin-metrics-grid">
          <div className="admin-metric-card" style={{ borderTop: '3px solid var(--text-primary)' }}>
            <span className="metric-number">{stats.total}</span>
            <span className="metric-label">Total Entries</span>
          </div>

          <div className="admin-metric-card" style={{ borderTop: '3px solid var(--accent-institution)' }}>
            <span className="metric-number" style={{ color: 'var(--accent-institution)' }}>{stats.sports}</span>
            <span className="metric-label">Sports Registrations</span>
          </div>

          <div className="admin-metric-card" style={{ borderTop: '3px solid var(--accent-cultural)' }}>
            <span className="metric-number" style={{ color: 'var(--accent-cultural)' }}>{stats.cultural}</span>
            <span className="metric-label">Cultural Registrations</span>
          </div>

          <div className="admin-metric-card" style={{ borderTop: '3px solid #1652A0' }}>
            <span className="metric-number">{stats.boys}</span>
            <span className="metric-label">Boys Division</span>
          </div>

          <div className="admin-metric-card" style={{ borderTop: '3px solid #84235E' }}>
            <span className="metric-number">{stats.girls}</span>
            <span className="metric-label">Girls Division</span>
          </div>
        </div>

        {/* Interactive Controls Bar: Search & Filters */}
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
              placeholder="Search participant, college, team, or ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="filters-group">
            {/* Category Filter */}
            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Categories</option>
              <option value="Sports">Sports</option>
              <option value="Literary & Cultural">Literary & Cultural</option>
            </select>

            {/* Division Filter */}
            <select
              className="filter-select"
              value={divisionFilter}
              onChange={(e) => {
                setDivisionFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Divisions</option>
              <option value="Boys">Boys</option>
              <option value="Girls">Girls</option>
              <option value="Cultural / Open">Cultural / Open</option>
            </select>

            {/* Sort Filter */}
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name">Participant Name</option>
              <option value="college">College Name</option>
            </select>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Registration ID</th>
                <th>Participant & Team</th>
                <th>College / Institution</th>
                <th>Contact Details</th>
                <th>Category</th>
                <th>Division</th>
                <th>Event</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="text-body">Loading registrations from database...</div>
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="text-body" style={{ color: 'var(--text-muted)' }}>
                      No registration submissions match your filter criteria.
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => (
                  <tr key={r._id || r.registrationId}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--accent-institution)' }}>
                        {r.registrationId}
                      </span>
                    </td>
                    <td>
                      <div className="participant-cell">
                        <span className="participant-name">{r.participantName}</span>
                        <span className="participant-team">{r.teamName || 'Individual'}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem' }}>{r.college}</span>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <span className="contact-email">{r.email}</span>
                        <span className="contact-phone">{r.phoneNumber}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${r.category === 'Sports' ? 'badge-navy' : 'badge-terracotta'}`}>
                        {r.category}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {r.division}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                        {r.event}
                      </strong>
                    </td>
                    <td>
                      <span className="status-pill status-confirmed">
                        {r.status || 'Confirmed'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="icon-btn"
                          title="View Details"
                          onClick={() => setSelectedRecord(r)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
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
                ))
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

        {/* View Details Modal */}
        {selectedRecord && (
          <div className="modal-backdrop" onClick={() => setSelectedRecord(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-institution)' }}>
                    {selectedRecord.registrationId}
                  </div>
                  <h3 className="heading-subsection">{selectedRecord.participantName}</h3>
                </div>
                <button
                  className="icon-btn"
                  onClick={() => setSelectedRecord(null)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="ticket-row">
                  <span className="ticket-label">College</span>
                  <span className="ticket-val">{selectedRecord.college}</span>
                </div>
                <div className="ticket-row">
                  <span className="ticket-label">Team / Troupe</span>
                  <span className="ticket-val">{selectedRecord.teamName || 'Individual Entry'}</span>
                </div>
                <div className="ticket-row">
                  <span className="ticket-label">Category</span>
                  <span className="ticket-val">{selectedRecord.category}</span>
                </div>
                <div className="ticket-row">
                  <span className="ticket-label">Division</span>
                  <span className="ticket-val">{selectedRecord.division}</span>
                </div>
                <div className="ticket-row">
                  <span className="ticket-label">Event</span>
                  <span className="ticket-val" style={{ color: 'var(--accent-cultural)' }}>{selectedRecord.event}</span>
                </div>
                <div className="ticket-row">
                  <span className="ticket-label">Email</span>
                  <span className="ticket-val">{selectedRecord.email}</span>
                </div>
                <div className="ticket-row">
                  <span className="ticket-label">Phone</span>
                  <span className="ticket-val">{selectedRecord.phoneNumber}</span>
                </div>
                <div className="ticket-row">
                  <span className="ticket-label">Registration Date</span>
                  <span className="ticket-val">{new Date(selectedRecord.registrationDate).toLocaleString()}</span>
                </div>
                <div className="ticket-row">
                  <span className="ticket-label">Verification Status</span>
                  <span className="status-pill status-confirmed">{selectedRecord.status || 'Confirmed'}</span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedRecord(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
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
                  This action will remove the record from MongoDB persistent storage and cannot be undone.
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
