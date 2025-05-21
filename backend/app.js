import express from "express";
import dotenv from "dotenv";
import auth_route from "./routes/auth_route.js";
import { connectDB } from "./db/db.js";
import { connectRedis } from "./db/redis.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", auth_route);

app.listen(port, () => {
  console.log("Server is running on port " + port);
  connectDB();
  connectRedis();
});
