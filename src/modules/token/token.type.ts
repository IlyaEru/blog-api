/* eslint-disable @typescript-eslint/no-empty-interface */
import mongoose, { Document, Model } from 'mongoose';

export interface IToken {
  token: string;
  user: mongoose.Schema.Types.ObjectId;
  type: 'access' | 'refresh';
  expires: Date;
  blacklisted: boolean;
}

export type NewToken = Omit<IToken, 'blacklisted'>;

export interface ITokenDocument extends IToken, Document {}

export interface ITokenModel extends Model<ITokenDocument> {}
