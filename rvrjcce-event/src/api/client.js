/**
 * REST API Client for RVRJCCE Inter-College Meet (COLORIDO 2K26)
 */

const BASE_URL = typeof window !== 'undefined' && window.location.origin.includes('http')
  ? window.location.origin
  : '';

function getAuthHeader() {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('rvrjcce_admin_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchStats() {
  try {
    const res = await fetch(`${BASE_URL}/api/stats`);
    if (!res.ok) throw new Error('Failed to fetch statistics');
    const data = await res.json();
    return data.stats;
  } catch (err) {
    console.warn('API fetchStats fallback:', err);
    return null;
  }
}

export async function fetchEvents() {
  try {
    const res = await fetch(`${BASE_URL}/api/events`);
    if (!res.ok) throw new Error('Failed to fetch event definitions');
    return await res.json();
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
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch registrations');
    const data = await res.json();
    return data.registrations || [];
  } catch (err) {
    console.error('API fetchRegistrations error:', err);
    throw err;
  }
}

export async function fetchRegistrationById(id) {
  try {
    const res = await fetch(`${BASE_URL}/api/registrations/${id}`);
    if (!res.ok) throw new Error('Failed to fetch registration details');
    const data = await res.json();
    return data.registration;
  } catch (err) {
    console.error('API fetchRegistrationById error:', err);
    throw err;
  }
}

export async function submitRegistration(payload) {
  try {
    const res = await fetch(`${BASE_URL}/api/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Failed to submit registration');
    }
    return result;
  } catch (err) {
    console.error('API submitRegistration error:', err);
    throw err;
  }
}

export async function updateRegistration(id, payload) {
  try {
    const res = await fetch(`${BASE_URL}/api/registrations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Failed to update registration');
    }
    return result;
  } catch (err) {
    console.error('API updateRegistration error:', err);
    throw err;
  }
}

export async function toggleAttendance(id, attended) {
  try {
    const res = await fetch(`${BASE_URL}/api/registrations/${id}/attendance`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ attended })
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Failed to update attendance');
    }
    return result;
  } catch (err) {
    console.error('API toggleAttendance error:', err);
    throw err;
  }
}

export async function deleteRegistration(id) {
  try {
    const res = await fetch(`${BASE_URL}/api/registrations/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader()
      }
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Failed to delete registration');
    }
    return result;
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
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Invalid credentials');
    }
    if (result.token) {
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

    const res = await fetch(`${BASE_URL}/api/admin/verify`, {
      headers: getAuthHeader()
    });
    if (!res.ok) {
      localStorage.removeItem('rvrjcce_admin_token');
      localStorage.removeItem('rvrjcce_admin_user');
      return { authenticated: false };
    }
    const data = await res.json();
    return { authenticated: true, admin: data.admin };
  } catch (err) {
    return { authenticated: false };
  }
}

export function adminLogout() {
  localStorage.removeItem('rvrjcce_admin_token');
  localStorage.removeItem('rvrjcce_admin_user');
}
