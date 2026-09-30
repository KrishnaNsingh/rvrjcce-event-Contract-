/**
 * REST API Client for RVRJCCE Inter-College Meet (COLORIDO 2K26)
 */

const resolveBaseUrl = () => {
  // 1. Injected at runtime via window.__API_URL__ (for dynamic override)
  if (typeof window !== 'undefined' && window.__API_URL__) {
    return window.__API_URL__.replace(/\/+$/, '');
  }
  // 2. Injected at build time via esbuild define or env
  if (typeof process !== 'undefined' && process.env && process.env.PUBLIC_API_URL) {
    return process.env.PUBLIC_API_URL.replace(/\/+$/, '');
  }
  // 3. Fallback when testing locally on localhost
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
  }
  // 4. Default production Render backend URL
  return 'https://rvrjcce-backend.onrender.com';
};

const BASE_URL = resolveBaseUrl();

function getAuthHeader() {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('rvrjcce_admin_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function safeFetchJson(url, options = {}) {
  const res = await fetch(url, options);
  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // Body is not valid JSON (e.g. HTML error page or empty response)
    }
  }
  if (!res.ok) {
    const errorMsg = (data && (data.error || data.message))
      || `Server request failed with status ${res.status} (${res.statusText || 'Error'})`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function fetchStats() {
  try {
    const data = await safeFetchJson(`${BASE_URL}/api/stats`);
    return data ? data.stats : null;
  } catch (err) {
    console.warn('API fetchStats fallback:', err);
    return null;
  }
}

export async function fetchEvents() {
  try {
    return await safeFetchJson(`${BASE_URL}/api/events`);
  } catch (err) {
    console.warn('API fetchEvents fallback:', err);
    return null;
  }
}

export async function fetchRegistrations(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.division && params.division !== 'all') query.append('division', params.division);
    if (params.event && params.event !== 'all') query.append('event', params.event);
    if (params.attended !== undefined && params.attended !== 'all') query.append('attended', params.attended);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString();
    const url = `${BASE_URL}/api/registrations${queryString ? '?' + queryString : ''}`;
    const data = await safeFetchJson(url);
    return (data && data.registrations) || [];
  } catch (err) {
    console.error('API fetchRegistrations error:', err);
    throw err;
  }
}

export async function fetchRegistrationById(id) {
  try {
    const data = await safeFetchJson(`${BASE_URL}/api/registrations/${id}`);
    return data ? data.registration : null;
  } catch (err) {
    console.error('API fetchRegistrationById error:', err);
    throw err;
  }
}

export async function submitRegistration(payload) {
  try {
    return await safeFetchJson(`${BASE_URL}/api/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error('API submitRegistration error:', err);
    throw err;
  }
}

export async function updateRegistration(id, payload) {
  try {
    return await safeFetchJson(`${BASE_URL}/api/registrations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error('API updateRegistration error:', err);
    throw err;
  }
}

export async function toggleAttendance(id, attended) {
  try {
    return await safeFetchJson(`${BASE_URL}/api/registrations/${id}/attendance`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ attended })
    });
  } catch (err) {
    console.error('API toggleAttendance error:', err);
    throw err;
  }
}

export async function deleteRegistration(id) {
  try {
    return await safeFetchJson(`${BASE_URL}/api/registrations/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader()
      }
    });
  } catch (err) {
    console.error('API deleteRegistration error:', err);
    throw err;
  }
}

export function getCsvExportUrl(params = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'all') query.append('category', params.category);
  if (params.division && params.division !== 'all') query.append('division', params.division);
  if (params.event && params.event !== 'all') query.append('event', params.event);
  if (params.attended !== undefined && params.attended !== 'all') query.append('attended', params.attended);
  if (params.search) query.append('search', params.search);
  const q = query.toString();
  return `${BASE_URL}/api/export-csv${q ? '?' + q : ''}`;
}

export function getPdfDownloadUrl(id) {
  return `${BASE_URL}/api/registrations/${id}/pdf`;
}

export async function adminLogin(username, password) {
  try {
    const result = await safeFetchJson(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    if (result && result.token) {
      localStorage.setItem('rvrjcce_admin_token', result.token);
      localStorage.setItem('rvrjcce_admin_user', JSON.stringify(result.admin));
    }
    return result;
  } catch (err) {
    console.error('API adminLogin error:', err);
    throw err;
  }
}

export async function verifyAdminSession() {
  try {
    const token = localStorage.getItem('rvrjcce_admin_token');
    if (!token) return { authenticated: false };

    const data = await safeFetchJson(`${BASE_URL}/api/admin/verify`, {
      headers: getAuthHeader()
    });
    return { authenticated: true, admin: data ? data.admin : null };
  } catch (err) {
    localStorage.removeItem('rvrjcce_admin_token');
    localStorage.removeItem('rvrjcce_admin_user');
    return { authenticated: false };
  }
}

export function adminLogout() {
  localStorage.removeItem('rvrjcce_admin_token');
  localStorage.removeItem('rvrjcce_admin_user');
}

/* ==========================================================================
   Announcements API
   ========================================================================== */
export async function fetchAnnouncements(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.priority && params.priority !== 'all') query.append('priority', params.priority);
    if (params.pinned !== undefined && params.pinned !== 'all') query.append('pinned', params.pinned);

    const q = query.toString();
    const data = await safeFetchJson(`${BASE_URL}/api/announcements${q ? '?' + q : ''}`);
    return (data && data.announcements) || [];
  } catch (err) {
    console.warn('API fetchAnnouncements error:', err);
    return [];
  }
}

export async function createAnnouncement(payload) {
  try {
    return await safeFetchJson(`${BASE_URL}/api/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error('API createAnnouncement error:', err);
    throw err;
  }
}

export async function updateAnnouncement(id, payload) {
  try {
    return await safeFetchJson(`${BASE_URL}/api/announcements/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error('API updateAnnouncement error:', err);
    throw err;
  }
}

export async function deleteAnnouncement(id) {
  try {
    return await safeFetchJson(`${BASE_URL}/api/announcements/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader()
      }
    });
  } catch (err) {
    console.error('API deleteAnnouncement error:', err);
    throw err;
  }
}

/* ==========================================================================
   Tournament Results API
   ========================================================================== */
export async function fetchResults(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.division && params.division !== 'all') query.append('division', params.division);
    if (params.event && params.event !== 'all') query.append('event', params.event);
    if (params.search) query.append('search', params.search);

    const q = query.toString();
    const data = await safeFetchJson(`${BASE_URL}/api/results${q ? '?' + q : ''}`);
    return (data && data.results) || [];
  } catch (err) {
    console.warn('API fetchResults error:', err);
    return [];
  }
}

export async function createResult(payload) {
  try {
    return await safeFetchJson(`${BASE_URL}/api/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error('API createResult error:', err);
    throw err;
  }
}

export async function updateResult(id, payload) {
  try {
    return await safeFetchJson(`${BASE_URL}/api/results/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error('API updateResult error:', err);
    throw err;
  }
}

export async function deleteResult(id) {
  try {
    return await safeFetchJson(`${BASE_URL}/api/results/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader()
      }
    });
  } catch (err) {
    console.error('API deleteResult error:', err);
    throw err;
  }
}

/* ==========================================================================
   Faculty Advisory Panel API
   ========================================================================== */
export async function fetchFaculty() {
  try {
    const data = await safeFetchJson(`${BASE_URL}/api/results/faculty`);
    return (data && data.faculty) || [];
  } catch (err) {
    console.warn('API fetchFaculty error:', err);
    return [];
  }
}

