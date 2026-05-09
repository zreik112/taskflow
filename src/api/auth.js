import { apiFetch } from './client';

export const register = (payload) =>
  apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) });

export const login = (payload) =>
  apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) });

export const logout = () =>
  apiFetch('/api/auth/logout', { method: 'POST' });

export const me = () =>
  apiFetch('/api/auth/me');
