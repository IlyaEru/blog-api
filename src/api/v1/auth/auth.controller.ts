import { Request, Response } from 'express';
import { userService } from '../../../modules/user';
import { tokenService } from '../../../modules/token';
import * as authService from './auth.service';

import { body, validationResult } from 'express-validator';
import User from '../../../modules/user/user.model';

const register = [
  body('username')
    .isLength({ min: 3, max: 100 })
    .withMessage('Username required'),
  body('password')
    .isLength({ min: 3, max: 100 })
    .withMessage('Password required'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    const isUsernameTaken = await User.isUsernameTaken(username);

    if (isUsernameTaken) {
      return res.status(400).json({ message: 'Username is already taken' });
    }
    const user = await userService.createUser({ username, password });
    if (user instanceof Error) {
      return res.status(400).json({ message: user.message });
    }
    res.status(201).json({ user });
  },
];

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  if (!username.trim() || !password.trim()) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  const user = await authService.loginUserWithUsernameAndPassword(
    username,
    password,
  );
  if (user instanceof Error) {
    return res.status(400).json({ message: user.message });
  }
  const tokens = await tokenService.generateAuthTokens(user.id);
  res.json({ user, tokens });
};

const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token required' });
  }
  const logoutResponse = await authService.logout(refreshToken);
  if (logoutResponse instanceof Error) {
    return res.status(404).json({ message: logoutResponse.message });
  }
  res.sendStatus(204);
};

const refreshTokens = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token required' });
  }
  const userWithTokens = await authService.refreshAuth(refreshToken);

  if (userWithTokens instanceof Error) {
    return res.status(401).json({ message: userWithTokens.message });
  }
  res.json(userWithTokens);
};

export { register, login, logout, refreshTokens };
