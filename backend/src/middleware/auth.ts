import { Request, Response, NextFunction } from 'express';
import { SecurityUtils } from '../utils/security';
import { db } from '../config/firebase';
import { User } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: Partial<User>;
      token?: string;
      clientIP?: string;
      userAgent?: string;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = SecurityUtils.verifyToken(token);

    if (!decoded) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Fetch user from Firestore
    const userDoc = await db.collection('users').doc(decoded.uid).get();

    if (!userDoc.exists) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const user = userDoc.data() as User;

    // Check if user is banned
    if (user.role === 'banned') {
      res.status(403).json({ error: 'User account is banned' });
      return;
    }

    // Check if user is frozen
    if (user.isFrozen) {
      res.status(403).json({ error: 'User account is frozen' });
      return;
    }

    req.user = user;
    req.token = token;
    req.clientIP = req.ip || '';
    req.userAgent = req.headers['user-agent'] || '';

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    if (token) {
      const decoded = SecurityUtils.verifyToken(token);

      if (decoded) {
        const userDoc = await db.collection('users').doc(decoded.uid).get();

        if (userDoc.exists) {
          const user = userDoc.data() as User;
          if (user.role !== 'banned' && !user.isFrozen) {
            req.user = user;
            req.token = token;
          }
        }
      }
    }

    req.clientIP = req.ip || '';
    req.userAgent = req.headers['user-agent'] || '';

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.clientIP = req.ip || '';
    req.userAgent = req.headers['user-agent'] || '';
    next();
  }
};

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (req.user.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const editorMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (req.user.role !== 'editor' && req.user.role !== 'admin') {
      res.status(403).json({ error: 'Editor or Admin access required' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminPanelAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clientIP = req.ip || '';
    const userAgent = req.headers['user-agent'] || '';
    const deviceFingerprint = req.body.deviceFingerprint;

    // Get admin whitelist from environment
    const adminIPWhitelist = (process.env.ADMIN_IP_WHITELIST || '').split(',').filter(Boolean);

    // Check IP whitelist
    if (!adminIPWhitelist.includes(clientIP)) {
      console.warn(`Admin access attempt from unauthorized IP: ${clientIP}`);
      res.status(403).json({ error: 'Access denied. Invalid IP address.' });
      return;
    }

    // Verify user is admin
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    // Store device info in request for logging
    req.clientIP = clientIP;
    req.userAgent = userAgent;

    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
