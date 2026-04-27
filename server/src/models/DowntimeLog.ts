import { Schema, model, Document, Types } from 'mongoose';

export interface IDowntimeLog extends Document {
  machine_id: Types.ObjectId;
  reason: string;
  started_at: Date;
  ended_at?: Date;
  duration_minutes?: number;
}

const downtimeLogSchema = new Schema<IDowntimeLog>(
  {
    machine_id: {
      type: Schema.Types.ObjectId,
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
      (this.ended_at.getTime() - this.started_at.getTime()) / 60000
    );
  }
  next();
});

export default model<IDowntimeLog>('DowntimeLog', downtimeLogSchema);
