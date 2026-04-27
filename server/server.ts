import 'dotenv/config';
import http from 'http';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import connectDB from './src/config/db.js';
import { startTelemetry } from './src/socket/telemetry.js';
import authRoutes from './src/routes/auth.js';
import machineRoutes from './src/routes/machines.js';
import downtimeRoutes from './src/routes/downtime.js';
import shiftRoutes from './src/routes/shifts.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/downtime', downtimeRoutes);
app.use('/api/shifts', shiftRoutes);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  startTelemetry(io);
  server.listen(PORT, () => {
    console.log(`OpsFloor server running on port ${PORT}`);
  });
});
