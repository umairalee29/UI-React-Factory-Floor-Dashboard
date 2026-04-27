import { Router, Response, NextFunction } from 'express';
import DowntimeLog from '../models/DowntimeLog.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};

    if (req.query.machine_id) {
      filter.machine_id = req.query.machine_id as string;
    }

    if (req.query.date) {
      const start = new Date(req.query.date as string);
      const end = new Date(req.query.date as string);
      end.setDate(end.getDate() + 1);
      filter.started_at = { $gte: start, $lt: end };
    }

    const logs = await DowntimeLog.find(filter)
      .populate('machine_id', 'name shift')
      .sort({ started_at: -1 })
      .limit(200);

    res.json(logs);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { machine_id, reason, started_at, ended_at } = req.body as {
      machine_id?: string;
      reason?: string;
      started_at?: string;
      ended_at?: string;
    };

    if (!machine_id || !reason || !started_at) {
      res.status(400).json({ error: 'machine_id, reason, and started_at are required' });
      return;
    }

    const log = new DowntimeLog({ machine_id, reason, started_at, ended_at });
    await log.save();
    const populated = await log.populate('machine_id', 'name shift');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

export default router;
