import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  username: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalid or expired' });
  }
}

export function requireSupervisor(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== 'supervisor') {
    res.status(403).json({ error: 'Supervisor role required' });
    return;
  }
  next();
}
