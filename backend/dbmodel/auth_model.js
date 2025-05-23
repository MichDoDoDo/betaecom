import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import redisClient from "../db/redis.js";
const authSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    middlename: { type: String, required: false },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 8 },
    email: { type: String, required: true, unique: true },
    address: { type: String, requried: true },
    userCart: [{
      cart:{type: String}
    }],
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    purchaseHistory: [{
      purchaseDate: { type: Date, default: Date.now },
      purchaseItems: [{
        productId: { type: mongoose.Schema.Types.ObjectId },
        quantity: { type: Number },
      }]
    }]
  },
  {
    timestamps: true,
  }
);

authSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const passwordSalt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, passwordSalt);
    next();
  } catch (x) {
    next(x);
  }
});

authSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", authSchema);
export default User;
