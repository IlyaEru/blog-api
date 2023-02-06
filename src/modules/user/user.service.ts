import User from './user.model';
import { IUser } from './user.type';

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export const createUser = async (userBody: IUser) => {
  if (await User.isUsernameTaken(userBody.username)) {
    return new Error('Username already taken');
  }

  return User.create(userBody);
};

export const getUserById = async (id: mongoose.Schema.Types.ObjectId) => {
  return User.findById(id);
};

export const getUserByUsername = async (username: string) => {
  return User.findOne({ username });
};
