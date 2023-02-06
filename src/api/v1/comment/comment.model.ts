import mongoose from 'mongoose';

import Post from '../post/post.model';

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    name: {
      type: String,
      required: false,
      trim: true,
      minLength: 3,
      maxLength: 100,
      default: 'Anonymous',
    },
    body: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 1000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  },
);

commentSchema.pre('save', async function (next) {
  const postId = this.post._id;

  await Post.findByIdAndUpdate(postId, {
    $push: { comments: this._id },
  });

  next();
});

commentSchema.pre(['deleteOne', 'findOneAndDelete'], async function (next) {
  const commentId = this.getQuery()._id;

  await Post.updateMany(
    {},
    {
      $pull: { comments: commentId },
    },
  );

  next();
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
