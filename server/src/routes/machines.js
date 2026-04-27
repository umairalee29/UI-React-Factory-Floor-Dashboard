const express = require('express');
const Machine = require('../models/Machine');
const { authenticate, requireSupervisor } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (_req, res, next) => {
  try {
    const machines = await Machine.find().sort({ name: 1 });
    res.json(machines);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', authenticate, requireSupervisor, async (req, res, next) => {
  const { status } = req.body;
  const allowed = ['running', 'idle', 'fault'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
  }

  try {
    const machine = await Machine.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!machine) return res.status(404).json({ error: 'Machine not found' });
    res.json(machine);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
