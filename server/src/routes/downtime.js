const express = require('express');
const DowntimeLog = require('../models/DowntimeLog');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.machine_id) {
      filter.machine_id = req.query.machine_id;
    }

    if (req.query.date) {
      const start = new Date(req.query.date);
      const end = new Date(req.query.date);
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

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { machine_id, reason, started_at, ended_at } = req.body;

    if (!machine_id || !reason || !started_at) {
      return res.status(400).json({ error: 'machine_id, reason, and started_at are required' });
    }

    const log = new DowntimeLog({ machine_id, reason, started_at, ended_at });
    await log.save();

    const populated = await log.populate('machine_id', 'name shift');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
