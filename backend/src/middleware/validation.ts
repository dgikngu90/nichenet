import { Request, Response, NextFunction } from 'express';

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.details[0].message,
        },
      });
    }
    next();
  };
};

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Trim strings and remove extra whitespace
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.trim();
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitize(req.body);
  next();
};

export const rateLimitByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // This is a placeholder - in production, use Redis-based rate limiting
  const userId = (req as any).user?.id;
  if (userId) {
    // Store rate limit data in cache/redis
  }
  next();
};
