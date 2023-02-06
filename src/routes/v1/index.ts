import express from 'express';

import postRoutes from '../../api/v1/post';
import commentRoutes from '../../api/v1/comment';
import authRoutes from '../../api/v1/auth';

const router = express.Router();

// api/v1 routes
router.use('/posts', postRoutes);

router.use('/comments', commentRoutes);

router.use('/auth', authRoutes);

export default router;
