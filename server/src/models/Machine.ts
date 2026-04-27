import { Schema, model, Document } from 'mongoose';

export interface IMachine extends Document {
  name: string;
  status: 'running' | 'idle' | 'fault';
  oee_score: number;
  output_count: number;
  target_count: number;
  downtime_minutes: number;
  shift: 'morning' | 'afternoon' | 'night';
}

const machineSchema = new Schema<IMachine>(
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

export default model<IMachine>('Machine', machineSchema);
