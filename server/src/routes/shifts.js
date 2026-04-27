const express = require('express');
const ShiftSummary = require('../models/ShiftSummary');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (_req, res, next) => {
  try {
    const summaries = await ShiftSummary.find()
      .sort({ date: -1 })
      .limit(63); // 7 days × 3 shifts
    res.json(summaries);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
