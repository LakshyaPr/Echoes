import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
export const protectRoute = async (req, res, next) => {
  // middleware so that we can get req.user while authenticating user
  try {
    const token = req.cookies.jwt; // get token from cookies
    if (!token) {
      return res
        .status(401)
        .json({ error: "UnAuthorized : No token provided!" }); // if token is not valid
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // verify token to check if it is valid
    if (!decoded) {
      return re.status(401).json({ error: "UnAuthorized : Invalid token!" }); // if token is invalid
    }
    const user = await User.findById(decoded.userId).select("-password"); // -password so we dont send password in response
    if (!user) {
      return res.status(404).json({ error: "User not found!" }); // if user is not found
    }
    req.user = user; // so that we can access user in the next middleware
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
