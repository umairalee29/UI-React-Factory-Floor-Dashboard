import { useSelector } from 'react-redux';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  TooltipProps,
} from 'recharts';
import type { RootState } from '../../store/index.js';
import type { OeeTrendPoint, MachineSnapshot } from '../../types.js';
import styles from './OeeTrendChart.module.css';

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>): JSX.Element | null {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as OeeTrendPoint;
  const top5 = point.machines
    ? [...point.machines].sort((a, b) => b.oee - a.oee).slice(0, 5)
    : [];
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTime}>{label}</p>
      <p className={styles.tooltipValue}>Avg {payload[0].value}%</p>
      {top5.length > 0 && (
        <>
          <div className={styles.divider} />
          <ul className={styles.machineList}>
            {top5.map((m: MachineSnapshot) => (
              <li key={m.name} className={styles.machineRow}>
                <span className={`${styles.statusDot} ${styles[m.status]}`} />
                <span className={styles.machineName}>{m.name}</span>
                <span className={styles.machineOee}>{m.oee}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default function OeeTrendChart(): JSX.Element {
  const oeeTrend = useSelector((s: RootState) => s.machines.oeeTrend) as OeeTrendPoint[];

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>OEE Trend — Current Shift</h3>
      {oeeTrend.length < 2 ? (
        <p className={styles.empty}>Collecting data&hellip;</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={oeeTrend} margin={{ top: 8, right: 16, bottom: 28, left: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-data)' }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
              label={{
                value: 'Time',
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
                value: 'Avg %',
                angle: -90,
                position: 'insideLeft',
                offset: 4,
                style: { fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-data)', textAnchor: 'middle' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={85} stroke="var(--accent)" strokeDasharray="4 4" strokeOpacity={0.4} />
            <Line
              type="monotone"
              dataKey="oee"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'var(--accent)', stroke: 'var(--bg-primary)', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
