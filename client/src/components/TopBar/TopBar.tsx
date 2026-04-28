import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import useLiveClock from '../../hooks/useLiveClock.js';
import { disconnectSocket } from '../../services/socket.js';
import styles from './TopBar.module.css';

export default function TopBar(): JSX.Element {
  const { user, logout } = useAuth();
  const { time, date, shift } = useLiveClock();
  const navigate = useNavigate();

  function handleLogout(): void {
    disconnectSocket();
    logout();
    navigate('/login');
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>
        <span className={styles.logo}>⬡</span>
        <span className={styles.name}>OpsFloor</span>
      </div>

      <nav className={styles.nav}>
        <NavLink to="/dashboard" className={({ isActive }) => `${styles.navLink}${isActive ? ` ${styles.navLinkActive}` : ''}`}>Dashboard</NavLink>
        <NavLink to="/downtime" className={({ isActive }) => `${styles.navLink}${isActive ? ` ${styles.navLinkActive}` : ''}`}>Downtime</NavLink>
        <NavLink to="/shifts" className={({ isActive }) => `${styles.navLink}${isActive ? ` ${styles.navLinkActive}` : ''}`}>Shifts</NavLink>
      </nav>

      <div className={styles.right}>
        <div className={styles.shiftBadge}>{shift}</div>
        <div className={styles.clock}>
          <span className={styles.time}>{time}</span>
          <span className={styles.date}>{date}</span>
        </div>
        <div className={styles.user}>
          <span className={styles.username}>{user?.username}</span>
          <span className={`${styles.role} ${user?.role ? styles[user.role] : ''}`}>
            {user?.role}
          </span>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
