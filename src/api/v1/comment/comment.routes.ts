import express from 'express';
import { authMiddleware } from '../auth';
import {
  getComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
} from './comment.controller';

const router = express.Router();

router.get('/', getComments);

router.get('/:id', getComment);

router.post('/', createComment);

router.put('/:id', authMiddleware, updateComment);

router.delete('/:id', authMiddleware, deleteComment);

export default router;
