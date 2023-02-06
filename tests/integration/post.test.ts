import request from 'supertest';

import app from '../../src/app';
import { setUpTestDb } from '../utils/setupTestDb';
import { faker } from '@faker-js/faker';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import moment from 'moment';
import User from '../../src/modules/user/user.model';
import { tokenService } from '../../src/modules/token';

// import authMiddleware from './auth.middleware';

setUpTestDb();

const postData = {
  title: faker.name.firstName(),
  body: faker.lorem.paragraph(),
};

describe('Post Integration', () => {
  describe('Get posts', () => {
    test('should return 200 if posts exist', async () => {
      const response = await request(app).get('/api/v1/posts');
      expect(response.status).toBe(200);
    });

    test('should get posts by id', async () => {
      const userData = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      await request(app).post('/api/v1/auth/register').send(userData);
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(userData);

      const accessToken = loginResponse.body.tokens.access.token;
      const tokenResponse = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(postData);

      const postId = tokenResponse.body.post._id;
      const postResponse = await request(app).get(`/api/v1/posts/${postId}`);
      expect(postResponse.status).toBe(200);
    });
  });

  describe('POST auth middleware ', () => {
    test('should return 201 if token valid', async () => {
      const userData = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      await request(app).post('/api/v1/auth/register').send(userData);
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(userData);

      const accessToken = loginResponse.body.tokens.access.token;

      const tokenResponse = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(postData);

      expect(tokenResponse.status).toBe(201);
    });

    test('should return 401 if no token is provided', async () => {
      const noTokenResponse = await request(app)
        .post('/api/v1/posts')
        .send(postData);
      expect(noTokenResponse.status).toBe(401);
    });

    test('should return 401 if token is refresh and not access', async () => {
      const userData = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      await request(app).post('/api/v1/auth/register').send(userData);
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(userData);

      const refreshToken = loginResponse.body.tokens.refresh.token;

      const tokenResponse = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${refreshToken}`)
        .send(postData);

      expect(tokenResponse.status).toBe(401);
    });

    test('should return 401 if token is invalid', async () => {
      const invalidJWT = jwt.sign(
        { userId: new mongoose.Types.ObjectId() },
        'invalidSecret',
        {
          expiresIn: '15m',
        },
      );
      const invalidTokenResponse = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${invalidJWT}`)
        .send(postData);
      expect(invalidTokenResponse.status).toBe(401);
    });

    test('should return 401 if token is expired', async () => {
      const userData = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      const expires = moment().subtract(1, 'minutes');
      const user = await User.create(userData);
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
      const tokenResponse = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${refreshToken}`)
        .send(postData);
      expect(tokenResponse.status).toBe(401);
    });

    test('should return 401 if token is revoked', async () => {
      const userData = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      const expires = moment().add(1, 'minutes');
      const user = await User.create(userData);
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
      const tokenResponse = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${refreshToken}`)
        .send(postData);
      expect(tokenResponse.status).toBe(401);
    });
  });

  describe('PUT auth middleware ', () => {
    test('should return 200 if token valid', async () => {
      const userData = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      await request(app).post('/api/v1/auth/register').send(userData);
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(userData);

      const accessToken = loginResponse.body.tokens.access.token;

      const newPost = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(postData);

      const tokenResponse = await request(app)
        .put(`/api/v1/posts/${newPost.body.post._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: faker.lorem.sentence(),
          body: faker.lorem.paragraph(),
        });

      expect(tokenResponse.status).toBe(200);
    });
    test('should return 401 without token', async () => {
      const noTokenResponse = await request(app)
        .put('/api/v1/posts/1')
        .send(postData);
      expect(noTokenResponse.status).toBe(401);
    });
  });

  describe('PUT auth middleware ', () => {
    test('should return 404 if token valid but post doesnt exist', async () => {
      const userData = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      await request(app).post('/api/v1/auth/register').send(userData);
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(userData);

      const accessToken = loginResponse.body.tokens.access.token;

      const tokenResponse = await request(app)
        .put(`/api/v1/posts/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(postData);

      expect(tokenResponse.status).toBe(404);
    });
    test('should return 401 without token', async () => {
      const noTokenResponse = await request(app)
        .put('/api/v1/posts/1')
        .send(postData);
      expect(noTokenResponse.status).toBe(401);
    });

    test('should return 401 if token is refresh and not access', async () => {
      const userData = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      await request(app).post('/api/v1/auth/register').send(userData);
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(userData);

      const refreshToken = loginResponse.body.tokens.refresh.token;

      const tokenResponse = await request(app)
        .put('/api/v1/posts/1')
        .set('Authorization', `Bearer ${refreshToken}`)
        .send(postData);

      expect(tokenResponse.status).toBe(401);
    });

    test('should return 401 if token is invalid', async () => {
      const invalidJWT = jwt.sign(
        { userId: new mongoose.Types.ObjectId() },
        'invalidSecret',
        {
          expiresIn: '15m',
        },
      );
      const invalidTokenResponse = await request(app)
        .put('/api/v1/posts/1')
        .set('Authorization', `Bearer ${invalidJWT}`)
        .send(postData);
      expect(invalidTokenResponse.status).toBe(401);
    });
  });

  describe('DELETE auth middleware ', () => {
    test('should return 204 if token valid', async () => {
      const userData = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      await request(app).post('/api/v1/auth/register').send(userData);
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(userData);

      const accessToken = loginResponse.body.tokens.access.token;

      const newPost = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(postData);

      const tokenResponse = await request(app)
        .delete(`/api/v1/posts/${newPost.body.post._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: faker.lorem.sentence(),
          body: faker.lorem.paragraph(),
        });

      expect(tokenResponse.status).toBe(204);
    });
    test('should return 401 without token', async () => {
      const noTokenResponse = await request(app)
        .delete('/api/v1/posts/1')
        .send(postData);
      expect(noTokenResponse.status).toBe(401);
    });

    test('should return 404 if token valid but post doesnt exist', async () => {
      const userData = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      await request(app).post('/api/v1/auth/register').send(userData);
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(userData);

      const accessToken = loginResponse.body.tokens.access.token;

      const tokenResponse = await request(app)
        .delete(`/api/v1/posts/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(postData);

      expect(tokenResponse.status).toBe(404);
    });

    test('should return 401 if token is refresh and not access', async () => {
      const userData = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      await request(app).post('/api/v1/auth/register').send(userData);
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(userData);

      const refreshToken = loginResponse.body.tokens.refresh.token;

      const tokenResponse = await request(app)
        .delete('/api/v1/posts/1')
        .set('Authorization', `Bearer ${refreshToken}`)
        .send(postData);

      expect(tokenResponse.status).toBe(401);
    });

    test('should return 401 if token is invalid', async () => {
      const invalidJWT = jwt.sign(
        { userId: new mongoose.Types.ObjectId() },
        'invalidSecret',
        {
          expiresIn: '15m',
        },
      );
      const userData = {
        username: faker.name.firstName(),
        password: faker.internet.password(),
      };
      await request(app).post('/api/v1/auth/register').send(userData);
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(userData);

      const accessToken = loginResponse.body.tokens.access.token;
      const newPost = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(postData);
      const invalidTokenResponse = await request(app)
        .delete(`/api/v1/posts/${newPost.body.post._id}`)
        .set('Authorization', `Bearer ${invalidJWT}`)
        .send(postData);
      expect(invalidTokenResponse.status).toBe(401);
    });
  });
});
