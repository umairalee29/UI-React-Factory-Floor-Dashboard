require('dotenv').config({ path: '../.env' });
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');
const { startTelemetry } = require('./src/socket/telemetry');

const authRoutes = require('./src/routes/auth');
const machineRoutes = require('./src/routes/machines');
const downtimeRoutes = require('./src/routes/downtime');
const shiftRoutes = require('./src/routes/shifts');

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

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use((err, _req, res, _next) => {
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
