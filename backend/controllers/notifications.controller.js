import Notification from "../models/notification.model.js";
export const getAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ to: userId }).populate({
      // we only want the notifications that are sent to user
      path: "from",
      select: "username profileImg",
    });
    await Notification.updateMany({ to: userId }, { read: true }); // marking all those notifications as read
    res.status(200).json(notifications);
  } catch (error) {
    console.log("Error in getAllNotifications", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteNotifcations = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ to: userId });
    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.log("Error in deleteNotifications", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
