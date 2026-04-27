import type { Status } from '../../types.js';
import styles from './StatusBadge.module.css';

interface Props {
  status: Status;
}

export default function StatusBadge({ status }: Props): JSX.Element {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      <span className={styles.dot} />
      {status}
    </span>
  );
}
