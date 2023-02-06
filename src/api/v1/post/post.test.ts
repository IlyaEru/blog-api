import { setUpTestDb } from '../../../../tests/utils/setupTestDb';
import Post from './post.model';
import Comment from '../comment/comment.model';
import mongoose from 'mongoose';

setUpTestDb();

const postData = {
  title: 'title',
  body: 'body',
};

const commentData = {
  name: 'name',
  body: 'body',
};

describe('Post model', () => {
  test('should create a new post', async () => {
    const post = await Post.create(postData);
    expect(post).toMatchObject(postData);
  });

  test('should not create a new post with a title that is already taken', async () => {
    await Post.create(postData);
    await expect(Post.create(postData)).rejects.toThrow(
      'E11000 duplicate key error collection',
    );
  });

  test('should not create a new post with a title that is less than 3 characters long', async () => {
    await expect(Post.create({ ...postData, title: 'ab' })).rejects.toThrow(
      'Post validation failed',
    );
  });

  test('should not create a new post with a title that is more than 100 characters long', async () => {
    await expect(
      Post.create({ ...postData, title: 'a'.repeat(101) }),
    ).rejects.toThrow('Post validation failed');
  });

  test('should not create a new post with a body that is less than 3 characters long', async () => {
    await expect(Post.create({ ...postData, body: 'ab' })).rejects.toThrow(
      'Post validation failed',
    );
  });

  test('should not create a new post with a body that is more than 10000 characters long', async () => {
    await expect(
      Post.create({ ...postData, body: 'a'.repeat(10001) }),
    ).rejects.toThrow('Post validation failed');
  });

  test('should get all posts', async () => {
    const posts = await Post.find();
    expect(posts).toHaveLength(0);
  });

  test('should get a post by id', async () => {
    const post = await Post.create(postData);
    const createdPost = await Post.findById(post._id);
    expect(createdPost).toMatchObject(postData);
  });

  test('should not get a post by id if it does not exist', async () => {
    await expect(
      Post.findById(new mongoose.Types.ObjectId()),
    ).resolves.toBeNull();
  });

  test('created post should have empty comments array and createdAt', async () => {
    const post = await Post.create(postData);
    expect(post.comments).toHaveLength(0);
    expect(post.createdAt).toBeDefined();
  });

  test('should update a post', async () => {
    const post = await Post.create(postData);
    const updatedPost = await Post.findByIdAndUpdate(
      post._id,
      { title: 'new title', body: 'new body' },
      { new: true },
    );
    expect(updatedPost).toMatchObject({ title: 'new title', body: 'new body' });
  });

  test('should not update a post if it does not exist', async () => {
    await expect(
      Post.findByIdAndUpdate(
        new mongoose.Types.ObjectId(),
        { title: 'new title', body: 'new body' },
        { new: true },
      ),
    ).resolves.toBeNull();
  });

  test('should delete a post', async () => {
    const post = await Post.create(postData);
    await Post.findByIdAndDelete(post._id);

    await expect(Post.findById(post._id)).resolves.toBeNull();
  });

  test('should not delete a post if it does not exist', async () => {
    await expect(
      Post.findByIdAndDelete(new mongoose.Types.ObjectId()),
    ).resolves.toBeNull();
  });

  test('should check if a post title is taken', async () => {
    await Post.create(postData);
    const isPostTitleTaken = await Post.isPostTitleTaken('title');
    expect(isPostTitleTaken).toBe(true);
  });

  test('should check if a post title is not taken', async () => {
    const isPostTitleTaken = await Post.isPostTitleTaken('title');
    expect(isPostTitleTaken).toBe(false);
  });

  test('should check if a post title is taken with a different case', async () => {
    await Post.create(postData);
    const isPostTitleTaken = await Post.isPostTitleTaken('TITLE');
    expect(isPostTitleTaken).toBe(true);
  });

  test('should add comment to the posts comments array', async () => {
    const post = await Post.create(postData);
    const comment = await Comment.create({ ...commentData, post: post._id });
    const afterCommentAdded = await Post.findById(post._id);

    expect(afterCommentAdded?.comments).toHaveLength(1);
    expect(afterCommentAdded?.comments[0]).toEqual(comment._id);
  });

  test('deleting comment using findByIdAndDelete should also delete the comment from the post', async () => {
    const post = await Post.create(postData);
    const comment = await Comment.create({ ...commentData, post: post._id });
    await Comment.findByIdAndDelete(comment._id);
    const afterCommentRemoved = await Post.findById(post._id);
    expect(afterCommentRemoved?.comments).toHaveLength(0);
  });

  // using deleteOne
  test('deleting comment using deleteOne should also delete the comment from the post', async () => {
    const post = await Post.create(postData);
    const comment = await Comment.create({ ...commentData, post: post._id });
    await Comment.deleteOne({ _id: comment._id });
    const afterCommentRemoved = await Post.findById(post._id);
    expect(afterCommentRemoved?.comments).toHaveLength(0);
  });

  test('deleting post using findByIdAndDelete should also delete its comments', async () => {
    const post = await Post.create(postData);
    await Comment.create({ ...commentData, post: post._id });
    await Comment.create({ ...commentData, post: post._id });

    await Post.findByIdAndDelete(post._id);
    const comments = await Comment.find();
    expect(comments).toHaveLength(0);
  });

  test('deleting post using deleteOne should also delete its comments', async () => {
    const post = await Post.create(postData);
    await Comment.create({ ...commentData, post: post._id });
    await Comment.create({ ...commentData, post: post._id });

    await Post.deleteOne({ _id: post._id });
    const comments = await Comment.find();
    expect(comments).toHaveLength(0);
  });
});
