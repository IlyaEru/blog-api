import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import moment, { Moment } from 'moment';

import Token from './token.model';
import mongoose from 'mongoose';

// Access Env Variables
dotenv.config();

// JWT Secrets
const refreshSecret = process.env.JWT_REFRESH_SECRET;
const accessSecret = process.env.JWT_ACCESS_SECRET;

// JWT Expires In
const refreshExpiresInDays = process.env.JWT_REFRESH_EXPIRES_IN_DAYS;
const accessExpiresInMinutes = process.env.JWT_ACCESS_EXPIRES_IN_MINUTES;

if (
  !refreshSecret ||
  !accessSecret ||
  !refreshExpiresInDays ||
  !accessExpiresInMinutes
) {
  throw new Error('JWT Secrets or Expires In not found');
}

const generateToken = (
  userId: mongoose.Types.ObjectId,
  type: 'access' | 'refresh',
  expires: Moment,
): string => {
  const payload = {
    sub: userId,
    type,
    iat: moment().unix(),
    exp: expires.unix(),
  };
  return jwt.sign(payload, type === 'access' ? accessSecret : refreshSecret);
};

const saveToken = async (
  userId: mongoose.Types.ObjectId,
  token: string,
  type: 'access' | 'refresh',
  expires: Moment,

  blacklisted = false,
) => {
  const tokenData = await Token.create({
    token,
    user: userId,
    type,
    expires: expires.toDate(),
    blacklisted,
  });
  return tokenData;
};

// Verify token and return token doc (or throw an error if it is not valid)
const verifyToken = (token: string, type: 'access' | 'refresh') => {
  const payload = jwt.verify(
    token,
    type === 'access' ? accessSecret : refreshSecret,
  );
  if (typeof payload.sub !== 'string') {
    throw new Error('Invalid token user');
  }

  const tokenDoc = Token.findOne({
    token,
    user: payload.sub,
    type,
    blacklisted: false,
  });

  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

const generateAuthTokens = async (userId: mongoose.Types.ObjectId) => {
  // moment expiration dates
  const accessExpires = moment().add(accessExpiresInMinutes, 'minutes');
  const refreshExpires = moment().add(refreshExpiresInDays, 'days');

  // Generate an access and refresh token
  const accessToken = generateToken(userId, 'access', accessExpires);
  const refreshToken = generateToken(userId, 'refresh', refreshExpires);

  // Save the refresh token
  await saveToken(userId, refreshToken, 'refresh', refreshExpires);
  return {
    access: {
      token: accessToken,
      expires: accessExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshExpires.toDate(),
    },
  };
};

export { generateAuthTokens, verifyToken, generateToken, saveToken };
