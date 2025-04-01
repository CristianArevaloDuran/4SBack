import mongoose from "mongoose";
import statusSchema from "../schemas/statusSchema.js";

const statusModel = mongoose.model("Status", statusSchema);

export default statusModel;