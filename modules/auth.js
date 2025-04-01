import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import path from 'path';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Login

async function login(req, res) {
    const { username, password } = req.body;
    

    const user = await userModel.findOne({ username });
    
    if (!user) {
        return res.status(401).json({ message: "User does not exist" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET);    
    res
        .cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            priority: 'high',
            maxAge: 1000 * 60 * 60
        })
        .json({ message: "Login successful" });
}

// Verify token

function verifyToken(req, res, next) {
    const token = req.cookies.token;
    
    if (!token) {
        return res
            .clearCookie('token')
            .status(403)
            .json({ message: "Acces Unauthorized" });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        try {
            const user = await userModel.findById(decoded.id);
            if (!user) {
                return res
                    .clearCookie('token')
                    .status(403)
                    .json({ message: "Acces Unauthorized" });
            }
            
            if (err) {
                return res
                    .clearCookie('token')
                    .status(403)
                    .json({ message: "Acces Unauthorized" });
            }
        } catch (err) {
            if (err) {
                return res
                    .clearCookie('token')
                    .status(403)
                    .json({ message: "Acces Unauthorized" });
            }
        }
                    
        next();
    });
}

// User Data

function userData(req, res) {
    const token = req.cookies.token;
    
    
    if (!token) {
        return res.status(403).json({ message: "Token not provided" });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        
        const user = await userModel.findById(decoded.id);
        
        res
            .status(200)
            .json(user)
    });
}

function userProfilePic(req, res) {
    const token = req.cookies.token;
      
    if (!token) {
        return res.status(403).json({ message: "Token not provided" });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const file =  user.profilePicture;
        const filePath = path.join(path.resolve(), `/files/users/profilePic/${file}`);

        res
            .status(200)
            .setHeader('Content-Type', 'image/png')
            .sendFile(filePath);
    });
}

export { login, verifyToken, userData, userProfilePic };