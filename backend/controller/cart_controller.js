import Product from "../dbmodel/product_model.js";
import User from "../dbmodel/auth_model.js";
import redisClient from "../db/redis.js";
import { addToRedisArray, findIndexOfElement } from "../db/redis.js";

export const addToCart = async (req, res) => {
  const { productId} = req.body;
  try{
    const user = req.user;
    const product = await Product.findById(productId);
    if(!product){
        return res.status(404).json({ message: "Product not found" });
    }
    const key = `Cart:${user._id}`;
    const value = JSON.stringify({ productId: product._id, quantity: 1 });
    await addToRedisArray(key, value);
 
    res.json({ message: "Product added to cart successfully" });

  }catch(err){
    res.status(500).json({ message: "Server Error"+ err.message });
  }
}

export const getCart = async (req, res) => {}

export const updateCart = async (req,res)  => { 

}

export const removeFromCart = async (req, res) => {}

// cache the product data
