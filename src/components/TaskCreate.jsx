import { useState } from 'react';
import PropTypes from 'prop-types';
import * as tasksApi from '../api/tasks';
import TaskFormFields from './TaskFormFields';
import styles from './TaskCreate.module.css';

const INITIAL_FORM = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  due_date: '',
};

export default function TaskCreate({ projectId, onCreated }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFieldErrors({});
    setGlobalError(null);

    if (!form.title.trim()) {
      setFieldErrors({ title: 'Title is required' });
      return;
    }
    if (form.title.length > 200) {
      setFieldErrors({ title: 'Title must be 200 characters or fewer' });
      return;
    }

    setIsSubmitting(true);
    const payload = {
      project_id: projectId,
      title: form.title.trim(),
      description: form.description || undefined,
      status: form.status,
      priority: form.priority,
      due_date: form.due_date || undefined,
    };

    const { data, error } = await tasksApi.create(payload);
    setIsSubmitting(false);

    if (error) {
      if (error.status === 422 && error.fields) {
        setFieldErrors(error.fields);
      } else {
        setGlobalError(error.message || 'Something went wrong. Please try again.');
      }
      return;
    }

    setForm(INITIAL_FORM);
    if (onCreated) onCreated(data);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.heading}>New Task</h2>

      {globalError && (
        <div className={styles.globalError} role="alert">
          <span>{globalError}</span>
          <button
            type="button"
            className={styles.dismissButton}
            onClick={() => setGlobalError(null)}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <TaskFormFields form={form} fieldErrors={fieldErrors} onChange={handleChange} />

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? 'Creating…' : 'Create Task'}
      </button>
    </form>
  );
}

TaskCreate.propTypes = {
  projectId: PropTypes.string.isRequired,
  onCreated: PropTypes.func,
};
