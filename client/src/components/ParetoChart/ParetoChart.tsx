import { useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import type { RootState } from '../../store/index.js';
import styles from './ParetoChart.module.css';

interface ParetoEntry {
  reason: string;
  count: number;
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>): JSX.Element | null {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      <p className={styles.tooltipValue}>{payload[0].value} events</p>
    </div>
  );
}

export default function ParetoChart(): JSX.Element {
  const logs = useSelector((s: RootState) => s.downtime.logs);

  const data: ParetoEntry[] = Object.entries(
    logs.reduce<Record<string, number>>((acc, log) => {
      acc[log.reason] = (acc[log.reason] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Downtime Pareto — Top Reasons</h3>
      {data.length === 0 ? (
        <p className={styles.empty}>No downtime data</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 8, right: 16, bottom: 48, left: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={true} vertical={false} />
            <XAxis
              dataKey="reason"
              tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-ui)' }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-data)' }}
              axisLine={false}
              tickLine={false}
              width={52}
              label={{
                value: 'Events',
                angle: -90,
                position: 'insideLeft',
                offset: 4,
                style: { fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-data)', textAnchor: 'middle' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
