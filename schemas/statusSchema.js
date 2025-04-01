import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    color: {
        type: String,
        required: true
    }
});

export default statusSchema;