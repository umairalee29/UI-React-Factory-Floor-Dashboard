import { Router, Response, NextFunction } from 'express';
import Machine from '../models/Machine.js';
import { authenticate, requireSupervisor, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const machines = await Machine.find().sort({ name: 1 });
    res.json(machines);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', authenticate, requireSupervisor, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const { status } = req.body as { status?: string };
  const allowed = ['running', 'idle', 'fault'];

  if (!status || !allowed.includes(status)) {
    res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
    return;
  }

  try {
    const machine = await Machine.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!machine) {
      res.status(404).json({ error: 'Machine not found' });
      return;
    }
    res.json(machine);
  } catch (err) {
    next(err);
  }
});

export default router;
