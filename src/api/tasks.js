const BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  (typeof process !== 'undefined' && process.env?.API_BASE_URL) ||
  'http://localhost:4000';

function getDevUserId() {
  if (typeof window !== 'undefined' && window.__DEV_USER_ID__) {
    return window.__DEV_USER_ID__;
  }
  return null;
}

async function apiFetch(path, options = {}) {
  const devUserId = getDevUserId();
  const headers = {
    'Content-Type': 'application/json',
    ...(devUserId ? { 'X-User-Id': devUserId } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers,
    });

    if (!res.ok) {
      let errorBody;
      try {
        errorBody = await res.json();
      } catch {
        errorBody = { message: res.statusText };
      }
      return { data: null, error: { status: res.status, ...errorBody } };
    }

    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: err.message || 'Network error' } };
  }
}

export function list({ projectId }) {
  return apiFetch(`/api/tasks?project_id=${encodeURIComponent(projectId)}`);
}

export function create(payload) {
  return apiFetch('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getById(id) {
  return apiFetch(`/api/tasks/${encodeURIComponent(id)}`);
}
