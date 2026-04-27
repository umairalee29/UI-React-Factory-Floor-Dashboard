const mongoose = require('mongoose');

const downtimeLogSchema = new mongoose.Schema(
  {
    machine_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      required: true,
    },
    reason: { type: String, required: true, trim: true },
    started_at: { type: Date, required: true },
    ended_at: { type: Date },
    duration_minutes: { type: Number },
  },
  { timestamps: true }
);

downtimeLogSchema.pre('save', function (next) {
  if (this.started_at && this.ended_at) {
    this.duration_minutes = Math.round(
      (this.ended_at - this.started_at) / 60000
    );
  }
  next();
});

module.exports = mongoose.model('DowntimeLog', downtimeLogSchema);
