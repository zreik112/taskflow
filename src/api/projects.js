import { apiFetch } from './client';

export const list = () =>
  apiFetch('/api/projects');

export const create = (payload) =>
  apiFetch('/api/projects', { method: 'POST', body: JSON.stringify(payload) });
