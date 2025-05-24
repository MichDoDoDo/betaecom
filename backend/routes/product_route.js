import express from "express";
import { getAllProducts , getFeaturedProducts, addProduct, deleteProduct, getReccomendedProducts, getProductByCategory, toggelFeatured } from "../controller/product_controller.js";
import { protectRoute, adminRoute } from "../middleware/auth_middleware.js";
const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);

router.post("/add", protectRoute, adminRoute, addProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);
router.get("/reccomended/:id", protectRoute, adminRoute, getReccomendedProducts);
router.get("/category/:category", getProductByCategory);

router.patch("/:id", protectRoute, adminRoute, toggelFeatured)
export default router;
