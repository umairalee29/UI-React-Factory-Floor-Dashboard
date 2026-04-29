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

interface TickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
}

function CustomXTick({ x = 0, y = 0, payload }: TickProps): JSX.Element {
  if (!payload) return <g />;
  const label: string = payload.value;
  const words = label.split(' ');
  const shouldSplit = label.length > 13 && words.length > 1;
  const mid = Math.ceil(words.length / 2);
  const line1 = shouldSplit ? words.slice(0, mid).join(' ') : label;
  const line2 = shouldSplit ? words.slice(mid).join(' ') : '';
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        transform="rotate(-45)"
        textAnchor="end"
        fill="var(--text-secondary)"
        fontSize={10}
        fontWeight={700}
        fontFamily="var(--font-data)"
      >
        <tspan x={0} dy="0.3em">{line1}</tspan>
        {line2 && <tspan x={0} dy="1.2em">{line2}</tspan>}
      </text>
    </g>
  );
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
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 8, right: 16, bottom: 60, left: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={true} vertical={false} />
            <XAxis
              dataKey="reason"
              tick={<CustomXTick />}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
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
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: '#232636', opacity: 0.5, radius: 4 }}
            />
            <Bar
              dataKey="count"
              fill="var(--accent)"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
              activeBar={{
                fill: '#60a5fa',
                stroke: '#93c5fd',
                strokeWidth: 1.5,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
