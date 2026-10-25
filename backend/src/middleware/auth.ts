import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../config/jwt';
import prisma from '../config/db';

export interface AuthenticatedUser extends TokenPayload {
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { tailorProfile: true },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found or token invalid.' });
      return;
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      tailorProfileId: user.tailorProfile?.id,
    };

    next();
  } catch (error: any) {
    res.status(401).json({ success: false, message: 'Invalid or expired token', error: error.message });
  }
};

export const requireRole = (roles: Array<'CUSTOMER' | 'TAILOR'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles: ${roles.join(', ')}`,
      });
      return;
    }

    next();
  };
};
