import jwt from "jsonwebtoken";
import User from "../dbmodel/auth_model.js";
import dotenv from "dotenv";

dotenv.config();

export const protectRoute = async (req, res, next) => {
  try {
    const accesstoken = req.cookies.AccessToken;
    if (!accesstoken) {
      return res
        .status(401)
        .json({ message: "Unauthorized NO TOKEN PROVIDED" });
    }
    try {
      const decodetoken = jwt.verify(accesstoken, process.env.ACCESS_TOKEN);
      const user = await User.findById(decodetoken.userId).select("-password");

      if (!user) {
        return res.status(401).json({ message: "No valid user give token" });
      }

      req.user = user;
      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      res
        .status(500)
        .json({ message: "Server error validating token: " + err.message });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const adminRoute = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else return res.status(403).json({ message: "access denied" });
};
