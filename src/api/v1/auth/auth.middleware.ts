import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = user;
    return next();
  })(req, res, next);
};

export default authMiddleware;
