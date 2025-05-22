import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (e) {
    console.error("error attempting to connect to Redis db: " + e.message);
  }
};

export const addToRedisArray = async (key, value) => {
  redisClient.rPush(key, value);
};
export const getRedisArray = async (key) => {
  const values = await redisClient.lRange(key, 0, -1);
  return values;
};

export const removeProductFromRedisArray = async (key, value) => {
  console.log("Removing product from Redis array: " + value);
  await redisClient.lRem(key, 0, value);
};
export const findIndexOfElement = async (key, element) => {
  try {
    const index = await redisClient.lPos(key, element);
    return index;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

export const editRedisArray = async (key, index, newVakue) => {
  try {
    const result = await client.lSet(key, index, newValue);

    if (result === "OK") {
      console.log(
        `Element at index ${index} in list ${listKey} updated successfully.`
      );
    } else {
      console.error(`Error updating element: ${result}`);
    }
  } catch (error) {
    console.error(`Error during LSET operation: ${error}`);
  }
};

export default redisClient;
