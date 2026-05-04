import { useEffect, useState, ChangeEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TopBar from '../../components/TopBar/TopBar.js';
import { fetchDowntime } from '../../store/slices/downtimeSlice.js';
import { fetchMachines } from '../../store/slices/machinesSlice.js';
import type { RootState, AppDispatch } from '../../store/index.js';
import type { DowntimeLog, MachineSummary } from '../../types.js';
import DowntimeModal from '../../components/DowntimeModal/DowntimeModal.js';
import styles from './Downtime.module.css';

type SortCol = 'machine' | 'reason' | 'started' | 'ended' | 'duration' | 'shift';
type SortDir = 'asc' | 'desc';

function SortIcon({ col, sortCol, sortDir }: { col: SortCol; sortCol: SortCol | null; sortDir: SortDir }): JSX.Element {
  const upActive   = sortCol === col && sortDir === 'asc';
  const downActive = sortCol === col && sortDir === 'desc';
  return (
    <svg className={styles.sortIcon} viewBox="0 0 8 13" fill="none">
      <path d="M4 1L1 5.5h6L4 1z"  className={upActive   ? styles.arrowActive : styles.arrowIdle} />
      <path d="M4 12L1 7.5h6L4 12z" className={downActive ? styles.arrowActive : styles.arrowIdle} />
    </svg>
  );
}

function formatDuration(minutes?: number): string {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function getMachineName(log: DowntimeLog): string {
  if (typeof log.machine_id === 'string') return '—';
  return (log.machine_id as MachineSummary).name || '—';
}

function getMachineShift(log: DowntimeLog): string {
  if (typeof log.machine_id === 'string') return '—';
  return (log.machine_id as MachineSummary).shift || '—';
}

/* ── Edit Modal ─────────────────────────────────────────────────────────── */

function EditModal({ log, onClose }: { log: DowntimeLog; onClose: () => void }): JSX.Element {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose]);

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.actionModal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.actionModalHeader}>
          <span className={styles.actionModalTitle}>Edit Downtime Entry</span>
          <button className={styles.actionModalClose} onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className={styles.editForm}>
          <div className={styles.editRow}>
            <div className={styles.editField}>
              <label className={styles.editLabel}>Machine</label>
              <input className={styles.editInput} type="text" defaultValue={getMachineName(log)} readOnly />
            </div>
            <div className={styles.editField}>
              <label className={styles.editLabel}>Shift</label>
              <input className={styles.editInput} type="text" defaultValue={getMachineShift(log)} readOnly style={{ textTransform: 'capitalize' }} />
            </div>
          </div>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Reason</label>
            <textarea className={styles.editTextarea} defaultValue={log.reason || ''} readOnly rows={3} />
          </div>
          <div className={styles.editRow}>
            <div className={styles.editField}>
              <label className={styles.editLabel}>Started At</label>
              <input className={styles.editInput} type="text" defaultValue={formatDate(log.started_at)} readOnly />
            </div>
            <div className={styles.editField}>
              <label className={styles.editLabel}>Ended At</label>
              <input className={styles.editInput} type="text" defaultValue={formatDate(log.ended_at)} readOnly />
            </div>
          </div>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Duration</label>
            <input className={styles.editInput} type="text" defaultValue={formatDuration(log.duration_minutes)} readOnly style={{ width: '50%' }} />
          </div>
        </div>

        <div className={styles.comingSoonBanner}>
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" style={{ flexShrink: 0, marginTop: 1 }}>
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <p>Backend integration coming soon. Full editing will be available in a future update.</p>
        </div>

        <div className={styles.actionModalFooter}>
          <button className={styles.btnCancel} onClick={onClose}>Cancel</button>
          <button className={styles.btnSave} disabled>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

/* ── Delete Modal ───────────────────────────────────────────────────────── */

function DeleteModal({ log, onClose }: { log: DowntimeLog; onClose: () => void }): JSX.Element {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose]);

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.actionModal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {confirmed ? (
          <>
            <div className={styles.actionModalHeader}>
              <span className={styles.actionModalTitle}>Feature Under Development</span>
            </div>
            <div className={styles.devNotice}>
              <div className={styles.devNoticeIcon}>
                <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
                  <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" stroke="var(--accent)" strokeWidth="1.5" />
                  <path d="M12 7v5" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="16" r="1" fill="var(--accent)" />
                </svg>
              </div>
              <p className={styles.devNoticeText}>
                This action is not yet connected to the backend.
                <br />No data was deleted.
              </p>
              <p className={styles.devNoticeSubtext}>
                Delete functionality will be available once backend integration is complete.
              </p>
            </div>
            <div className={styles.actionModalFooter} style={{ justifyContent: 'flex-end' }}>
              <button className={styles.btnCancel} onClick={onClose}>Close</button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.actionModalHeader}>
              <span className={styles.actionModalTitle}>Delete Entry</span>
              <button className={styles.actionModalClose} onClick={onClose} aria-label="Close">
                <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                  <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <p className={styles.deleteQuestion}>
              Are you sure you want to delete this downtime record? This action cannot be undone.
            </p>

            <div className={styles.deleteContext}>
              <span className={styles.deleteContextMachine}>{getMachineName(log)}</span>
              <span className={styles.deleteContextReason}>{log.reason}</span>
              <span className={styles.deleteContextMeta}>
                {formatDate(log.started_at)} · {formatDuration(log.duration_minutes)}
              </span>
            </div>

            <div className={styles.actionModalFooter}>
              <button className={styles.btnCancel} onClick={onClose}>Cancel</button>
              <button className={styles.btnDelete} onClick={() => setConfirmed(true)}>Delete</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function Downtime(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const { logs, loading } = useSelector((s: RootState) => s.downtime);
  const machines = useSelector((s: RootState) => s.machines.list);

  const [machineFilter, setMachineFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<SortCol | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<DowntimeLog | null>(null);
  const [editLog, setEditLog]     = useState<DowntimeLog | null>(null);
  const [deleteLog, setDeleteLog] = useState<DowntimeLog | null>(null);
  const PAGE_SIZE = 10;

  function handleSort(col: SortCol): void {
    if (sortCol === col) {
      if (sortDir === 'asc') { setSortDir('desc'); }
      else { setSortCol(null); setSortDir('asc'); }
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
    setPage(1);
  }

  useEffect(() => {
    if (!machines.length) dispatch(fetchMachines());
  }, [dispatch, machines.length]);

  useEffect(() => {
    const filters: { machine_id?: string; date?: string } = {};
    if (machineFilter) filters.machine_id = machineFilter;
    if (dateFilter) filters.date = dateFilter;
    dispatch(fetchDowntime(filters));
    setPage(1);
  }, [dispatch, machineFilter, dateFilter]);

  useEffect(() => { setPage(1); }, [search]);

  const filteredLogs = search.trim()
    ? logs.filter((log) => {
        const q = search.toLowerCase();
        return (
          getMachineName(log).toLowerCase().includes(q) ||
          (log.reason ?? '').toLowerCase().includes(q) ||
          formatDate(log.started_at).toLowerCase().includes(q) ||
          formatDate(log.ended_at).toLowerCase().includes(q) ||
          formatDuration(log.duration_minutes).toLowerCase().includes(q) ||
          getMachineShift(log).toLowerCase().includes(q)
        );
      })
    : logs;

  const sortedLogs = sortCol
    ? [...filteredLogs].sort((a, b) => {
        let va: string | number = '';
        let vb: string | number = '';
        switch (sortCol) {
          case 'machine':  va = getMachineName(a);  vb = getMachineName(b);  break;
          case 'reason':   va = a.reason ?? '';      vb = b.reason ?? '';     break;
          case 'started':  va = a.started_at ? new Date(a.started_at).getTime() : 0;
                           vb = b.started_at ? new Date(b.started_at).getTime() : 0; break;
          case 'ended':    va = a.ended_at ? new Date(a.ended_at).getTime() : 0;
                           vb = b.ended_at ? new Date(b.ended_at).getTime() : 0; break;
          case 'duration': va = a.duration_minutes ?? 0; vb = b.duration_minutes ?? 0; break;
          case 'shift':    va = getMachineShift(a); vb = getMachineShift(b); break;
        }
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ?  1 : -1;
        return 0;
      })
    : filteredLogs;

  const totalPages = Math.max(1, Math.ceil(sortedLogs.length / PAGE_SIZE));
  const pagedLogs = sortedLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function getPageNumbers(): number[] {
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      range.push(i);
    }
    return range;
  }

  return (
    <div className={styles.layout}>
      <TopBar />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>Downtime Log</h2>
          <span className={styles.count}>
            {search.trim() && filteredLogs.length !== logs.length
              ? `${filteredLogs.length} of ${logs.length} records`
              : `${logs.length} records`}
          </span>
        </div>

        <div className={styles.filters}>
          <div className={`${styles.filterField} ${styles.searchField}`}>
            <label className={styles.filterLabel}>Search</label>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="none">
                <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              <input
                className={styles.searchInput}
                type="text"
                placeholder="Machine, reason, date, shift…"
                value={search}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              />
              {search && (
                <button className={styles.searchClear} onClick={() => setSearch('')} aria-label="Clear search">✕</button>
              )}
            </div>
          </div>

          <div className={styles.filterField}>
            <label className={styles.filterLabel}>Machine</label>
            <select
              className={styles.select}
              value={machineFilter}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setMachineFilter(e.target.value)}
            >
              <option value="">All machines</option>
              {machines.map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterField}>
            <label className={styles.filterLabel}>Date</label>
            <input
              className={styles.input}
              type="date"
              value={dateFilter}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDateFilter(e.target.value)}
            />
          </div>

          {(machineFilter || dateFilter) && (
            <button
              className={styles.clearBtn}
              onClick={() => { setMachineFilter(''); setDateFilter(''); setSearch(''); }}
            >
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <p className={styles.loading}>Loading…</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {(
                    [
                      { col: 'machine',  label: 'Machine'  },
                      { col: 'reason',   label: 'Reason'   },
                      { col: 'started',  label: 'Started'  },
                      { col: 'ended',    label: 'Ended'    },
                      { col: 'duration', label: 'Duration' },
                      { col: 'shift',    label: 'Shift'    },
                    ] as { col: SortCol; label: string }[]
                  ).map(({ col, label }) => (
                    <th
                      key={col}
                      className={`${styles.thSortable}${sortCol === col ? ` ${styles.thActive}` : ''}`}
                      onClick={() => handleSort(col)}
                    >
                      <span className={styles.thContent}>
                        {label}
                        <SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />
                      </span>
                    </th>
                  ))}
                  <th className={styles.thActions}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.empty}>No records found</td>
                  </tr>
                ) : (
                  pagedLogs.map((log) => (
                    <tr key={log._id} className={styles.clickableRow} onClick={() => setSelectedLog(log)}>
                      <td className={styles.machineName}>{getMachineName(log)}</td>
                      <td>{log.reason}</td>
                      <td className={styles.mono}>{formatDate(log.started_at)}</td>
                      <td className={styles.mono}>{formatDate(log.ended_at)}</td>
                      <td className={styles.mono}>{formatDuration(log.duration_minutes)}</td>
                      <td className={styles.shift}>{getMachineShift(log)}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className={styles.actionBtns}>
                          <button
                            className={styles.editBtn}
                            onClick={() => setEditLog(log)}
                            aria-label="Edit entry"
                            title="Edit"
                          >
                            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                              <path d="M11.5 2.5a1.414 1.414 0 012 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => setDeleteLog(log)}
                            aria-label="Delete entry"
                            title="Delete"
                          >
                            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                              <path d="M2 4h12M6 4V2h4v2M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && sortedLogs.length > PAGE_SIZE && (
          <div className={styles.pagination}>
            <span className={styles.pageInfo}>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sortedLogs.length)} of {sortedLogs.length}
            </span>
            <div className={styles.pageControls}>
              <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
              >
                ‹
              </button>
              {page > 3 && (
                <>
                  <button className={styles.pageBtn} onClick={() => setPage(1)}>1</button>
                  {page > 4 && <span className={styles.ellipsis}>…</span>}
                </>
              )}
              {getPageNumbers().map((n) => (
                <button
                  key={n}
                  className={`${styles.pageBtn}${n === page ? ` ${styles.pageBtnActive}` : ''}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              {page < totalPages - 2 && (
                <>
                  {page < totalPages - 3 && <span className={styles.ellipsis}>…</span>}
                  <button className={styles.pageBtn} onClick={() => setPage(totalPages)}>{totalPages}</button>
                </>
              )}
              <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </main>

      {selectedLog && (
        <DowntimeModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
      {editLog && (
        <EditModal log={editLog} onClose={() => setEditLog(null)} />
      )}
      {deleteLog && (
        <DeleteModal log={deleteLog} onClose={() => setDeleteLog(null)} />
      )}
    </div>
  );
}
