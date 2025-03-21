import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  commentOnPost,
  createPost,
  deletePost,
  likeUnlikePost,
  getAllPosts,
  getLikedPosts,
  getFollowingPosts,
  getUserPosts,
  getSavedPosts,
  saveUnsavePost,
  repostPostUnrepost,
} from "../controllers/post.controller.js";
const router = express.Router();
router.get("/all", protectRoute, getAllPosts);
router.get("/user/:username", protectRoute, getUserPosts);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.post("/create", protectRoute, createPost);
router.delete("/:id", protectRoute, deletePost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.get("/saved/:id", protectRoute, getSavedPosts);
router.post("/save/:id", protectRoute, saveUnsavePost);
router.post("/repost/:id", protectRoute, repostPostUnrepost);

export default router;
