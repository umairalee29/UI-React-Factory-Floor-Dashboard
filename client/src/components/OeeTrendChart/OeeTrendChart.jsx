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
} from 'recharts';
import styles from './OeeTrendChart.module.css';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTime}>{label}</p>
      <p className={styles.tooltipValue}>{payload[0].value}%</p>
    </div>
  );
}

export default function OeeTrendChart() {
  const oeeTrend = useSelector((s) => s.machines.oeeTrend);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>OEE Trend — Current Shift</h3>
      {oeeTrend.length < 2 ? (
        <p className={styles.empty}>Collecting data&hellip;</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={oeeTrend} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-data)' }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
            />
            <YAxis
              domain={[60, 100]}
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-data)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              width={42}
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
