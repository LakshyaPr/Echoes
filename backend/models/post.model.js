import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    img: {
      type: String,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likecount: {
      type: Number,
      default: 0,
    },
    reposts: [
      {
        repostuserid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        repostpostid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Post",
        },
      },
    ],
    repostedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    repostedFromUsername: {
      type: String,
      default: null,
    },
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
