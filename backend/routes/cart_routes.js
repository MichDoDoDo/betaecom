import express from "express";
import { protectRoute } from "../middleware/auth_middleware.js";
import { addToCart, getCart, updateCart, removeFromCart } from "../controller/cart_controller.js";
const router = express.Router();

router.post("/", protectRoute, addToCart);
router.get("/", protectRoute,getCart);
router.put("/:id", protectRoute,updateCart); //change quantity
router.delete("/:id", protectRoute, removeFromCart);

export default router;