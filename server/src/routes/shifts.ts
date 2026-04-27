import { Router, Response, NextFunction } from 'express';
import ShiftSummary from '../models/ShiftSummary.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const summaries = await ShiftSummary.find()
      .sort({ date: -1 })
      .limit(63);
    res.json(summaries);
  } catch (err) {
    next(err);
  }
});

export default router;
