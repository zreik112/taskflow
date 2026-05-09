import PropTypes from 'prop-types';
import styles from './TaskFormFields.module.css';

export default function TaskFormFields({ form, fieldErrors, onChange }) {
  return (
    <>
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
          onChange={onChange}
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
          onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
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
          onChange={onChange}
        />
      </div>
    </>
  );
}

TaskFormFields.propTypes = {
  form: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    priority: PropTypes.string.isRequired,
    due_date: PropTypes.string.isRequired,
  }).isRequired,
  fieldErrors: PropTypes.objectOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};
