import mongoose from "mongoose";

export const connectDB = async () => {
    const uri = process.env.MONGODB_URL
    console.log(uri)
  try {
    const connect = await mongoose.connect(process.env.MONGODB_URL);
    if (!connect) {
      console.log("unable to connect to db");
    }
    console.log("connected to db");
  } catch (error) {
    console.log("error connected into mongdb" + error.messge);
    process.exit(0);
  }
};
