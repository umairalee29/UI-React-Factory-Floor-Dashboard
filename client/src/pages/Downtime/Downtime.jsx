import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TopBar from '../../components/TopBar/TopBar.jsx';
import { fetchDowntime } from '../../store/slices/downtimeSlice.js';
import { fetchMachines } from '../../store/slices/machinesSlice.js';
import styles from './Downtime.module.css';

function formatDuration(minutes) {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function Downtime() {
  const dispatch = useDispatch();
  const { logs, loading } = useSelector((s) => s.downtime);
  const machines = useSelector((s) => s.machines.list);

  const [machineFilter, setMachineFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    if (!machines.length) dispatch(fetchMachines());
  }, [dispatch, machines.length]);

  useEffect(() => {
    const filters = {};
    if (machineFilter) filters.machine_id = machineFilter;
    if (dateFilter) filters.date = dateFilter;
    dispatch(fetchDowntime(filters));
  }, [dispatch, machineFilter, dateFilter]);

  return (
    <div className={styles.layout}>
      <TopBar />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>Downtime Log</h2>
          <span className={styles.count}>{logs.length} records</span>
        </div>

        <div className={styles.filters}>
          <div className={styles.filterField}>
            <label className={styles.filterLabel}>Machine</label>
            <select
              className={styles.select}
              value={machineFilter}
              onChange={(e) => setMachineFilter(e.target.value)}
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
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          {(machineFilter || dateFilter) && (
            <button
              className={styles.clearBtn}
              onClick={() => { setMachineFilter(''); setDateFilter(''); }}
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
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.empty}>No records found</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id}>
                      <td className={styles.machineName}>
                        {log.machine_id?.name || '—'}
                      </td>
                      <td>{log.reason}</td>
                      <td className={styles.mono}>{formatDate(log.started_at)}</td>
                      <td className={styles.mono}>{formatDate(log.ended_at)}</td>
                      <td className={styles.mono}>{formatDuration(log.duration_minutes)}</td>
                      <td className={styles.shift}>{log.machine_id?.shift || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
