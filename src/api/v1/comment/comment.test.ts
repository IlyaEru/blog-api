import { setUpTestDb } from '../../../../tests/utils/setupTestDb';
import Post from '../post/post.model';
import Comment from './comment.model';
import mongoose from 'mongoose';

setUpTestDb();

const commentData = {
  name: 'name',
  body: 'body',
  post: new mongoose.Types.ObjectId(),
};

describe('Comment model', () => {
  test('should create a new comment', async () => {
    const comment = await Comment.create(commentData);
    expect(comment).toMatchObject(commentData);
  });

  test('should not create a new comment with a name that is less than 3 characters long', async () => {
    await expect(
      Comment.create({ ...commentData, name: 'ab' }),
    ).rejects.toThrow('Comment validation failed');
  });

  test('should not create a new comment with a name that is more than 100 characters long', async () => {
    await expect(
      Comment.create({ ...commentData, name: 'a'.repeat(101) }),
    ).rejects.toThrow('Comment validation failed');
  });

  test('should not create a new comment with a body that is less than 3 characters long', async () => {
    await expect(
      Comment.create({ ...commentData, body: 'ab' }),
    ).rejects.toThrow('Comment validation failed');
  });

  test('should not create a new comment with a body that is more than 1000 characters long', async () => {
    await expect(
      Comment.create({ ...commentData, body: 'a'.repeat(1001) }),
    ).rejects.toThrow('Comment validation failed');
  });

  test('should get all comments', async () => {
    const comments = await Comment.find();
    expect(comments).toHaveLength(0);
  });

  test('should get a comment by id', async () => {
    const comment = await Comment.create(commentData);
    const commentQuery = await Comment.findById(comment._id);
    expect(commentQuery).toMatchObject(commentData);
  });

  test('should get a comment by post id', async () => {
    const comment = await Comment.create(commentData);
    const commentQuery = await Comment.find({ post: comment.post });
    expect(commentQuery).toHaveLength(1);
  });

  test('should update a comment by id', async () => {
    const comment = await Comment.create(commentData);
    const commentQuery = await Comment.findByIdAndUpdate(
      comment._id,
      { name: 'new name' },
      { new: true },
    );
    expect(commentQuery).toMatchObject({ ...commentData, name: 'new name' });
  });

  test('should createdAt be defined', async () => {
    const comment = await Comment.create(commentData);
    expect(comment.createdAt).toBeDefined();
    expect(comment.createdAt).toBeInstanceOf(Date);
  });
});
