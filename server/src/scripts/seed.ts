import 'dotenv/config';
import mongoose from 'mongoose';
import Machine from '../models/Machine.js';
import DowntimeLog from '../models/DowntimeLog.js';
import ShiftSummary from '../models/ShiftSummary.js';

type Shift = 'morning' | 'afternoon' | 'night';

interface MachineDef {
  name: string;
  shift: Shift;
  oeeMin: number;
  oeeMax: number;
  target: number;
}

const DOWNTIME_REASONS: string[] = [
  'Tool Wear',
  'Spindle Overheat',
  'Power Failure',
  'Material Jam',
  'Hydraulic Pressure Loss',
  'Sensor Calibration',
  'Scheduled Maintenance',
  'Coolant Leak',
];

const MACHINE_DEFS: MachineDef[] = [
  { name: 'CNC-001', shift: 'morning', oeeMin: 85, oeeMax: 92, target: 480 },
  { name: 'CNC-002', shift: 'morning', oeeMin: 82, oeeMax: 90, target: 460 },
  { name: 'CNC-003', shift: 'morning', oeeMin: 88, oeeMax: 95, target: 500 },
  { name: 'PRESS-001', shift: 'afternoon', oeeMin: 78, oeeMax: 88, target: 600 },
  { name: 'PRESS-002', shift: 'afternoon', oeeMin: 75, oeeMax: 85, target: 580 },
  { name: 'WELD-001', shift: 'night', oeeMin: 75, oeeMax: 83, target: 320 },
  { name: 'WELD-002', shift: 'night', oeeMin: 77, oeeMax: 84, target: 340 },
  { name: 'WELD-003', shift: 'night', oeeMin: 76, oeeMax: 82, target: 310 },
];

function rand(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function seed(): Promise<void> {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log('Connected to MongoDB');

  await Machine.deleteMany({});
  await DowntimeLog.deleteMany({});
  await ShiftSummary.deleteMany({});
  console.log('Cleared existing collections');

  const machines = await Machine.insertMany(
    MACHINE_DEFS.map((def) => {
      const oee = rand(def.oeeMin, def.oeeMax);
      const output = Math.round((oee / 100) * def.target);
      return {
        name: def.name,
        shift: def.shift,
        status: Math.random() > 0.15 ? 'running' : 'idle',
        oee_score: oee,
        output_count: output,
        target_count: def.target,
        downtime_minutes: randInt(5, 60),
      };
    })
  );
  console.log(`Seeded ${machines.length} machines`);

  const downtimeLogs: Array<{
    machine_id: mongoose.Types.ObjectId;
    reason: string;
    started_at: Date;
    ended_at: Date;
    duration_minutes: number;
  }> = [];

  for (let day = 0; day < 7; day++) {
    const baseDate = daysAgo(day);
    for (const machine of machines) {
      const eventCount = randInt(0, 3);
      for (let e = 0; e < eventCount; e++) {
        const startHour = randInt(0, 22);
        const durationMins = randInt(15, 120);
        const started_at = new Date(baseDate);
        started_at.setHours(startHour, randInt(0, 59));
        const ended_at = new Date(started_at.getTime() + durationMins * 60000);
        downtimeLogs.push({
          machine_id: machine._id as mongoose.Types.ObjectId,
          reason: pick(DOWNTIME_REASONS),
          started_at,
          ended_at,
          duration_minutes: durationMins,
        });
      }
    }
  }
  await DowntimeLog.insertMany(downtimeLogs);
  console.log(`Seeded ${downtimeLogs.length} downtime logs`);

  const shifts: Shift[] = ['morning', 'afternoon', 'night'];
  const shiftOeeRanges: Record<Shift, [number, number]> = {
    morning: [85, 92],
    afternoon: [78, 88],
    night: [75, 83],
  };
  const shiftMachineCounts: Record<Shift, number> = { morning: 3, afternoon: 2, night: 3 };

  const summaries = [];
  for (let day = 0; day < 7; day++) {
    const date = daysAgo(day);
    for (const shift of shifts) {
      const [min, max] = shiftOeeRanges[shift];
      summaries.push({
        shift,
        date,
        total_oee: rand(min, max),
        machines_count: shiftMachineCounts[shift],
        faults_count: randInt(0, 2),
      });
    }
  }
  await ShiftSummary.insertMany(summaries);
  console.log(`Seeded ${summaries.length} shift summaries`);

  console.log('\nSeed complete!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err: Error) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
