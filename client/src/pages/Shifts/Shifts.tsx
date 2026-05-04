import { useEffect, useState, ChangeEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import TopBar from '../../components/TopBar/TopBar.js';
import { fetchShifts } from '../../store/slices/shiftsSlice.js';
import type { RootState, AppDispatch } from '../../store/index.js';
import type { Shift, ShiftSummary } from '../../types.js';
import ShiftModal from '../../components/ShiftModal/ShiftModal.js';
import styles from './Shifts.module.css';

const SHIFT_COLORS: Record<Shift, string> = {
  morning: '#f59e0b',
  afternoon: '#3b82f6',
  night: '#a855f7',
};

interface ChartRow {
  date: string;
  morning?: number;
  afternoon?: number;
  night?: number;
}

type SortCol = 'date' | 'shift' | 'oee' | 'machines' | 'faults';
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── Edit Modal ─────────────────────────────────────────────────────────── */

function EditModal({ summary, onClose }: { summary: ShiftSummary; onClose: () => void }): JSX.Element {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose]);

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.actionModal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.actionModalHeader}>
          <span className={styles.actionModalTitle}>Edit Shift Entry</span>
          <button className={styles.actionModalClose} onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className={styles.editForm}>
          <div className={styles.editRow}>
            <div className={styles.editField}>
              <label className={styles.editLabel}>Date</label>
              <input className={styles.editInput} type="text" defaultValue={formatDate(summary.date)} readOnly />
            </div>
            <div className={styles.editField}>
              <label className={styles.editLabel}>Shift</label>
              <input
                className={styles.editInput}
                type="text"
                defaultValue={summary.shift}
                readOnly
                style={{ textTransform: 'capitalize', color: SHIFT_COLORS[summary.shift], fontWeight: 600 }}
              />
            </div>
          </div>
          <div className={styles.editRow}>
            <div className={styles.editField}>
              <label className={styles.editLabel}>OEE %</label>
              <input className={styles.editInput} type="text" defaultValue={`${summary.total_oee?.toFixed(1)}%`} readOnly />
            </div>
            <div className={styles.editField}>
              <label className={styles.editLabel}>Machines</label>
              <input className={styles.editInput} type="text" defaultValue={summary.machines_count} readOnly />
            </div>
          </div>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Faults</label>
            <input
              className={styles.editInput}
              type="text"
              defaultValue={summary.faults_count}
              readOnly
              style={{ width: '50%', color: summary.faults_count > 0 ? 'var(--status-fault)' : undefined }}
            />
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

function DeleteModal({ summary, onClose }: { summary: ShiftSummary; onClose: () => void }): JSX.Element {
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
              Are you sure you want to delete this shift record? This action cannot be undone.
            </p>

            <div className={styles.deleteContext}>
              <span className={styles.deleteContextDate}>{formatDate(summary.date)}</span>
              <span
                className={styles.deleteContextShift}
                style={{ color: SHIFT_COLORS[summary.shift] }}
              >
                {summary.shift} shift
              </span>
              <span className={styles.deleteContextMeta}>
                OEE {summary.total_oee?.toFixed(1)}% · {summary.machines_count} machines · {summary.faults_count} faults
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

export default function Shifts(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const { summaries, loading } = useSelector((s: RootState) => s.shifts);

  const [shiftFilter, setShiftFilter] = useState<Shift | ''>('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortCol, setSortCol] = useState<SortCol | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [selectedSummary, setSelectedSummary] = useState<ShiftSummary | null>(null);
  const [editSummary, setEditSummary]         = useState<ShiftSummary | null>(null);
  const [deleteSummary, setDeleteSummary]     = useState<ShiftSummary | null>(null);
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

  function clearFilters(): void {
    setShiftFilter('');
    setDateFilter('');
    setPage(1);
  }

  useEffect(() => {
    dispatch(fetchShifts());
  }, [dispatch]);

  useEffect(() => { setPage(1); }, [shiftFilter, dateFilter]);

  const byDate: Record<string, ChartRow> = {};
  summaries.forEach((s) => {
    const dateKey = new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!byDate[dateKey]) byDate[dateKey] = { date: dateKey };
    byDate[dateKey][s.shift] = s.total_oee;
  });
  const chartData: ChartRow[] = Object.values(byDate).slice(0, 7).reverse();

  const latestByShift: Partial<Record<Shift, ShiftSummary>> = {};
  summaries.forEach((s) => {
    if (!latestByShift[s.shift]) latestByShift[s.shift] = s;
  });

  const shifts: Shift[] = ['morning', 'afternoon', 'night'];

  const filteredSummaries = summaries.filter((s) => {
    if (shiftFilter && s.shift !== shiftFilter) return false;
    if (dateFilter) {
      const rowDate = new Date(s.date).toISOString().slice(0, 10);
      if (rowDate !== dateFilter) return false;
    }
    return true;
  });

  const sortedSummaries = sortCol
    ? [...filteredSummaries].sort((a, b) => {
        let va: string | number = '';
        let vb: string | number = '';
        switch (sortCol) {
          case 'date':     va = new Date(a.date).getTime(); vb = new Date(b.date).getTime(); break;
          case 'shift':    va = a.shift;          vb = b.shift;          break;
          case 'oee':      va = a.total_oee ?? 0; vb = b.total_oee ?? 0; break;
          case 'machines': va = a.machines_count; vb = b.machines_count; break;
          case 'faults':   va = a.faults_count;   vb = b.faults_count;   break;
        }
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ?  1 : -1;
        return 0;
      })
    : filteredSummaries;

  const totalPages = Math.max(1, Math.ceil(sortedSummaries.length / PAGE_SIZE));
  const pagedSummaries = sortedSummaries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function getPageNumbers(): number[] {
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      range.push(i);
    }
    return range;
  }

  const COLUMNS: { col: SortCol; label: string }[] = [
    { col: 'date',     label: 'Date'     },
    { col: 'shift',    label: 'Shift'    },
    { col: 'oee',      label: 'OEE %'    },
    { col: 'machines', label: 'Machines' },
    { col: 'faults',   label: 'Faults'   },
  ];

  const hasFilters = shiftFilter || dateFilter;

  return (
    <div className={styles.layout}>
      <TopBar />
      <main className={styles.main}>
        <h2 className={styles.pageTitle}>Shift Comparison</h2>

        {loading ? (
          <p className={styles.loading}>Loading…</p>
        ) : (
          <>
            <div className={styles.shiftCards}>
              {shifts.map((shift) => {
                const s = latestByShift[shift];
                return (
                  <div key={shift} className={styles.shiftCard} style={{ borderTopColor: SHIFT_COLORS[shift] }}>
                    <p className={styles.shiftName}>{shift} shift</p>
                    <p className={styles.shiftOee}>
                      <span className={styles.shiftOeeVal}>{s?.total_oee?.toFixed(1) ?? '—'}</span>
                      <span className={styles.shiftOeeUnit}>%</span>
                    </p>
                    <div className={styles.shiftMeta}>
                      <span>{s?.machines_count ?? 0} machines</span>
                      <span className={s?.faults_count ? styles.faultText : ''}>
                        {s?.faults_count ?? 0} faults
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.chartContainer}>
              <h3 className={styles.chartTitle}>7-Day OEE by Shift</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 20, left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-ui)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                    label={{
                      value: 'Date',
                      position: 'insideBottom',
                      offset: -14,
                      style: { fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-data)', textAnchor: 'middle' },
                    }}
                  />
                  <YAxis
                    domain={[60, 100]}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-data)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `${v}%`}
                    width={52}
                    label={{
                      value: 'OEE %',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 4,
                      style: { fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-data)', textAnchor: 'middle' },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.82rem',
                    }}
                    cursor={{ fill: '#232636', opacity: 0.5, radius: 4 }}
                    formatter={(v: number, name: string) => [`${v?.toFixed(1)}%`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: '24px' }} />
                  <Bar dataKey="morning" fill={SHIFT_COLORS.morning} radius={[3, 3, 0, 0]} name="Morning"
                    activeBar={{ fill: '#fbbf24', stroke: '#fcd34d', strokeWidth: 1.5 }}
                  />
                  <Bar dataKey="afternoon" fill={SHIFT_COLORS.afternoon} radius={[3, 3, 0, 0]} name="Afternoon"
                    activeBar={{ fill: '#60a5fa', stroke: '#93c5fd', strokeWidth: 1.5 }}
                  />
                  <Bar dataKey="night" fill={SHIFT_COLORS.night} radius={[3, 3, 0, 0]} name="Night"
                    activeBar={{ fill: '#c084fc', stroke: '#d8b4fe', strokeWidth: 1.5 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.tableSection}>
              <div className={styles.tableHeader}>
                <div className={styles.tableHeaderLeft}>
                  <span className={styles.tableCount}>
                    {hasFilters && filteredSummaries.length !== summaries.length
                      ? `${filteredSummaries.length} of ${summaries.length} records`
                      : `${summaries.length} records`}
                  </span>
                </div>
                <div className={styles.filters}>
                  <div className={styles.filterField}>
                    <label className={styles.filterLabel}>Shift</label>
                    <select
                      className={styles.select}
                      value={shiftFilter}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => setShiftFilter(e.target.value as Shift | '')}
                    >
                      <option value="">All shifts</option>
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="night">Night</option>
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

                  {hasFilters && (
                    <button className={styles.clearBtn} onClick={clearFilters}>
                      Clear filters
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      {COLUMNS.map(({ col, label }) => (
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
                    {pagedSummaries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className={styles.empty}>No records found</td>
                      </tr>
                    ) : (
                      pagedSummaries.map((s) => (
                        <tr key={s._id} className={styles.clickableRow} onClick={() => setSelectedSummary(s)}>
                          <td className={styles.mono}>{formatDate(s.date)}</td>
                          <td className={styles.shiftCell} style={{ color: SHIFT_COLORS[s.shift] }}>{s.shift}</td>
                          <td className={styles.mono}>{s.total_oee?.toFixed(1)}%</td>
                          <td className={styles.mono}>{s.machines_count}</td>
                          <td className={`${styles.mono} ${s.faults_count > 0 ? styles.faultText : ''}`}>
                            {s.faults_count}
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className={styles.actionBtns}>
                              <button
                                className={styles.editBtn}
                                onClick={() => setEditSummary(s)}
                                aria-label="Edit entry"
                                title="Edit"
                              >
                                <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                                  <path d="M11.5 2.5a1.414 1.414 0 012 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                                </svg>
                              </button>
                              <button
                                className={styles.deleteBtn}
                                onClick={() => setDeleteSummary(s)}
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
            </div>

            {sortedSummaries.length > PAGE_SIZE && (
              <div className={styles.pagination}>
                <span className={styles.pageInfo}>
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sortedSummaries.length)} of {sortedSummaries.length}
                </span>
                <div className={styles.pageControls}>
                  <button className={styles.pageBtn} onClick={() => setPage((p) => p - 1)} disabled={page === 1}>‹</button>
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
                  <button className={styles.pageBtn} onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>›</button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {selectedSummary && (
        <ShiftModal summary={selectedSummary} onClose={() => setSelectedSummary(null)} />
      )}
      {editSummary && (
        <EditModal summary={editSummary} onClose={() => setEditSummary(null)} />
      )}
      {deleteSummary && (
        <DeleteModal summary={deleteSummary} onClose={() => setDeleteSummary(null)} />
      )}
    </div>
  );
}
