import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from '../config/environment';

// Helmet middleware for security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
  },
});

// Rate limiting middleware
export const createRateLimiter = (options?: Partial<rateLimit.Options>) => {
  return rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health';
    },
    ...options,
  });
};

// Specific rate limiters for different endpoints
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

// CSRF protection middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-csrf-token'] as string;

  if (!token) {
    return res.status(403).json({ error: 'CSRF token missing' });
  }

  // Store token for verification in controllers
  req.csrfToken = token;
  next();
};

// SQL Injection prevention - Input validation
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  const sqlInjectionPattern = /('|(\\)|(;)|(--)|(\/\*))/gi;

  for (const key in req.body) {
    if (typeof req.body[key] === 'string') {
      if (sqlInjectionPattern.test(req.body[key])) {
        console.warn(`Potential SQL injection attempt in field: ${key}`);
        return res.status(400).json({ error: 'Invalid input detected' });
      }
    }
  }

  next();
};

// XSS protection - Sanitize output
export const sanitizeOutput = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;

  res.json = function (data: any) {
    // Sanitize string values
    const sanitizeObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return obj
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }

      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }

      if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc: any, key) => {
          acc[key] = sanitizeObject(obj[key]);
          return acc;
        }, {});
      }

      return obj;
    };

    return originalJson.call(this, sanitizeObject(data));
  };

  next();
};

// Error handling middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Don't expose internal error details in production
  const message =
    config.server.nodeEnv === 'production'
      ? 'Internal server error'
      : err.message;

  res.status(err.status || 500).json({
    error: message,
    ...(config.server.nodeEnv !== 'production' && { details: err }),
  });
};

// Extend Express Request type for CSRF token
declare global {
  namespace Express {
    interface Request {
      csrfToken?: string;
    }
  }
}
