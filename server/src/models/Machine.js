const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['running', 'idle', 'fault'],
      default: 'idle',
    },
    oee_score: { type: Number, min: 0, max: 100, default: 0 },
    output_count: { type: Number, default: 0 },
    target_count: { type: Number, default: 0 },
    downtime_minutes: { type: Number, default: 0 },
    shift: {
      type: String,
      enum: ['morning', 'afternoon', 'night'],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Machine', machineSchema);
