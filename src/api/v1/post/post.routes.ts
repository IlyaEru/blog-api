import express from 'express';
import { authMiddleware } from '../auth';

import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} from './post.controller';

const router = express.Router();

router.get('/', getPosts);

router.get('/:id', getPost);

router.post('/', authMiddleware, createPost);

router.put('/:id', authMiddleware, updatePost);

router.delete('/:id', authMiddleware, deletePost);

export default router;
