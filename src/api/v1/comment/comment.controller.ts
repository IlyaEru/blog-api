import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Comment from './comment.model';

const getComments = async (req: Request, res: Response) => {
  const { postId } = req.query;
  if (postId && typeof postId !== 'string') {
    return res.status(400).json({ message: 'Invalid postId' });
  }
  if (postId && !mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: 'Invalid postId' });
  }
  try {
    let comments;
    if (postId) {
      console.log({ postId });

      comments = await Comment.find({ post: postId });
    } else {
      comments = await Comment.find();
    }

    res.status(200).json({ comments });
  } catch (error) {
    console.log(error);

    res.sendStatus(500);
  }
};

const getComment = async (req: Request, res: Response) => {
  const { id: commentId } = req.params;
  try {
    const comment = await Comment.findOne({ _id: commentId });
    if (comment) {
      res.status(200).json({ comment });
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

const createComment = async (req: Request, res: Response) => {
  const { body, name, postId } = req.body;
  console.log({ body, name, postId });

  if (!body) {
    return res.status(400).json({ message: 'Body is required' });
  } else if (body.trim().length < 3) {
    return res
      .status(400)
      .json({ message: 'Body must be at least 3 characters long' });
  } else if (body.trim().length > 1000) {
    return res
      .status(400)
      .json({ message: 'Body must be less than 1000 characters long' });
  } else if (name && name.trim().length > 100) {
    return res
      .status(400)
      .json({ message: 'Name must be less than 100 characters long' });
  } else if (name && name.trim().length < 3) {
    return res
      .status(400)
      .json({ message: 'Name must be at least 3 characters long' });
  } else if (!postId) {
    return res.status(400).json({ message: 'PostId is required' });
  }
  try {
    const comment = await Comment.create({ post: postId, body, name });
    res.status(201).json({ comment });
  } catch (error) {
    console.log({ error });

    res.sendStatus(500);
  }
};

const updateComment = async (req: Request, res: Response) => {
  const { id: commentId } = req.params;
  const { body, name } = req.body;

  if (!body) {
    return res.status(400).json({ message: 'Body is required' });
  } else if (body.trim().length < 3) {
    return res
      .status(400)
      .json({ message: 'Body must be at least 3 characters long' });
  } else if (body.trim().length > 1000) {
    return res
      .status(400)
      .json({ message: 'Body must be less than 1000 characters long' });
  } else if (name && name.trim().length > 100) {
    return res
      .status(400)
      .json({ message: 'Name must be less than 100 characters long' });
  } else if (name && name.trim().length < 3) {
    return res
      .status(400)
      .json({ message: 'Name must be at least 3 characters long' });
  }

  try {
    const comment = await Comment.findOneAndUpdate(
      { _id: commentId },
      { body, name },
      { new: true },
    );
    if (comment) {
      res.status(200).json({ comment });
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

const deleteComment = async (req: Request, res: Response) => {
  const { id: commentId } = req.params;

  try {
    const deleteResponse = await Comment.deleteOne({ _id: commentId });
    if (deleteResponse.deletedCount === 1) {
      res.sendStatus(204);
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

export { getComments, getComment, createComment, updateComment, deleteComment };
