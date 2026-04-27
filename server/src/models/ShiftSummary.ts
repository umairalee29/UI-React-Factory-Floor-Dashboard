import { Schema, model, Document } from 'mongoose';

export interface IShiftSummary extends Document {
  shift: 'morning' | 'afternoon' | 'night';
  date: Date;
  total_oee: number;
  machines_count: number;
  faults_count: number;
}

const shiftSummarySchema = new Schema<IShiftSummary>(
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

export default model<IShiftSummary>('ShiftSummary', shiftSummarySchema);
