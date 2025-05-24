import Product from "../dbmodel/product_model.js";
import redisClient from "../db/redis.js";
import cloudinary from "../db/cloudinary.js";

const addToRedisArray = async (key, value) => {
  await redisClient.rPush(key, value);
};
const getRedisArray = async (key) => {
  const values = await redisClient.lRange(key, 0, -1);
  return values;
};

const removeProductFromRedisArray = async (key, value) => {
    console.log("Removing product from Redis array: " + value);
  await redisClient.lRem(key, 0, value);
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ products });
  } catch (err) {}
};

export const addProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    let cloudinaryResult = null;
    if (product.image) {
      //await cloudinary.uploader.upload(product.image, { folder: "products" });
    }
    const savedProduct = await Product.create({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image, //cloudinaryResult?.secure_url || cloudinaryResult.secure_url,
      category: product.category,
    });

    try {
      const key = `category:${savedProduct.category}`;
      const value = savedProduct._id.toString();
      await addToRedisArray(key, value);
    } catch (err) {
      console.error(
        "Error adding product to Redis category list: " + err.message
      );
    }
    res
      .status(201)
      .json({ message: "Product added successfully", product: savedProduct });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    try {
      if (product.image) {
        const imageId = product.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`products/${imageId}`);
      }
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Error deleting image from cloudinary" });
    }

    //remove from products from collection
    //TODO: implement backup logic before deletion
    try {
      let product = await Product.findById(req.params.id);
      if (!product) {
        return res
          .status(404)
          .json({ message: "product not found" });
      }

      try {
        const key = `category:${product.category}`;
        console.log(key);
        await removeProductFromRedisArray(key, product._id.toString());
      } catch (err) {
        console.error(
          "Error removing product from Redis category list: " + err.message
        );
      }
      
      product = await Product.findByIdAndDelete(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Error deleting item from inventory" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProductByCategory = async (req, res) => {
    try{
        const category = req.params.category;
        const products = await Product.find({ category }).lean();
        if(!products){
            return res.status(404).json({ message: "No products found in this category" });
        }
        res.json(products);
    }
    catch(err){
      res.status(500).json({ error: "Server Error" });
    }
}   

export const getReccomendedProducts = async (req, res) => {
  try {
    const productId = req.params.id;
    const category = await Product.findById(productId).select("category");
    if (!category) {
      return res.status(404).json({ message: "Product not found" });
    }
    const key = `category:${category.category}`;
    const productIds = await getRedisArray(key);
    if (!productIds) {
      return res.status(404).json({ message: "No recommended products found" });
    }
    const recommendedProducts = [];
    for (let productId of productIds) {
      if (productId === req.params.id) continue;
      if (recommendedProducts.length >= 3) break;

      recommendedProducts.push(productId);
    }
    res.json({ recommendedProducts });
  } catch (err) {
    return res.status(500).json({ error: "Server Error" });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await redisClient.get("featuredProducts");
    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    } else {
      const products = await Product.find({ featured: true }).lean();
      if (!products) {
        return res.status(404).json({ message: "No featured products found" });
      }
      redisClient.setex("featuredProducts", 60 * 60, JSON.stringify(products));
      res.json({ products });
    }
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};


export const toggelFeatured = async(req, res) =>{
  try{
    const product = await Product.findById(req.params.id)
    if(product){
      product.isFeatured = !product.isFeatured
    }
    const updatedProduct = await product.save()
    await updateFeaturedProductCache();
  }
  catch(err){
    res.status(500).json({message:"server error"})
  }
}

async function updateFeaturedProductCache(){
  try{
    const featuredList = await Product.find({isFeatured: true}).lean();
    await redisClient.set("Featured_product", JSON.stringify(featuredList), "EX", 60 * 60 *24);


  }
  catch(err){

  }
}