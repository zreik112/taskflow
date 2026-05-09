// Shared fetch helper for all frontend API calls.
// Uses relative URLs so it works on any domain (dev proxy + production same-origin).

export async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(path, {
      credentials: 'include', // send/receive httpOnly cookies
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    let body;
    try {
      body = await res.json();
    } catch {
      body = {};
    }

    if (!res.ok) {
      return { data: null, error: { status: res.status, ...body } };
    }

    return { data: body, error: null };
  } catch (err) {
    return { data: null, error: { message: err.message || 'Network error' } };
  }
}
