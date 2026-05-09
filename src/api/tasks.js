import { apiFetch } from './client';

export const list = ({ projectId }) =>
  apiFetch(`/api/tasks?project_id=${encodeURIComponent(projectId)}`);

export const create = (payload) =>
  apiFetch('/api/tasks', { method: 'POST', body: JSON.stringify(payload) });

export const getById = (id) =>
  apiFetch(`/api/tasks/${encodeURIComponent(id)}`);
