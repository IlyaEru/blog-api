import mongoose from 'mongoose';
import request from 'supertest';

import app from '../../../app';
import { setUpTestDb } from '../../../../tests/utils/setupTestDb';
import { faker } from '@faker-js/faker';
import User from '../../../modules/user/user.model';
import Token from '../../../modules/token/token.model';
import { tokenService } from '../../../modules/token';
import moment from 'moment';
import authMiddleware from './auth.middleware';

setUpTestDb();

describe('auth route', () => {
  describe('POST /api/v1/auth/register', () => {
    test('should register a new user', async () => {
      const newUser = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /json/);

      expect(res.body.user).toHaveProperty('_id');
      expect(res.body.user.password).not.toBe(newUser.password);
      expect(res.body.user).toEqual(
        expect.objectContaining({
          username: newUser.username,
        }),
      );

      const dbUser = await User.findById(res.body.user._id);
      expect(dbUser).not.toBeNull();
    });

    test('should not register a new user with a username that is less than 3 characters long', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'ab',
          password: faker.internet.password(),
        })
        .expect(400);
    });

    test('should not register a new user with a username that is more than 100 characters long', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'a'.repeat(101),
          password: faker.internet.password(),
        })
        .expect(400);
    });

    test('should not register a new user with a password that is less than 3 characters long', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: faker.name.firstName(),
          password: 'ab',
        })
        .expect(400);
    });

    test('should not register a new user with a password that is more than 100 characters long', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: faker.name.firstName(),
          password: 'a'.repeat(101),
        })
        .expect(400);
    });

    test('should not register a new user with a username that is already taken', async () => {
      const newUser = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      await request(app)
        .post('/api/v1/auth/register')
        .send(newUser)
        .expect(201);

      await request(app)
        .post('/api/v1/auth/register')
        .send(newUser)
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    test('should return 200 and login user if email and password match', async () => {
      const newUser = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      await User.create(newUser);
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(res.body.tokens).toEqual({
        access: {
          token: expect.any(String),
          expires: expect.any(String),
        },
        refresh: {
          token: expect.any(String),
          expires: expect.any(String),
        },
      });

      const dbUser = await User.findById(res.body.user._id);
      expect(dbUser).not.toBeNull();

      const dbToken = await Token.findOne({
        token: res.body.tokens.refresh.token,
      });

      expect(dbToken).not.toBeNull();
    });

    test('should return 400 if username is not found', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: faker.name.firstName(),
          password: faker.internet.password(),
        })
        .expect(400);
    });

    test('should return 400 if password is incorrect', async () => {
      const newUser = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      await User.create(newUser);
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: newUser.username,
          password: faker.internet.password(),
        })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    test('should return 204 if refresh token is valid', async () => {
      const newUser = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      await User.create(newUser);
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /json/);

      await request(app)
        .post('/api/v1/auth/logout')
        .send({
          refreshToken: res.body.tokens.refresh.token,
        })
        .expect(204);

      const dbToken = await Token.findOne({
        token: res.body.tokens.refresh.token,
      });

      expect(dbToken).toBeNull();
    });

    test('should return 404 error if refresh token is not found in the database', async () => {
      const newUser = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      await User.create(newUser);
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /json/);

      await request(app)
        .post('/api/v1/auth/logout')
        .send({
          refreshToken: res.body.tokens.refresh.token,
        })
        .expect(204);

      const dbToken = await Token.findOne({
        token: res.body.tokens.refresh.token,
      });

      expect(dbToken).toBeNull();

      await request(app)
        .post('/api/v1/auth/logout')
        .send({
          refreshToken: res.body.tokens.refresh.token,
        })
        .expect(404);
    });

    test('should return 404 error if refresh token is blacklisted', async () => {
      const newUser = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      const expires = moment().add(10, 'days');
      const user = await User.create(newUser);
      const refreshToken = tokenService.generateToken(
        user._id,
        'refresh',
        expires,
      );
      await tokenService.saveToken(
        user._id,
        refreshToken,
        'refresh',
        expires,
        true,
      );

      await request(app)
        .post('/api/v1/auth/logout')
        .send({
          refreshToken,
        })
        .expect(404);
    });
  });
  describe('POST /v1/auth/refresh-tokens', () => {
    test('should return 200 and new auth tokens if refresh token is valid', async () => {
      const newUser = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      await User.create(newUser);
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(newUser)
        .expect(200);
      await request(app)
        .post('/api/v1/auth/refresh-tokens')
        .send({
          refreshToken: res.body.tokens.refresh.token,
        })
        .expect(200)
        .expect('Content-Type', /json/);

      expect(res.body.tokens).toEqual({
        access: {
          token: expect.any(String),
          expires: expect.any(String),
        },
        refresh: {
          token: expect.any(String),
          expires: expect.any(String),
        },
      });
    });

    test('should return 400 error if refresh token is missing from request body', async () => {
      await request(app)
        .post('/api/v1/auth/refresh-tokens')
        .send({})
        .expect(400);
    });

    test('should return 401 error if refresh token is not found in the database', async () => {
      const newUser = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      await User.create(newUser);
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(newUser)
        .expect(200);

      await request(app)
        .post('/api/v1/auth/logout')
        .send({
          refreshToken: res.body.tokens.refresh.token,
        })
        .expect(204);

      await request(app)
        .post('/api/v1/auth/refresh-tokens')
        .send({
          refreshToken: res.body.tokens.refresh.token,
        })
        .expect(401);
    });

    test('should return 401 error if refresh token is blacklisted', async () => {
      const newUser = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      const expires = moment().add(10, 'days');
      const user = await User.create(newUser);
      const refreshToken = tokenService.generateToken(
        user._id,
        'refresh',
        expires,
      );
      await tokenService.saveToken(
        user._id,
        refreshToken,
        'refresh',
        expires,
        true,
      );

      await request(app)
        .post('/api/v1/auth/refresh-tokens')
        .send({
          refreshToken,
        })
        .expect(401);
    });

    test('should return 401 error if refresh token is expired', async () => {
      const newUser = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      const expires = moment().subtract(1, 'minutes');
      const user = await User.create(newUser);
      const refreshToken = tokenService.generateToken(
        user._id,
        'refresh',
        expires,
      );
      await tokenService.saveToken(
        user._id,
        refreshToken,
        'refresh',
        expires,
        false,
      );

      await request(app)
        .post('/api/v1/auth/refresh-tokens')
        .send({
          refreshToken,
        })
        .expect(401);
    });

    test('should return 401 error if user is not found', async () => {
      const newUser = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      const expires = moment().add(10, 'days');
      const user = await User.create(newUser);

      const refreshToken = tokenService.generateToken(
        user._id,
        'refresh',
        expires,
      );

      await tokenService.saveToken(
        user._id,
        refreshToken,
        'refresh',
        expires,
        false,
      );

      await User.deleteMany();

      await request(app)
        .post('/api/v1/auth/refresh-tokens')
        .send({
          refreshToken,
        })
        .expect(401);
    });
  });
});
