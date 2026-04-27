const mongoose = require('mongoose');

const shiftSummarySchema = new mongoose.Schema(
  {
    shift: {
      type: String,
      enum: ['morning', 'afternoon', 'night'],
      required: true,
    },
    date: { type: Date, required: true },
    total_oee: { type: Number, min: 0, max: 100 },
    machines_count: { type: Number, default: 0 },
    faults_count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ShiftSummary', shiftSummarySchema);
