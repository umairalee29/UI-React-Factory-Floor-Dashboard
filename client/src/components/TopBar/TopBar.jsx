import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import useLiveClock from '../../hooks/useLiveClock.js';
import { disconnectSocket } from '../../services/socket.js';
import styles from './TopBar.module.css';

export default function TopBar() {
  const { user, logout } = useAuth();
  const { time, date, shift } = useLiveClock();
  const navigate = useNavigate();

  function handleLogout() {
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
        <Link to="/dashboard" className={styles.navLink}>Dashboard</Link>
        <Link to="/downtime" className={styles.navLink}>Downtime</Link>
        <Link to="/shifts" className={styles.navLink}>Shifts</Link>
      </nav>

      <div className={styles.right}>
        <div className={styles.shiftBadge}>{shift}</div>
        <div className={styles.clock}>
          <span className={styles.time}>{time}</span>
          <span className={styles.date}>{date}</span>
        </div>
        <div className={styles.user}>
          <span className={styles.username}>{user?.username}</span>
          <span className={`${styles.role} ${styles[user?.role]}`}>{user?.role}</span>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
