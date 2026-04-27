import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import styles from './Login.module.css';

export default function Login(): JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    clearError();
    const result = await login({ username, password });
    if (!('error' in result)) navigate('/dashboard', { replace: true });
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.logo}>⬡</span>
          <h1 className={styles.appName}>OpsFloor</h1>
          <p className={styles.tagline}>Factory Floor Dashboard</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">Username</label>
            <input
              id="username"
              className={styles.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="operator"
              autoComplete="username"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className={styles.hint}>
          <p>Demo accounts:</p>
          <div className={styles.accounts}>
            <span><code>operator</code> / <code>operator123</code></span>
            <span><code>supervisor</code> / <code>supervisor123</code></span>
          </div>
        </div>
      </div>
    </div>
  );
}
