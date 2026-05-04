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
                </tr>
              </thead>
              <tbody>
                {pagedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.empty}>No records found</td>
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
    </div>
  );
}
