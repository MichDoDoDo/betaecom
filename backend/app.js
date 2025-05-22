import express from "express";
import dotenv from "dotenv";

import auth_route from "./routes/auth_route.js";
import product_route from "./routes/product_route.js"
import cart_route from "./routes/cart_routes.js"

import { connectDB } from "./db/db.js";
import { connectRedis } from "./db/redis.js";

import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", auth_route);
app.use("/api/products",product_route )
app.use("/api/usercart", cart_route)

app.listen(port, () => {
  console.log("Server is running on port " + port);
  connectDB();
  connectRedis();
});
