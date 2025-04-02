import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    status: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Status',
        required: true
    },
    priority: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Priority',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default taskSchema;