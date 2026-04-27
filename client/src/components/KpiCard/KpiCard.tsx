import styles from './KpiCard.module.css';

interface Props {
  title: string;
  value: string | number;
  unit?: string;
  accent?: 'running' | 'idle' | 'fault' | 'accent';
}

export default function KpiCard({ title, value, unit, accent }: Props): JSX.Element {
  return (
    <div className={`${styles.card} ${accent ? styles[accent] : ''}`}>
      <p className={styles.title}>{title}</p>
      <p className={styles.value}>
        <span className={styles.number}>{value}</span>
        {unit && <span className={styles.unit}>{unit}</span>}
      </p>
    </div>
  );
}
