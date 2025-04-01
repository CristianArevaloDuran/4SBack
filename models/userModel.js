import userSchema from "../schemas/userSchema.js";
import mongoose from "mongoose";

const userModel = mongoose.model("User", userSchema);

export default userModel;