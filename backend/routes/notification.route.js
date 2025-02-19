import express from "express";
import { protectRoute } from "../middleware/protectroute.js";
import {
  deleteNotifcations,
  getAllNotifications,
} from "../controllers/notifications.controller.js";

const router = express.Router();

router.get("/", protectRoute, getAllNotifications);
router.delete("/", protectRoute, deleteNotifcations);

export default router;
