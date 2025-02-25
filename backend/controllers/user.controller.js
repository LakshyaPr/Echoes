// Desc: User controller functions
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

// To import the user profile
export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password"); // getting user without the password
    if (!user) return res.status(404).json({ error: "User not found" }); // user not found

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// To follow/unfollow a user
// req.user._id wants to follow req.params.id
export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "You cannot follow/unfollow yourself" });
    }
    if (!userToModify || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }
    const isFollowing = userToModify.followers.includes(req.user._id); // checking the following array if user id is present or not

    if (isFollowing) {
      // if present then unfollow
      //Unfollow
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } }); // remove the user from teh followers array
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } }); // remove the user from the following array
      res.status(200).json({ message: "User Unfollowed successfully" });
    } else {
      // not present then follow
      //Follow
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } }); // push the id of the user who is following in the follower array
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } }); // push the id of the user who is being followed in the following array
      // Send the notification to the user
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });

      await newNotification.save();

      res.status(200).json({ message: "User Followed successfully" });
    }
  } catch (error) {
    console.log("Error in followUnfollowUser", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const userFollowedByMe = await User.findById(userId).select("following"); // get the users that I am following
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId }, // get the users that I am not following
        },
      },
      {
        $sample: { size: 10 }, // get 10 random users
      },
    ]);
    const filteredUsers = users.filter(
      (user) => !userFollowedByMe.following.includes(user._id)
    ); // remove users followed by me
    const suggestedUsers = filteredUsers.slice(0, 4); // get the first 4 users
    suggestedUsers.forEach((user) => (user.password = null)); // remove the password from the user object

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in getSuggestedUsers", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  const { fullName, username, email, bio, link, currPassword, newPassword } =
    req.body;
  let { profileImg, coverImg } = req.body;
  const userId = req.user._id;
  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if ((!newPassword && currPassword) || (!currPassword && newPassword)) {
      return res
        .status(400)
        .json({ error: "Please enter both current and new password" });
    }
    if (currPassword && newPassword) {
      const isMatch = await bcrypt.compare(currPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid Current Password" });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password should be atleast 6 characters long" });
      }
      const salt = await bcrypt.genSalt(10); // generate salt
      user.password = await bcrypt.hash(newPassword, salt); // hash the new password
    }
    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.match(user.profileImg.split("/").pop().split(".")[0])
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }
    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.match(user.coverImg.split("/").pop().split(".")[0])
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);

      coverImg = uploadedResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;
    user = await user.save();
    user.password = null; // this doesnt change the data in the database but just hides it from the response as we dont save it
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in updateUserProfile", error.message);
    res.status(500).json({ error: error.message });
  }
};
