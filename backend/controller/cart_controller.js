import Product from "../dbmodel/product_model.js";
import User from "../dbmodel/auth_model.js";
import redisClient from "../db/redis.js";
import { addToRedisArray, getRedisArray } from "../db/redis.js";

const checkCartItemExist = async (key) => {
  const cart = await redisClient.lRange(key, 0, -1);
  let exist = false;
  for (let i = 0; i < length(cart); i++) {}
};
export const addToCart = async (req, res) => {
  const { productId } = req.body;

  let exist = false;
  try {
    const user = req.user;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const key = `Cart:${user._id}`;
    const cart = await redisClient.lRange(key, 0, -1);

    for (let i = 0; i < cart.length; i++) {
      const currItem = JSON.parse(cart[i]);
      if (currItem.productId === productId) {
        currItem.quantity += 1;
        await redisClient.lSet(key, i, JSON.stringify(currItem));
        exist = true;
        res.json({ message: "add to quant" });
        break;
      }
    }

    if (!exist) {
      const addItem = { productId: productId, quantity: 1 };

      await addToRedisArray(key, JSON.stringify(addItem));

      res.json({ message: "Product added to cart successfully" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server Error" + err.message });
  }
};

export const getCart = async (req, res) => {
  const user = req.user;
  const key = `Cart:${user._id}`;
  const cart = await getRedisArray(key);
  res.json({ cart });
};

export const updateCart = async (req, res) => {
  const user = req.user;
  const { productId } = req.body;
  let exist = false;
  const key = `Cart:${user._id}`;
  try {
    const cart = await redisClient.lRange(key, 0, -1);
    if(!cart){
      return res.status(400).json({message: "cart does not exist"})
    }
    for (let i = 0; i < cart.length; i++) {
      const currItem = JSON.parse(cart[i]);

      if (currItem.productId === productId) {
        if (currItem.quantity === 1) {
          await redisClient.lRem(key, 1, JSON.stringify(currItem));
          return res.status(200).json({message: "removed last quant from item"})
        } else {
          currItem.quantity -= 1;
          await redisClient.lSet(key, i, JSON.stringify(currItem));
          return res.status(200).json({message: "removed quatn"})
        }
      }
    }
  } catch (err) {
    res.status(500).json({message: "server error " + err.message})
  }

};

export const removeFromCart = async (req, res) => {
  const user = req.user;
  const { productId } = req.body;
  let exist = false;
  const key = `Cart:${user._id}`;
  try {
    const cart = await redisClient.lRange(key, 0, -1);

    for (let i = 0; i < cart.length; i++) {
      const currItem = JSON.parse(cart[i]);
      if (currItem.productId === productId) {
        await redisClient.lRem(key, 1, JSON.stringify(currItem));
        exist = true;
        break;
      }
    }
    if (!exist) {
      return res
        .status(400)
        .json({ message: "the item you are tyring to remove does not exist" });
    }
    res.status(200).json({ message: "item removed from cart" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// cache the product data
