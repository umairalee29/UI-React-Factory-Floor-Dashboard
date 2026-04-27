import { useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from './ParetoChart.module.css';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      <p className={styles.tooltipValue}>{payload[0].value} events</p>
    </div>
  );
}

export default function ParetoChart() {
  const logs = useSelector((s) => s.downtime.logs);

  const data = Object.entries(
    logs.reduce((acc, log) => {
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
          <BarChart data={data} margin={{ top: 8, right: 16, bottom: 48, left: 0 }}>
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
              width={32}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              fill="var(--accent)"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
