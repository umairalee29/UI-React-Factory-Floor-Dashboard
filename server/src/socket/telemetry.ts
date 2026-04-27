import { Server } from 'socket.io';
import Machine, { IMachine } from '../models/Machine.js';

type Status = 'running' | 'idle' | 'fault';

const STATUSES: Status[] = ['running', 'idle', 'fault'];
const STATUS_WEIGHTS: number[] = [0.7, 0.2, 0.1];

function weightedRandom<T>(items: T[], weights: number[]): T {
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < items.length; i++) {
    cumulative += weights[i];
    if (r < cumulative) return items[i];
  }
  return items[items.length - 1];
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

async function broadcastState(io: Server): Promise<void> {
  try {
    const machines = await Machine.find().lean();
    if (!machines.length) return;

    const mutateCount = Math.random() < 0.5 ? 1 : 2;
    const indices = new Set<number>();
    while (indices.size < Math.min(mutateCount, machines.length)) {
      indices.add(Math.floor(Math.random() * machines.length));
    }

    const updates = machines.map((m, i) => {
      if (!indices.has(i)) return m;
      const delta = Math.random() * 4 - 2;
      return {
        ...m,
        oee_score: clamp(Math.round((m.oee_score + delta) * 10) / 10, 60, 99),
        status: weightedRandom<Status>(STATUSES, STATUS_WEIGHTS),
        output_count:
          m.output_count + (m.status === 'running' ? Math.floor(Math.random() * 3) : 0),
      };
    });

    io.emit('machine:update', updates);
  } catch (err) {
    console.error('Telemetry broadcast error:', (err as Error).message);
  }
}

export function startTelemetry(io: Server): void {
  io.on('connection', async (socket) => {
    console.log(`Socket client connected: ${socket.id}`);
    try {
      const machines = await Machine.find().lean();
      socket.emit('machine:update', machines);
    } catch (err) {
      console.error('Initial socket emit error:', (err as Error).message);
    }

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  setInterval(() => broadcastState(io), 5000);
}
