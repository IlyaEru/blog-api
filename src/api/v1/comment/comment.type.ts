import mongoose from 'mongoose';

export interface IComment {
  post: mongoose.Types.ObjectId;
  body: string;
  createdAt: Date;
  name: string;
}
