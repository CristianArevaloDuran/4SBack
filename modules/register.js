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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/; // Alphanumeric and underscores only

    if (!usernameRegex.test(username) || username.length < 3 || username.length > 20) {
        return res.status(400).json({ message: "Username must be 3-20 characters long and can only contain letters, numbers, and underscores" });
    }

    if (name.length < 3 || name.length > 20) {
        return res.status(400).json({ message: "Name must be 3-20 characters long" });
    }

    if (lastname.length < 3 || lastname.length > 20) {
        return res.status(400).json({ message: "Lastname must be 3-20 characters long" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/; // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character

    if (!passwordRegex.test(password) || password.length < 8 || password.length > 20) {
        return res.status(400).json({ message: "Password must be 8-20 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character" });
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