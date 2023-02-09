import mongoose, { Document } from 'mongoose';

export interface IPost {
  title: string;
  body: string;
  createdAt: Date;
  comments: mongoose.Types.ObjectId[];
  published: boolean;
}

export interface IPostModel extends mongoose.Model<IPost> {
  isPostTitleTaken(title: string, id?: string): Promise<boolean>;
}

export interface IPostDocument extends IPost, Document {}
