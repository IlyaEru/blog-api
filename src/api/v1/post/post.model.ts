import mongoose from 'mongoose';
import { IPostDocument, IPostModel } from './post.type';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minLength: 3,
      maxLength: 100,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 10000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
  },
);

postSchema.pre(['deleteOne', 'findOneAndDelete'], async function (next) {
  const postId = this.getQuery()._id;

  await mongoose.model('Comment').deleteMany({
    post: postId,
  });

  next();
});

postSchema.static('isPostTitleTaken', async function (title: string) {
  const post = await this.findOne({
    title: { $regex: new RegExp(title, 'i') },
  });
  return !!post;
});

const Post = mongoose.model<IPostDocument, IPostModel>('Post', postSchema);

export default Post;
