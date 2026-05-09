import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as projectsApi from '../api/projects';
import styles from './ProjectSidebar.module.css';

export default function ProjectSidebar({ selectedId, onSelect }) {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    projectsApi.list().then(({ data, error }) => {
      if (error) {
        setStatus('error');
      } else {
        setProjects(data || []);
        setStatus('ready');
      }
    });
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    const { data, error } = await projectsApi.create({ name: newName.trim() });
    setCreating(false);
    if (!error && data) {
      setProjects((prev) => [data, ...prev]);
      setNewName('');
      setShowForm(false);
      onSelect(data);
    }
  }

  return (
    <nav className={styles.sidebar} aria-label="Projects">
      <div className={styles.header}>
        <span className={styles.title}>Projects</span>
        <button
          className={styles.addBtn}
          onClick={() => setShowForm((v) => !v)}
          aria-label="New project"
          type="button"
        >
          {showForm ? '✕' : '＋'}
        </button>
      </div>

      {showForm && (
        <form className={styles.newForm} onSubmit={handleCreate}>
          <input
            className={styles.newInput}
            type="text"
            placeholder="Project name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
            aria-label="New project name"
          />
          <button className={styles.createBtn} type="submit" disabled={creating}>
            {creating ? '…' : 'Create'}
          </button>
        </form>
      )}

      {status === 'loading' && <p className={styles.hint}>Loading…</p>}
      {status === 'error' && <p className={styles.error}>Failed to load projects.</p>}
      {status === 'ready' && projects.length === 0 && !showForm && (
        <p className={styles.hint}>No projects yet. Create one above.</p>
      )}

      <ul className={styles.list}>
        {projects.map((p) => (
          <li key={p.id}>
            <button
              className={`${styles.item} ${p.id === selectedId ? styles.active : ''}`}
              onClick={() => onSelect(p)}
              type="button"
            >
              {p.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

ProjectSidebar.propTypes = {
  selectedId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};
