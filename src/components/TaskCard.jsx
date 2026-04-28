import PropTypes from 'prop-types';
import styles from './TaskCard.module.css';

const STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

function formatDate(iso) {
  if (!iso) return 'No due date';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function TaskCard({ task, onClick }) {
  const handleKeyDown = (e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(task);
    }
  };

  return (
    <article
      className={styles.card}
      onClick={onClick ? () => onClick(task) : undefined}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={`Task: ${task.title}`}
    >
      <h3 className={styles.title}>{task.title}</h3>

      <div className={styles.badges}>
        <span
          className={`${styles.badge} ${styles[`status_${task.status}`]}`}
          aria-label={`Status: ${STATUS_LABELS[task.status] || task.status}`}
        >
          {STATUS_LABELS[task.status] || task.status}
        </span>
        <span
          className={`${styles.badge} ${styles[`priority_${task.priority}`]}`}
          aria-label={`Priority: ${PRIORITY_LABELS[task.priority] || task.priority}`}
        >
          {PRIORITY_LABELS[task.priority] || task.priority}
        </span>
      </div>

      <dl className={styles.meta}>
        <div className={styles.metaRow}>
          <dt className={styles.metaLabel}>Assigned to</dt>
          <dd className={styles.metaValue}>
            {task.assigned_to ? task.assigned_to : 'Unassigned'}
          </dd>
        </div>
        <div className={styles.metaRow}>
          <dt className={styles.metaLabel}>Due</dt>
          <dd className={styles.metaValue}>{formatDate(task.due_date)}</dd>
        </div>
      </dl>
    </article>
  );
}

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['todo', 'in_progress', 'done']).isRequired,
    priority: PropTypes.oneOf(['low', 'medium', 'high']).isRequired,
    assigned_to: PropTypes.string,
    due_date: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
};
