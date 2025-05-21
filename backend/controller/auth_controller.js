import User from "../dbmodel/auth_model.js";
import redisClient from "../db/redis.js";
import jwt from "jsonwebtoken";

const generateTokens = (userId) => {
  try {
    const accesstoken = jwt.sign({ userId }, process.env.ACCESS_TOKEN, {
      expiresIn: "15m",
    });
    const refreshtoken = jwt.sign({ userId }, process.env.REFRESH_TOKEN, {
      expiresIn: "7d",
    });
    return { accesstoken, refreshtoken };
  } catch (error) {
    console.log("error gen token: " + error);
  }
};
const storeRequestToken = async (userId, refreshtoken) => {
  await redisClient.set(
    `refresh_token:${userId}`,
    refreshtoken,
    "EX",
    60 * 60 * 24 * 7
  );
};
const setCookies = (res, accesstoken, refreshtoken) => {
  res.cookie("AccessToken", accesstoken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 15,
  });
  res.cookie("RefreshToken", refreshtoken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (user && (await user.comparePassword(password))) {
      const { accesstoken, refreshtoken } = generateTokens(user._id);
      console.log(refreshtoken);
      await storeRequestToken(user._id, refreshtoken);
      setCookies(res, accesstoken, refreshtoken);
      res.json({
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
      });
    } else {
      res.status(400).json({ message: "invaild username or password" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const register = async (req, res) => {
  const {
    firstname,
    lastname,
    middlename,
    email,
    password,
    username,
    address,
  } = req.body;

  try {
    const existEmail = await User.findOne({ email });
    const existUsername = await User.findOne({ username });

    if (existEmail) {
      return res
        .status(400)
        .json({ sucess: false, message: "Email is already in use" });
    } else if (existUsername) {
      return res
        .status(400)
        .json({ sucess: false, messsage: "Username already in use" });
    } else {
      const user = await User.create({
        firstname,
        lastname,
        middlename,
        email,
        password,
        username,
        address,
      });
      const { accesstoken, refreshtoken } = generateTokens(user._id);
      await storeRequestToken(user._id, refreshtoken);
      setCookies(res, accesstoken, refreshtoken);

      res.status(201).json({
        user,
        message: "User created successfully",
      });
    }
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.RefreshToken;
    if (refreshToken) {
      const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
      await redisClient.del(`refresh_token:${decode.userId}`);
    }
    res.clearCookie("AccessToken");
    res.clearCookie("RefreshToken");
    res.json({ message: "Logged out" });
  } catch (err) {
    res.status(500).json({ message: "sever error: " + err.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshtoken = req.cookies.RefreshToken;
    if (!refreshtoken) {
      return res.status(401).json({ message: "missing Token" });
    }
    const decode = jwt.verify(refreshtoken, process.env.REFRESH_TOKEN);
    const storedtoken = await redisClient.get(`refresh_token:${decode.userId}`);
    if (storedtoken !== refreshtoken) {
      return res.status(401).json({ message: "invaild token" });
    }
    const accesstoken = jwt.sign({ userId:decode.userId }, process.env.ACCESS_TOKEN, {
      expiresIn: "15m",
    });

    res.cookie("AccessToken", accesstoken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 15,
  });
    res.status(200).json({message:"token refreshed successfully"})
  } catch (err) {
    res.status(500).json({message:"server side error" +  err.message})
  }
};

export const getProfile = async(req, res) => {

};
