import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import * as tasksApi from '../api/tasks';
import TaskCard from './TaskCard';
import styles from './TaskList.module.css';

export default function TaskList({ projectId }) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  const fetchTasks = useCallback(async () => {
    setState({ status: 'loading', data: null, error: null });
    const { data, error } = await tasksApi.list({ projectId });
    if (error) {
      setState({ status: 'error', data: null, error });
    } else {
      setState({ status: 'success', data, error: null });
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  if (state.status === 'loading') {
    return (
      <section className={styles.container} aria-label="Loading tasks">
        <ul className={styles.skeletonList} aria-hidden="true">
          {[1, 2, 3].map((n) => (
            <li key={n} className={styles.skeletonCard} />
          ))}
        </ul>
        <p className={styles.srOnly}>Loading tasks…</p>
      </section>
    );
  }

  if (state.status === 'error') {
    return (
      <section className={styles.container} role="alert" aria-live="assertive">
        <p className={styles.errorMessage}>
          {state.error?.message || 'Failed to load tasks.'}
        </p>
        <button className={styles.retryButton} onClick={fetchTasks} type="button">
          Retry
        </button>
      </section>
    );
  }

  if (state.data.length === 0) {
    return (
      <section className={styles.container}>
        <p className={styles.emptyMessage}>No tasks yet.</p>
      </section>
    );
  }

  return (
    <section className={styles.container} aria-label="Task list">
      <ul className={styles.list}>
        {state.data.map((task) => (
          <li key={task.id}>
            <TaskCard task={task} />
          </li>
        ))}
      </ul>
    </section>
  );
}

TaskList.propTypes = {
  projectId: PropTypes.string.isRequired,
};
