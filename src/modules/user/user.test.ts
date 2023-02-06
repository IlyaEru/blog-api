import { setUpTestDb } from '../../../tests/utils/setupTestDb';
import User from './user.model';
import mongoose from 'mongoose';

setUpTestDb();

const userData = {
  username: 'test',
  password: 'password',
};

describe('User model', () => {
  test('should create a new user', async () => {
    const user = await User.create(userData);
    expect(user.username).toBe(userData.username);
    expect(user.password).not.toBe(userData.password);
  });

  test('should not create a new user with a username that is less than 3 characters long', async () => {
    await expect(User.create({ ...userData, username: 'ab' })).rejects.toThrow(
      'User validation failed',
    );
  });

  test('should not create a new user with a username that is more than 100 characters long', async () => {
    await expect(
      User.create({ ...userData, username: 'a'.repeat(101) }),
    ).rejects.toThrow('User validation failed');
  });

  test('should not create a new user with a password that is less than 3 characters long', async () => {
    await expect(User.create({ ...userData, password: 'ab' })).rejects.toThrow(
      'User validation failed',
    );
  });

  test('should not create a new user with a password that is more than 100 characters long', async () => {
    await expect(
      User.create({ ...userData, password: 'a'.repeat(101) }),
    ).rejects.toThrow('User validation failed');
  });

  test('should get all users', async () => {
    const users = await User.find();
    expect(users).toHaveLength(0);
  });

  test('should get a user by id', async () => {
    const user = await User.create(userData);

    const createUser = await User.findById(user._id);
    expect(createUser?.username).toBe(userData.username);
  });

  test('should get a user by username', async () => {
    const user = await User.create(userData);
    const createUser = await User.find({ username: user.username });
    expect(createUser).toHaveLength(1);
  });

  test('should return false if the username is not taken', async () => {
    const isTaken = await User.isUsernameTaken('test');
    expect(isTaken).toBe(false);
  });

  test('should return true if the username is already taken', async () => {
    await User.create(userData);
    const isTaken = await User.isUsernameTaken('test');
    expect(isTaken).toBe(true);
  });

  test('should return true if the password match', async () => {
    const user = await User.create(userData);
    const isMatch = await user.isPasswordMatch('password');
    expect(isMatch).toBe(true);
  });

  test('should return false if the password does not match', async () => {
    const user = await User.create(userData);
    const isMatch = await user.isPasswordMatch('password1');
    expect(isMatch).toBe(false);
  });

  test('should delete all users that match the criteria', async () => {
    await User.create({ username: 'user1', password: 'pass' });
    await User.create({ username: 'user2', password: 'pass' });
    await User.deleteMany({ username: 'user1' });
    const users = await User.find({});
    expect(users).toHaveLength(1);
  });

  test('should update one user that matches the criteria', async () => {
    const user = await User.create({ username: 'user1', password: 'pass' });
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { username: 'user2' },
      { new: true },
    );
    expect(updatedUser?.username).toBe('user2');
  });
});
