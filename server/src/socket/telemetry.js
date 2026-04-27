const Machine = require('../models/Machine');

const STATUSES = ['running', 'idle', 'fault'];
const STATUS_WEIGHTS = [0.7, 0.2, 0.1]; // 70% running, 20% idle, 10% fault

function weightedRandom(items, weights) {
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < items.length; i++) {
    cumulative += weights[i];
    if (r < cumulative) return items[i];
  }
  return items[items.length - 1];
}

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

async function broadcastState(io) {
  try {
    const machines = await Machine.find().lean();
    if (!machines.length) return;

    // Pick 1–2 random machine indices to mutate this tick
    const mutateCount = Math.random() < 0.5 ? 1 : 2;
    const indices = new Set();
    while (indices.size < Math.min(mutateCount, machines.length)) {
      indices.add(Math.floor(Math.random() * machines.length));
    }

    const updates = machines.map((m, i) => {
      if (!indices.has(i)) return m;
      const delta = (Math.random() * 4 - 2); // ±2%
      return {
        ...m,
        oee_score: clamp(Math.round((m.oee_score + delta) * 10) / 10, 60, 99),
        status: weightedRandom(STATUSES, STATUS_WEIGHTS),
        output_count: m.output_count + (m.status === 'running' ? Math.floor(Math.random() * 3) : 0),
      };
    });

    io.emit('machine:update', updates);
  } catch (err) {
    console.error('Telemetry broadcast error:', err.message);
  }
}

function startTelemetry(io) {
  // Emit immediately on new client connection
  io.on('connection', async (socket) => {
    console.log(`Socket client connected: ${socket.id}`);
    try {
      const machines = await Machine.find().lean();
      socket.emit('machine:update', machines);
    } catch (err) {
      console.error('Initial socket emit error:', err.message);
    }

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  // Broadcast to all clients every 5 seconds
  setInterval(() => broadcastState(io), 5000);
}

module.exports = { startTelemetry };
