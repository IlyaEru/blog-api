import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { IUserDocument, IUserModel } from './user.type';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minLength: 3,
      maxLength: 100,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 100,
    },
  },
  {
    versionKey: false,
  },
);

userSchema.pre('save', async function (next) {
  const user = this as IUserDocument;

  if (!user.isModified('password')) {
    return next();
  }

  const hashedPassword = await bcrypt.hash(user.password, 10);

  user.password = hashedPassword;

  next();
});

userSchema.static(
  'isUsernameTaken',
  async function (username: string, id?: string) {
    const post = await this.findOne({
      username: { $regex: new RegExp(`^${username}$`, 'i') },
      _id: { $ne: id },
    });
    return !!post;
  },
);

userSchema.method('isPasswordMatch', async function (password: string) {
  return await bcrypt.compare(password, this.password);
});

const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);

export default User;
