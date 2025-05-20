import express from "express";
import dotenv from "dotenv";
import auth_route from "./routes/auth_route.js";
import { connectDB } from "./db/db.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

app.use("/api/auth", auth_route);

app.listen(port, () => {
  console.log("Server is running on port " + port);
  connectDB();
});
