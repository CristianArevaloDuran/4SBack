import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function register(req, res) {
    const { name, lastname, email, username, password } = req.body;

    if (!name || !password || !lastname || !email || !username) {
        return res.status(400).json({ message: "Please provide all fields" });
    }

    const userEmail = await userModel
        .findOne({ email })
        .catch((err) => res.status(500).json({ message: err.message }));

    const userUsername = await userModel
        .findOne({ username })
        .catch((err) => res.status(500).json({ message: err.message }));
    
    if (userEmail) {
        return res.status(400).json({ message: "Email is already in use" });
    } else if (userUsername) {
        return res.status(400).json({ message: "Username already exists" });
    }

    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new userModel({ 
            name, 
            lastname, 
            email, 
            username, 
            password: hashedPassword 
        });
    
        await newUser
            .save()
            .then(() => { 
                const token = jwt.sign({ id: newUser._id }, JWT_SECRET);
                res
                    .cookie("token", token, {
                        httpOnly: true,
                        secure: false,
                        sameSite: "strict",
                        maxAge: 1000 * 60 * 60
                    })
                    .status(201)
                    .json({ message: "User created" });
            })
            .catch((err) => res.status(500).json({ message: err.message }));
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}