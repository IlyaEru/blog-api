import mongoose from 'mongoose';
import Token from '../../../modules/token/token.model';
import {
  generateAuthTokens,
  verifyToken,
} from '../../../modules/token/token.service';
import {
  getUserById,
  getUserByUsername,
} from '../../../modules/user/user.service';

const loginUserWithUsernameAndPassword = async (
  username: string,
  password: string,
) => {
  const user = await getUserByUsername(username);
  if (!user || !(await user.isPasswordMatch(password))) {
    return new Error('Invalid username or password');
  }
  return user;
};

const logout = async (refreshToken: string) => {
  const refreshTokenDoc = await Token.findOne({
    token: refreshToken,
    type: 'refresh',
    blacklisted: false,
  });
  if (!refreshTokenDoc) {
    return new Error('No token found');
  }
  await refreshTokenDoc.remove();
};

const refreshAuth = async (refreshToken: string) => {
  try {
    const refreshTokenDoc = await verifyToken(refreshToken, 'refresh');
    if (!refreshTokenDoc) {
      return new Error();
    }

    const user = await getUserById(refreshTokenDoc.user);
    if (!user) {
      return new Error();
    }
    await refreshTokenDoc.remove();
    const tokens = await generateAuthTokens(user.id);
    return { user, tokens };
  } catch (error) {
    return new Error('Invalid refresh token');
  }
};

export { loginUserWithUsernameAndPassword, logout, refreshAuth };
