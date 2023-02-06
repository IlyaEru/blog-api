import bcrypt from 'bcryptjs';

import { Request, Response } from 'express';
import User from './user.model';

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).sendStatus(500);
  }
};

const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).sendStatus(500);
  }
};

const createUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username.trim() || !password.trim()) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).sendStatus(500);
  }
};

const updateUser = async (req: Request, res: Response) => {
  const { id: userId } = req.params;
  const { username, password } = req.body;
  if (!username.trim() || !password.trim()) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.findByIdAndUpdate(
      { _id: userId },
      { username, password: hashedPassword },
      { new: true },
    );
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

const deleteUser = async (req: Request, res: Response) => {
  const { id: userId } = req.params;
  try {
    const deleteResponse = await User.deleteOne({ _id: userId });
    if (deleteResponse.deletedCount === 1) {
      res.status(200).json({ message: 'User deleted' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

export { getAllUsers, getUser, createUser, updateUser, deleteUser };
