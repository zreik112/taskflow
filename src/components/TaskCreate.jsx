import { useState } from 'react';
import PropTypes from 'prop-types';
import * as tasksApi from '../api/tasks';
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

    // Client-side validation
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

      <div className={styles.field}>
        <label htmlFor="title" className={styles.label}>
          Title <span aria-hidden="true">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          className={`${styles.input} ${fieldErrors.title ? styles.inputError : ''}`}
          value={form.title}
          onChange={handleChange}
          maxLength={200}
          aria-required="true"
          aria-describedby={fieldErrors.title ? 'title-error' : undefined}
        />
        {fieldErrors.title && (
          <span id="title-error" className={styles.fieldError} role="alert">
            {fieldErrors.title}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="description" className={styles.label}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className={styles.textarea}
          value={form.description}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="status" className={styles.label}>
            Status
          </label>
          <select
            id="status"
            name="status"
            className={styles.select}
            value={form.status}
            onChange={handleChange}
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="priority" className={styles.label}>
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            className={styles.select}
            value={form.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="due_date" className={styles.label}>
          Due Date
        </label>
        <input
          id="due_date"
          name="due_date"
          type="date"
          className={styles.input}
          value={form.due_date}
          onChange={handleChange}
        />
      </div>

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
