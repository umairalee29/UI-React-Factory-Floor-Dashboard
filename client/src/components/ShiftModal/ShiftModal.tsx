import { useEffect } from 'react';
import type { ShiftSummary, Shift } from '../../types.js';
import styles from './ShiftModal.module.css';

const SHIFT_COLORS: Record<Shift, string> = {
  morning: '#f59e0b',
  afternoon: '#3b82f6',
  night:     '#a855f7',
};

const SHIFT_ICONS: Record<Shift, JSX.Element> = {
  morning: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
    </svg>
  ),
  afternoon: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path fillRule="evenodd" d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 14a6 6 0 110-12 6 6 0 010 12z" clipRule="evenodd" />
      <path d="M10 6a1 1 0 011 1v3.586l2.707 2.707a1 1 0 01-1.414 1.414l-3-3A1 1 0 019 11V7a1 1 0 011-1z" />
    </svg>
  ),
  night: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
  ),
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
    year:    'numeric',
  });
}

interface Props {
  summary: ShiftSummary;
  onClose: () => void;
}

export default function ShiftModal({ summary, onClose }: Props): JSX.Element {
  const color = SHIFT_COLORS[summary.shift];

  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Shift summary details"
        style={{ borderTop: `3px solid ${color}` }}
      >
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.headerLabel}>Shift Summary</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Shift identity */}
        <div className={styles.shiftRow}>
          <span className={styles.shiftIcon} style={{ color, background: `${color}18`, borderColor: `${color}40` }}>
            {SHIFT_ICONS[summary.shift]}
          </span>
          <div className={styles.shiftMeta}>
            <span className={styles.shiftName} style={{ color }}>{summary.shift} shift</span>
            <span className={styles.shiftDate}>{formatDate(summary.date)}</span>
          </div>
        </div>

        {/* OEE highlight */}
        <div className={styles.oeeBlock} style={{ borderColor: `${color}30`, background: `${color}0d` }}>
          <span className={styles.oeeLabel}>Overall Equipment Effectiveness</span>
          <div className={styles.oeeValueRow}>
            <span className={styles.oeeValue} style={{ color }}>{summary.total_oee?.toFixed(1)}</span>
            <span className={styles.oeeUnit} style={{ color }}>%</span>
          </div>
          <div className={styles.oeeTrack}>
            <div
              className={styles.oeeFill}
              style={{ width: `${Math.min(summary.total_oee ?? 0, 100)}%`, background: color }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className={styles.grid}>
          <div className={styles.gridItem}>
            <span className={styles.gridLabel}>Machines</span>
            <span className={styles.gridValue}>{summary.machines_count}</span>
          </div>
          <div className={styles.gridItem}>
            <span className={styles.gridLabel}>Faults</span>
            <span className={styles.gridValue} style={summary.faults_count > 0 ? { color: 'var(--status-fault)', fontWeight: 700 } : {}}>
              {summary.faults_count}
            </span>
          </div>
          <div className={styles.gridItem}>
            <span className={styles.gridLabel}>Fault Rate</span>
            <span className={styles.gridValue}>
              {summary.machines_count > 0
                ? `${((summary.faults_count / summary.machines_count) * 100).toFixed(0)}%`
                : '—'}
            </span>
          </div>
          <div className={styles.gridItem}>
            <span className={styles.gridLabel}>Status</span>
            <span className={styles.gridValue} style={{
              color: summary.total_oee >= 85 ? 'var(--status-running)' : summary.total_oee >= 70 ? '#f59e0b' : 'var(--status-fault)',
              fontWeight: 600,
            }}>
              {summary.total_oee >= 85 ? 'Good' : summary.total_oee >= 70 ? 'Average' : 'Poor'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          Record ID: {summary._id}
        </div>
      </div>
    </div>
  );
}
