import taskSchema from "../schemas/taskSchema.js";
import mongoose from "mongoose";

const Task = mongoose.model('Task', taskSchema);

export default Task;