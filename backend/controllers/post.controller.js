import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!text && !img)
      return res.status(400).json({ error: "Post must have a text or image" });
    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }
    const newPost = new Post({
      user: userId,
      text,
      img,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.log("Error in CreatePost controller", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (
      post.user.toString() !== req.user._id.toString() &&
      !(req.user._id.toString() === process.env.ADMIN_ID)
    ) {
      return res
        .status(401)
        .json({ error: "You are not authorized to delete this post" });
    }
    if (post.img) {
      const img = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(img);
    }
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in deletePost controller", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    if (!text) return res.status(400).json({ error: "Text field is required" });
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const comment = {
      user: userId,
      text,
    };
    post.comments.push(comment);
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.log("Error in commentOnPost controller", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const isLiked = post.likes.includes(userId);
    if (!isLiked) {
      post.likes.push(userId);
      post.likecount += 1;
      await User.updateOne({ _id: userId }, { $push: { likedposts: postId } });

      await post.save();
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();
      const updatedLikes = post.likes;
      return res.status(200).json(updatedLikes);
    } else {
      // unlike the post

      post.likecount -= 1;
      post.likes.pull(userId);
      await post.save();

      await User.updateOne({ _id: userId }, { $pull: { likedposts: postId } });

      const updatedLikes = post.likes;

      return res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.log("Error in likeUnlikePost controller", error);
    res.status(500).json({ error: error.message });
  }
};

// export const getAllPosts = async (req, res) => {
//   try {
//     const posts = await Post.find()
//       .sort({ createdAt: -1 })
//       .populate({
//         path: "user",
//         select: "-password",
//       })
//       .populate({
//         path: "comments.user",
//         select: "-password",
//       });
//     if (posts.length === 0) {
//       return res.status(200).json([]);
//     }
//     res.status(200).json(posts);
//   } catch (error) {
//     console.log("Error in getAllPosts controller", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

export const getAllPosts = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const limit = 8;
    const skip = (page - 1) * limit;
    const posts = await Post.find()
      .sort({ likecount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    console.log(posts.length);
    if (posts.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getAllPosts controller", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const likedPosts = await Post.find({ _id: { $in: user.likedposts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json(likedPosts);
  } catch (error) {
    console.log("Error in getLikedPosts controller", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const following = user.following;
    const followingPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json(followingPosts);
  } catch (error) {
    console.log("Error in getFollowingPosts controller", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getUserPosts controller", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSavedPosts = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const savedPosts = await Post.find({ _id: { $in: user.savedposts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json(savedPosts);
  } catch (error) {
    console.log("Erro in saveUnsavePosdt controller", error);
  }
};

export const saveUnsavePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const isSaved = user.savedposts.includes(postId);
    if (!isSaved) {
      user.savedposts.push(postId);
      await user.save();

      const updatedSavedPosts = user.savedposts;
      return res.status(200).json(updatedSavedPosts);
    } else {
      // unlike the post

      await User.updateOne({ _id: userId }, { $pull: { savedposts: postId } });

      const updatedSavedPosts = user.savedposts.filter(
        (id) => id.toString() !== postId.toString()
      );
      console.log("this is the res", updatedSavedPosts);
      return res.status(200).json(updatedSavedPosts);
    }
  } catch (error) {
    console.log("Error in saveUnsavePost controller", error);
    res.status(500).json({ error: error.message });
  }
};

export const repostPostUnrepost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    const postOwner = await User.findById(post.user);
    const ownerUsername = postOwner.username;
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const userId = req.user._id.toString();
    if (
      post.reposts.some((repost) => repost.repostuserid.toString() === userId)
    ) {
      await Post.updateOne(
        { _id: postId },
        { $pull: { reposts: { repostuserid: userId } } }
      );
      const updatedReposts = post.reposts.filter(
        (repost) => repost.repostuserid.toString() !== userId.toString()
      );
      const repost = post.reposts.find(
        (repost) => repost.repostuserid.toString() === userId.toString()
      );
      if (repost) {
        await Post.findByIdAndDelete(repost?.repostpostid);
      }
      return res.status(200).json(updatedReposts);
    }
    // const { text } = req.body;
    // let { img } = req.body;
    else {
      const text = post.text;
      const img = post.img;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      if (!text && !img)
        return res
          .status(400)
          .json({ error: "Post must have a text or image" });

      const newPost = new Post({
        user: userId,
        text,
        img,
        repostedFrom: post.user,
        repostedFromUsername: ownerUsername,
      });
      await newPost.save();
      post.reposts.push({ repostuserid: userId, repostpostid: newPost._id });
      await post.save();
      res.status(201).json(newPost);
    }
  } catch (error) {
    console.log("Error in repostPost controller", error);
    res.status(500).json({ error: error.message });
  }
};
