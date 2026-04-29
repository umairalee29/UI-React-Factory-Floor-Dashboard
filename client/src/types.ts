export type Status = 'running' | 'idle' | 'fault';
export type Shift = 'morning' | 'afternoon' | 'night';
export type Role = 'operator' | 'supervisor';

export interface Machine {
  _id: string;
  name: string;
  status: Status;
  oee_score: number;
  output_count: number;
  target_count: number;
  downtime_minutes: number;
  shift: Shift;
  createdAt: string;
  updatedAt: string;
}

export interface MachineSummary {
  _id: string;
  name: string;
  shift: Shift;
}

export interface DowntimeLog {
  _id: string;
  machine_id: MachineSummary | string;
  reason: string;
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  createdAt: string;
}

export interface ShiftSummary {
  _id: string;
  shift: Shift;
  date: string;
  total_oee: number;
  machines_count: number;
  faults_count: number;
}

export interface User {
  username: string;
  role: Role;
}

export interface MachineSnapshot {
  name: string;
  status: Status;
  oee: number;
}

export interface OeeTrendPoint {
  time: string;
  oee: number;
  machines: MachineSnapshot[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
