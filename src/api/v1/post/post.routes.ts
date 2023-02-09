import express from 'express';
import { authMiddleware } from '../auth';

import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
} from './post.controller';

const router = express.Router();

router.get('/', getPosts);

router.get('/:id', getPost);

router.post('/', authMiddleware, createPost);

router.put('/:id', authMiddleware, updatePost);

router.put('/:id/publish', authMiddleware, publishPost);

router.put('/:id/unpublish', authMiddleware, unpublishPost);

router.delete('/:id', authMiddleware, deletePost);

export default router;
