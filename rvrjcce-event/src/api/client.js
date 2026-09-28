/**
 * REST API Client for RVRJCCE Inter-College Meet
 */

const BASE_URL = window.location.origin.includes('http') ? window.location.origin : '';

export async function fetchStats() {
  try {
    const res = await fetch(`${BASE_URL}/api/stats`);
    if (!res.ok) throw new Error('Failed to fetch statistics');
    const data = await res.json();
    return data.stats;
  } catch (err) {
    console.warn('API fetchStats fallback to local compute:', err);
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

export async function deleteRegistration(id) {
  try {
    const res = await fetch(`${BASE_URL}/api/registrations/${id}`, {
      method: 'DELETE'
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
  if (params.search) query.append('search', params.search);
  const q = query.toString();
  return `${BASE_URL}/api/export-csv${q ? '?' + q : ''}`;
}
