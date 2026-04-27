import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

interface DemoUser {
  username: string;
  passwordHash: string;
  role: string;
}

const DEMO_USERS: DemoUser[] = [
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

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    res.status(400).json({ error: 'username and password are required' });
    return;
  }

  const user = DEMO_USERS.find((u) => u.username === username);
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign(
    { username: user.username, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '8h' }
  );

  res.json({ token, user: { username: user.username, role: user.role } });
});

export default router;
