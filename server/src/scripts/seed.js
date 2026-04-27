require('dotenv').config({ path: '../../../.env' });
const mongoose = require('mongoose');
const Machine = require('../models/Machine');
const DowntimeLog = require('../models/DowntimeLog');
const ShiftSummary = require('../models/ShiftSummary');

const DOWNTIME_REASONS = [
  'Tool Wear',
  'Spindle Overheat',
  'Power Failure',
  'Material Jam',
  'Hydraulic Pressure Loss',
  'Sensor Calibration',
  'Scheduled Maintenance',
  'Coolant Leak',
];

const MACHINE_DEFS = [
  { name: 'CNC-001', shift: 'morning', oeeMin: 85, oeeMax: 92, target: 480 },
  { name: 'CNC-002', shift: 'morning', oeeMin: 82, oeeMax: 90, target: 460 },
  { name: 'CNC-003', shift: 'morning', oeeMin: 88, oeeMax: 95, target: 500 },
  { name: 'PRESS-001', shift: 'afternoon', oeeMin: 78, oeeMax: 88, target: 600 },
  { name: 'PRESS-002', shift: 'afternoon', oeeMin: 75, oeeMax: 85, target: 580 },
  { name: 'WELD-001', shift: 'night', oeeMin: 75, oeeMax: 83, target: 320 },
  { name: 'WELD-002', shift: 'night', oeeMin: 77, oeeMax: 84, target: 340 },
  { name: 'WELD-003', shift: 'night', oeeMin: 76, oeeMax: 82, target: 310 },
];

function rand(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Drop existing data
  await Machine.deleteMany({});
  await DowntimeLog.deleteMany({});
  await ShiftSummary.deleteMany({});
  console.log('Cleared existing collections');

  // Create machines
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

  // Create downtime logs for past 7 days
  const downtimeLogs = [];
  for (let day = 0; day < 7; day++) {
    const baseDate = daysAgo(day);

    for (const machine of machines) {
      // 0–3 events per machine per day
      const eventCount = randInt(0, 3);
      for (let e = 0; e < eventCount; e++) {
        const startHour = randInt(0, 22);
        const durationMins = randInt(15, 120);
        const started_at = new Date(baseDate);
        started_at.setHours(startHour, randInt(0, 59));
        const ended_at = new Date(started_at.getTime() + durationMins * 60000);

        downtimeLogs.push({
          machine_id: machine._id,
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

  // Create shift summaries for past 7 days
  const shifts = ['morning', 'afternoon', 'night'];
  const shiftOeeRanges = {
    morning: [85, 92],
    afternoon: [78, 88],
    night: [75, 83],
  };
  const summaries = [];

  for (let day = 0; day < 7; day++) {
    const date = daysAgo(day);
    for (const shift of shifts) {
      const [min, max] = shiftOeeRanges[shift];
      summaries.push({
        shift,
        date,
        total_oee: rand(min, max),
        machines_count: shift === 'morning' ? 3 : shift === 'afternoon' ? 2 : 3,
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

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
