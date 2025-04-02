import jwt from 'jsonwebtoken';
import taskModel from '../models/taskModel.js';
import statusModel from '../models/statusModel.js';
import priorityModel from '../models/priorityModel.js';
import sanitizeHtml from 'sanitize-html';

// Cookie auth

function cookieAuth(cookie, id, res) {
    if (id !== cookie) {
        res.status(403).json({ message: "Unauthorized" });
        return false;
    }
    return true;
}

// Status

export async function createStatus(req, res) {
    const { status, code, color } = req.body;

    if (!status || !code || !color) {
        return res.status(400).json({ message: "All fields are required" });
    }
    
    const newStatus = new statusModel({
        status,
        code,
        color
    });

    await newStatus
        .save()
        .then(() => res.status(201).json({ message: "Status created", status: newStatus }))
        .catch((err) => res.status(500).json({ message: err.message }));
}

export async function getStatuses(req, res) {
    const statuses = await statusModel.find();
    res.status(200).json({ statuses });
}

export async function getStatus(req, res) {
    const { statusId } = req.params;
    try {
        const status = await statusModel.findById(statusId);
        res.status(200).json({ status });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Priority

export async function createPriority(req, res) {
    const { priority, level, color } = req.body;

    if (!priority || !level || !color) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const newPriority = new priorityModel({
        priority,
        level,
        color
    });

    await newPriority
        .save()
        .then(() => res.status(201).json({ message: "Priority created", priority: newPriority }))
        .catch((err) => res.status(500).json({ message: err.message }));
}

export async function getPriorities(req, res) {
    const priorities = await priorityModel.find();
    res.status(200).json({ priorities });
}

export async function getPriority(req, res) {
    const { priorityId } = req.params;
    try {
        const priority = await priorityModel.findById(priorityId);
        res.status(200).json({ priority });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Tasks

export async function createTask(req, res) {
    const { content, priority } = req.body;
    const { id } = jwt.decode(req.cookies.token);

    if (!content || !priority) {
        return res.status(400).json({ message: "All fields are required" });
    }
    
    const status = await statusModel.findOne({ code: "PEN" });

    if (!status) {
        return res.status(500).json({ message: "Server error" });
    }

    const sanitizedContent = sanitizeHtml(content);

    const newTask = new taskModel({
        content: sanitizedContent,
        status: status._id,
        priority,
        userId: id
    });



    await newTask.save()

    const task = await taskModel.findById(newTask._id)
        .populate('status')
        .populate('priority')
        .exec();

    res.status(201).json({ message: "Task created", task: task });
}

export async function getTasks(req, res) {
    const { id } = jwt.decode(req.cookies.token);
    try{
        const tasks = await taskModel.find({ userId: id })
            .populate('status')
            .populate('priority')
            .sort({ createdAt: -1 });
        res.status(200).json({ tasks });
    }
    catch(err){
        res.status(500).json({ message: err.message });
    }
}

export async function getTask(req, res) {
    const { taskId } = req.params;
    const id = jwt.decode(req.cookies.token).id.toString();        

    try{
        const task = await taskModel.findById(taskId);
        const taskUserId = task.userId.toString();
        
        if(!cookieAuth(taskUserId, id, res)) return;

        res.status(200).json({ task });
    }
    catch(err){
        res.status(500).json({ message: err.message });
    }
}

export async function updateTask(req, res) {
    const { taskId } = req.params;
    const { content, status, priority } = req.body;
    const id = jwt.decode(req.cookies.token).id.toString();        

    try {
        const task = await taskModel.findById(taskId);
        const taskUserId = task.userId.toString();
        
        try {
            const getStatus = await statusModel.findById(status);
            const getPriority = await priorityModel.findById(priority);

            if (!getStatus || !getPriority) {
                return res.status(404).json({ message: "Status or priority not found" });
            }
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }

        if(!cookieAuth(taskUserId, id, res)) return;

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        } else if (!content && !status && !priority) {
            return res.status(400).json({ message: "All fields are required" });
        } else if (
            content === task.content && 
            status === task.status.toString() && 
            priority === task.priority.toString()
        ) {
            return res.status(400).json({ message: "No changes" });
        }

        if (content) task.content = content;
        if (status) task.status = status;
        if (priority) task.priority = priority;

        await task
            .save()
            .then(() => res.status(200).json({ message: "Task updated", task }))
            .catch((err) => res.status(500).json({ message: err.message }));
    }
    catch(err){
        res.status(500).json({ message: err.message });
    }
}

export async function deleteTask(req, res) {
    const { taskId } = req.params;
    const id = jwt.decode(req.cookies.token).id.toString();        

    try{
        const task = await taskModel.findById(taskId);
        
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const taskUserId = task.userId.toString();

        if(!cookieAuth(taskUserId, id, res)) return;

        await task
            .deleteOne()
            .then(() => res.status(200).json({ message: "Task deleted" }))
            .catch((err) => res.status(500).json({ message: err.message }));
    }
    catch(err){
        res.status(500).json({ message: err.message });
    }
}