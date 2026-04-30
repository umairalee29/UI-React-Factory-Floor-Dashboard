import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import TopBar from '../../components/TopBar/TopBar.js';
import { fetchShifts } from '../../store/slices/shiftsSlice.js';
import type { RootState, AppDispatch } from '../../store/index.js';
import type { Shift, ShiftSummary } from '../../types.js';
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

export default function Shifts(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const { summaries, loading } = useSelector((s: RootState) => s.shifts);

  useEffect(() => {
    dispatch(fetchShifts());
  }, [dispatch]);

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

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(summaries.length / PAGE_SIZE));
  const pagedSummaries = summaries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th><th>Shift</th><th>OEE %</th><th>Machines</th><th>Faults</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedSummaries.map((s) => (
                    <tr key={s._id}>
                      <td className={styles.mono}>
                        {new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className={styles.shiftCell} style={{ color: SHIFT_COLORS[s.shift] }}>{s.shift}</td>
                      <td className={styles.mono}>{s.total_oee?.toFixed(1)}%</td>
                      <td className={styles.mono}>{s.machines_count}</td>
                      <td className={`${styles.mono} ${s.faults_count > 0 ? styles.faultText : ''}`}>
                        {s.faults_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {summaries.length > PAGE_SIZE && (
              <div className={styles.pagination}>
                <span className={styles.pageInfo}>
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, summaries.length)} of {summaries.length}
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
    </div>
  );
}
