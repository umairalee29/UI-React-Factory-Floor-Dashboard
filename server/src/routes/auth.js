const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Pre-hashed demo passwords (generated once at module load — acceptable for demo)
const DEMO_USERS = [
  {
    username: 'operator',
    passwordHash: bcrypt.hashSync('operator123', 10),
    role: 'operator',
  },
  {
    username: 'supervisor',
    passwordHash: bcrypt.hashSync('supervisor123', 10),
    role: 'supervisor',
  },
];

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const user = DEMO_USERS.find((u) => u.username === username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token, user: { username: user.username, role: user.role } });
});

module.exports = router;
