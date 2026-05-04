import { useEffect } from 'react';
import type { DowntimeLog, MachineSummary, Shift } from '../../types.js';
import styles from './DowntimeModal.module.css';

const SHIFT_COLORS: Record<Shift, string> = {
  morning: '#f59e0b',
  afternoon: '#3b82f6',
  night:     '#a855f7',
};

function formatFull(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
    year:    'numeric',
    hour:    '2-digit',
    minute:  '2-digit',
    hour12:  false,
  });
}

function formatDuration(minutes?: number): string {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

interface Props {
  log: DowntimeLog;
  onClose: () => void;
}

export default function DowntimeModal({ log, onClose }: Props): JSX.Element {
  const machine  = typeof log.machine_id === 'string' ? null : (log.machine_id as MachineSummary);
  const machineName = machine?.name ?? '—';
  const shift    = machine?.shift ?? null;
  const isOngoing = !log.ended_at;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Downtime event details"
      >
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.headerLabel}>Downtime Event</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Machine identity */}
        <div className={styles.machineRow}>
          <span className={styles.machineIcon}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </span>
          <span className={styles.machineName}>{machineName}</span>
          {shift && (
            <span
              className={styles.shiftBadge}
              style={{
                color:      SHIFT_COLORS[shift],
                borderColor: SHIFT_COLORS[shift],
                background: `${SHIFT_COLORS[shift]}1a`,
              }}
            >
              {shift}
            </span>
          )}
        </div>

        {/* Reason */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Reason</span>
          <p className={styles.reasonText}>{log.reason || '—'}</p>
        </div>

        {/* Detail grid */}
        <div className={styles.grid}>
          <div className={styles.gridItem}>
            <span className={styles.gridLabel}>Started</span>
            <span className={styles.gridValue}>{formatFull(log.started_at)}</span>
          </div>
          <div className={styles.gridItem}>
            <span className={styles.gridLabel}>Ended</span>
            {isOngoing ? (
              <span className={styles.ongoingBadge}>Ongoing</span>
            ) : (
              <span className={styles.gridValue}>{formatFull(log.ended_at)}</span>
            )}
          </div>
          <div className={styles.gridItem}>
            <span className={styles.gridLabel}>Duration</span>
            <span className={`${styles.gridValue} ${styles.durationValue}`}>
              {formatDuration(log.duration_minutes)}
            </span>
          </div>
          <div className={styles.gridItem}>
            <span className={styles.gridLabel}>Shift</span>
            <span
              className={styles.gridValue}
              style={shift ? { color: SHIFT_COLORS[shift], textTransform: 'capitalize', fontWeight: 600 } : {}}
            >
              {shift ?? '—'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          Logged {formatFull(log.createdAt)}
        </div>
      </div>
    </div>
  );
}
