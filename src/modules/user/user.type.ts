import mongoose, { Document } from 'mongoose';

export interface IUser {
  username: string;
  password: string;
}

export interface IUserDocument extends IUser, Document {
  isPasswordMatch(password: string): Promise<boolean>;
}

export interface IUserModel extends mongoose.Model<IUserDocument> {
  isUsernameTaken(username: string, id?: string): Promise<boolean>;
}
