import { Request, Response } from 'express';
import Post from './post.model';

const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find();
    res.status(200).json({ posts });
  } catch (error) {
    res.sendStatus(500);
  }
};

const getPost = async (req: Request, res: Response) => {
  const { id: postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (post) {
      res.status(200).json({ post });
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

const createPost = async (req: Request, res: Response) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ message: 'Title and body are required' });
  } else if (await Post.isPostTitleTaken(title)) {
    return res.status(400).json({ message: 'Title is already taken' });
  } else if (title.trim().length < 3 || body.trim().length < 3) {
    return res
      .status(400)
      .json({ message: 'Title and body must be at least 3 characters long' });
  } else if (title.trim().length > 100 || body.trim().length > 10000) {
    return res.status(400).json({
      message: 'Title and body must be less than 100 and 10000 characters long',
    });
  }
  try {
    const post = await Post.create({ title, body });
    res.status(201).json(post);
  } catch (error) {
    console.log(error);
  }
};

const updatePost = async (req: Request, res: Response) => {
  const { id: postId } = req.params;
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ message: 'Title and body are required' });
  } else if (await Post.isPostTitleTaken(title, postId)) {
    return res.status(400).json({ message: 'Title is already taken' });
  } else if (title.trim().length < 3 || body.trim().length < 3) {
    return res
      .status(400)
      .json({ message: 'Title and body must be at least 3 characters long' });
  } else if (title.trim().length > 100 || body.trim().length > 10000) {
    return res.status(400).json({
      message: 'Title and body must be less than 100 and 10000 characters long',
    });
  }
  try {
    const post = await Post.findByIdAndUpdate(
      postId,
      { title, body },
      { new: true },
    );
    if (post) {
      res.status(200).json({ post });
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

const publishPost = async (req: Request, res: Response) => {
  const { id: postId } = req.params;
  try {
    const post = await Post.findByIdAndUpdate(
      postId,
      { published: true },
      { new: true },
    );
    if (post) {
      res.status(200).json({ post });
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

const unpublishPost = async (req: Request, res: Response) => {
  const { id: postId } = req.params;
  try {
    const post = await Post.findByIdAndUpdate(
      postId,
      { published: false },
      { new: true },
    );
    if (post) {
      res.status(200).json({ post });
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

const deletePost = async (req: Request, res: Response) => {
  const { id: postId } = req.params;
  try {
    const deleteResponse = await Post.deleteOne({ _id: postId });
    if (deleteResponse.deletedCount === 1) {
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

export {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
};
