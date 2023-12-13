import express from 'express';
const app = express();
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { checkAuth, checkPrinciple } from '../utils/middleware.js';
import { createCanvas, loadImage, registerFont } from 'canvas'
import fs from 'fs';
import mongoose from 'mongoose';
import { userClass } from './userRoutes.js';
import Attendance from '../models/Attendance.js';
import Ebook from '../models/Ebook.js';
import Notification from '../models/Notification.js';

app.get('/attandanceJson/:id', checkAuth, async (req, res) => {
    try {
        let data = await Attendance.aggregate([
            {
                '$unwind': {
                    'path': '$status'
                }
            }, {
                '$match': {
                    'status.userId': new mongoose.Types.ObjectId(req.params.id)
                }
            }, {
                '$group': {
                    '_id': '$_id',
                    'date': {
                        '$first': '$createdAt'
                    },
                    'status': {
                        '$first': '$status.attendance'
                    }
                }
            }
        ])
        res.json({ success: true, data });
    } catch (err) {
        res.json({ success: false });
    }
})


app.get('/ebooks', checkAuth, async (req, res) => {
    try {
        const data = { ...req.user }
        let classData = await userClass(data._id);
        data.classId = classData._id;
        res.render('students/ebook.ejs', { data })
    } catch (err) {
        res.json({ success: false });
    }
})

app.get('/classWork', checkAuth, async (req, res) => {
    try {
        const data = { ...req.user }
        let classData = await userClass(data._id);
        data.classId = classData._id;
        res.render('students/classWork.ejs', { data })
    } catch (err) {
        res.json({ success: false });
    }
})


app.get('/classMates', checkAuth, async (req, res) => {
    try {
        const data = { ...req.user }
        let classData = await userClass(data._id);
        data.classId = classData._id;
        res.render('students/classMates.ejs', { data })
    } catch (err) {
        res.json({ success: false });
    }
})


app.post('/updateProfile/:id', checkAuth, async (req, res) => {
    if (req.user.role === 'Principle') {
        try {
            let user = await User.findById(req.user._id);
            if (req.body.password === user.password) {
                let updatedUser = await User.findByIdAndUpdate(req.params.id, { profile: req.body.icon || '/img/nouser.jpg' }, { new: true });
                res.json({ success: true, update: true, by: 'p', id: updatedUser._id });
            }
            else {
                res.json({ success: true, update: false, msz: "Wrong Admin Password!" });
            }
        } catch (err) {
            res.json({ success: false });
        }
    } else if (req.user.role === 'Teacher') {
        try {
            let user = await User.findById(req.user._id);
            if (req.body.password === user.password) {
                let updatedUser = await User.findByIdAndUpdate(req.params.id, { profile: req.body.icon || '/img/nouser.jpg' }, { new: true });
                res.json({ success: true, update: true, by: 'p', id: updatedUser._id });
            }
            else {
                res.json({ success: true, update: false, msz: "Wrong Teacher Password!" });
            }
        } catch (err) {
            res.json({ success: false });
        }
    } else {
        try {
            let user = await User.findById(req.params.id);
            if (user) {
                if (user.password === req.body.password) {
                    let updatedUser = await User.findByIdAndUpdate(user._id, { profile: req.body.icon || '/img/nouser.jpg' }, { new: true });
                    res.json({ success: true, update: true, profile: updatedUser.profile, id: updatedUser._id });
                }
                else {
                    res.json({ success: true, update: false, msz: "Wrong Password!" });
                }
            } else {
                res.json({ success: false });
            }
        } catch (err) {
            res.json({ success: false });
        }
    }
})



app.post('/updatePassword/:id', checkAuth, async (req, res) => {
    if (req.user.role === 'Principle') {
        try {
            let user = await User.findById(req.user._id);
            if (req.body.password === user.password) {
                let updatedUser = await User.findByIdAndUpdate(req.params.id, { password: req.body.newPassword }, { new: true });
                res.json({ success: true, update: true, by: 'p', id: updatedUser._id });
            }
            else {
                res.json({ success: true, update: false, msz: "Wrong Admin Password!" });
            }
        } catch (err) {
            res.json({ success: false });
        }
    }
    else if (req.user.role === 'Teacher') {
        try {
            let user = await User.findById(req.user._id);
            if (req.body.password === user.password) {
                let updatedUser = await User.findByIdAndUpdate(req.params.id, { password: req.body.newPassword }, { new: true });
                res.json({ success: true, update: true, by: 'p', id: updatedUser._id });
            }
            else {
                res.json({ success: true, update: false, msz: "Wrong Teacher Password!" });
            }
        } catch (err) {
            res.json({ success: false });
        }
    }
    else {
        try {
            let user = await User.findById(req.user._id);
            if (user.password === req.body.password) {
                let updatedUser = await User.findByIdAndUpdate(user._id, { password: req.body.newPassword }, { new: true });
                res.json({ success: true, update: true, id: updatedUser._id, by: 'self' });
            }
            else {
                res.json({ success: true, update: false, msz: "Wrong Password!" });
            }
        } catch (err) {
            res.json({ success: false });
        }
    }
})






app.get('/result', checkAuth, async (req, res) => {
    try {
        const data = { ...req.user }
        let classData = await userClass(data._id);
        data.classId = classData._id;
        data.className = classData.className;
        res.render('students/selectResult.ejs', { data })
    } catch (err) {
        res.json({ success: false });
    }
})


app.get('/notifications', checkAuth, async (req, res) => {
    try {
        const data = { ...req.user }
        let classData = await userClass(data._id);
        data.classId = classData._id;
        data.className = classData.className;
        res.render('students/notifications.ejs', { data })
    } catch (err) {
        res.json({ success: false });
    }
})
app.get('/notifications/all/:cid', checkAuth, async (req, res) => {
    try {
        let data = await Notification.aggregate([
            {
                '$match': {
                    '$or': [
                        {
                            'scope': 'School'
                        }, {
                            'class': new mongoose.Types.ObjectId(req.params.cid)
                        }
                    ]
                }
            }, {
                '$sort': {
                    'createdAt': -1
                }
            }
        ])
        res.json({ success: true, data });
    } catch (err) {
        res.json({ success: false });
    }
})


app.get('/liveClasses', checkAuth, async (req, res) => {
    try {
        if (req.user.role == 'Student') {
            const data = { ...req.user }
            let classData = await userClass(data._id);
            data.classId = classData._id;
            data.className = classData.className;
            res.render('students/liveClasses.ejs', { data});
        }
        else {
            res.render('400');
        }
    } catch (err) {
        res.render('500');
    }
})
export default app;