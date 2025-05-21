import { createClient } from "redis";
import dotenv from "dotenv"

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
        await redisClient.connect()
    }
  } catch (e) {
    console.error("error attempting to connect to Redis db: " + e.message);
  }
};

export default redisClient