import mongoose from "mongoose";
import prioritySchema from "../schemas/priorityScheme.js";

const priorityModel = mongoose.model("Priority", prioritySchema);

export default priorityModel;