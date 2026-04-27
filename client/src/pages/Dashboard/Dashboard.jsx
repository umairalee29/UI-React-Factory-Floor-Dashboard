import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TopBar from '../../components/TopBar/TopBar.jsx';
import KpiCard from '../../components/KpiCard/KpiCard.jsx';
import MachineCard from '../../components/MachineCard/MachineCard.jsx';
import OeeTrendChart from '../../components/OeeTrendChart/OeeTrendChart.jsx';
import ParetoChart from '../../components/ParetoChart/ParetoChart.jsx';
import { fetchMachines } from '../../store/slices/machinesSlice.js';
import { fetchDowntime } from '../../store/slices/downtimeSlice.js';
import useSocket from '../../hooks/useSocket.js';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const dispatch = useDispatch();
  const machines = useSelector((s) => s.machines.list);
  const machinesLoading = useSelector((s) => s.machines.loading);

  useSocket();

  useEffect(() => {
    dispatch(fetchMachines());
    dispatch(fetchDowntime());
  }, [dispatch]);

  const running = machines.filter((m) => m.status === 'running').length;
  const faults  = machines.filter((m) => m.status === 'fault').length;
  const avgOee  = machines.length
    ? (machines.reduce((s, m) => s + (m.oee_score || 0), 0) / machines.length).toFixed(1)
    : '—';
  const totalOutput = machines.reduce((s, m) => s + (m.output_count || 0), 0);

  return (
    <div className={styles.layout}>
      <TopBar />
      <main className={styles.main}>

        <div className={styles.kpiRow}>
          <KpiCard title="Overall OEE" value={avgOee} unit="%" accent="accent" />
          <KpiCard title="Machines Running" value={running} accent="running" />
          <KpiCard title="Machines in Fault" value={faults} accent="fault" />
          <KpiCard title="Total Output Today" value={totalOutput} />
        </div>

        {machinesLoading && machines.length === 0 ? (
          <p className={styles.loading}>Loading machines…</p>
        ) : (
          <div className={styles.machineGrid}>
            {machines.map((m) => (
              <MachineCard key={m._id} machine={m} />
            ))}
          </div>
        )}

        <div className={styles.chartsRow}>
          <OeeTrendChart />
          <ParetoChart />
        </div>
      </main>
    </div>
  );
}
