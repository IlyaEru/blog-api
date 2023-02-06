import express from 'express';

import { register, login, logout, refreshTokens } from './auth.controller';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-tokens', refreshTokens);

export default router;
