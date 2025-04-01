import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "admin"]
    },
    profilePicture: {
        type: String,
        default: "default.png"
    },
    password: {
        type: String,
        required: true
    }
});

export default userSchema;