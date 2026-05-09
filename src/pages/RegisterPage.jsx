import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AuthPage.module.css';

const INITIAL = {
  email: '', password: '', first_name: '', last_name: '', org_name: '',
};

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState(INITIAL);
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGlobalError(null);
    setFieldErrors({});
    setLoading(true);
    const { error } = await register(form);
    setLoading(false);
    if (error) {
      if (error.status === 422 && error.fields) {
        setFieldErrors(error.fields);
      } else {
        setGlobalError(error.message || 'Registration failed. Please try again.');
      }
    }
  }

  function field(name, label, type = 'text', autoComplete) {
    return (
      <div className={styles.field}>
        <label htmlFor={name} className={styles.label}>{label}</label>
        <input
          id={name} name={name} type={type}
          className={`${styles.input} ${fieldErrors[name] ? styles.inputError : ''}`}
          value={form[name]} onChange={handleChange}
          autoComplete={autoComplete} aria-required="true"
          aria-describedby={fieldErrors[name] ? `${name}-err` : undefined}
        />
        {fieldErrors[name] && (
          <span id={`${name}-err`} className={styles.fieldError} role="alert">
            {fieldErrors[name]}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.logo}>TaskFlow</h1>
        <h2 className={styles.heading}>Create your workspace</h2>

        {globalError && <div className={styles.alert} role="alert">{globalError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.row}>
            {field('first_name', 'First name', 'text', 'given-name')}
            {field('last_name', 'Last name', 'text', 'family-name')}
          </div>
          {field('email', 'Work email', 'email', 'email')}
          {field('password', 'Password (min. 8 characters)', 'password', 'new-password')}
          {field('org_name', 'Organisation name', 'text', 'organization')}

          <button type="submit" className={styles.button} disabled={loading} aria-busy={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
