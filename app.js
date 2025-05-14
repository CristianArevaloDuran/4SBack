import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import connection from './db/connection.js';
import register from './modules/register.js';
import { createTask, getTasks, getTask, createStatus, getStatuses, getStatus, createPriority, getPriorities, getPriority, updateTask, doneTask, deleteTask } from './modules/tasks.js';
import { login, verifyToken, userData, userProfilePic } from './modules/auth.js';

dotenv.config();
const PORT = process.env.PORT;

const app = express();

const allowedOrigins = ['http://localhost:3000', 'http://192.168.1.5:3000', 'http://161.18.146.171:3000'];

connection();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const message = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(message), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.get('/', (req, res) => {
    res.send('Hello World');
});

// Auth

app.post('/register', register);
app.post('/login', login);

app.get('/logout', (req, res) => {
    res
        .clearCookie('token')
        .status(200)
        .json({ message: "Logged out" });
});

// User data

app.get('/user-data', verifyToken, userData);
app.get('/user-profile-pic/', verifyToken, userProfilePic);

// Protected routes

app.get('/protected', verifyToken, (req, res) => {
    res
        .status(200)
        .json({ message: "Protected route" });
});


// Status

app.post('/create-status', verifyToken, createStatus);
app.get('/get-statuses', verifyToken, getStatuses);
app.get('/get-status/:statusId', verifyToken, getStatus);

// Priority

app.post('/create-priority', verifyToken, createPriority);
app.get('/get-priorities', verifyToken, getPriorities);
app.get('/get-priority/:priorityId', verifyToken, getPriority);

// Tasks

app.post('/create-task', verifyToken, createTask);
app.get('/get-tasks', verifyToken, getTasks);
app.get('/get-task/:taskId', verifyToken, getTask);
app.put('/update-task/:taskId', verifyToken, updateTask);
app.put('/done-task/:taskId', verifyToken, doneTask);
app.delete('/delete-task/:taskId', verifyToken, deleteTask);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
