import StatusBadge from '../StatusBadge/StatusBadge.jsx';
import styles from './MachineCard.module.css';

export default function MachineCard({ machine }) {
  const { name, status, oee_score, output_count, target_count, shift } = machine;
  const progress = target_count > 0 ? Math.min((output_count / target_count) * 100, 100) : 0;

  return (
    <div className={`${styles.card} ${status === 'fault' ? styles.fault : ''}`}>
      <div className={styles.header}>
        <span className={styles.name}>{name}</span>
        <StatusBadge status={status} />
      </div>

      <div className={styles.oeeRow}>
        <span className={styles.oeeLabel}>OEE</span>
        <span className={styles.oeeValue}>{oee_score?.toFixed(1)}<span className={styles.oeePct}>%</span></span>
      </div>

      <div className={styles.oeeGauge}>
        <div className={styles.gaugeTrack}>
          <div
            className={styles.gaugeFill}
            style={{ width: `${oee_score || 0}%` }}
          />
        </div>
      </div>

      <div className={styles.outputSection}>
        <div className={styles.outputLabels}>
          <span className={styles.outputLabel}>Output / Target</span>
          <span className={styles.outputValues}>
            <span className={styles.outputCurrent}>{output_count}</span>
            <span className={styles.outputSep}>/</span>
            <span className={styles.outputTarget}>{target_count}</span>
          </span>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.shift}>{shift} shift</span>
      </div>
    </div>
  );
}
