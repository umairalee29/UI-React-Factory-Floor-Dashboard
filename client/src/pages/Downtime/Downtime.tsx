import { useEffect, useState, ChangeEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TopBar from '../../components/TopBar/TopBar.js';
import { fetchDowntime } from '../../store/slices/downtimeSlice.js';
import { fetchMachines } from '../../store/slices/machinesSlice.js';
import type { RootState, AppDispatch } from '../../store/index.js';
import type { DowntimeLog, MachineSummary } from '../../types.js';
import styles from './Downtime.module.css';

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
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

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

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const pagedLogs = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

        <div className={styles.searchRow}>
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search by machine, reason, date, shift…"
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')} aria-label="Clear search">✕</button>
            )}
          </div>
        </div>

        <div className={styles.filters}>
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
                  <th>Machine</th>
                  <th>Reason</th>
                  <th>Started</th>
                  <th>Ended</th>
                  <th>Duration</th>
                  <th>Shift</th>
                </tr>
              </thead>
              <tbody>
                {pagedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.empty}>No records found</td>
                  </tr>
                ) : (
                  pagedLogs.map((log) => (
                    <tr key={log._id}>
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

        {!loading && filteredLogs.length > PAGE_SIZE && (
          <div className={styles.pagination}>
            <span className={styles.pageInfo}>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredLogs.length)} of {filteredLogs.length}
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
    </div>
  );
}
