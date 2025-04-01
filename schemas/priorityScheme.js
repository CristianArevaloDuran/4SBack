import mongoose from "mongoose";

const priorityScheme = new mongoose.Schema({
    priority: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        required: true
    }
});

export default priorityScheme;