import express from 'express';
const app = express();
import User from '../models/User.js';
import { checkAuth } from '../utils/middleware.js';
import mongoose, { isValidObjectId } from 'mongoose';
import { userClass } from './userRoutes.js';
import Attendance from '../models/Attendance.js';
import Notification from '../models/Notification.js';
import { createLog } from './logs/logs.js';

app.get('/attandanceJson/:id', checkAuth, async (req, res) => {
    try {
        if (isValidObjectId(req.params.id)) {
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
        }
        else {
            createLog(req.user, 'Invalid Id', 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, 'In /attandanceJson/:id during getting attandance Json error' + err, 'error');
        res.json({ success: false });
    }
})


app.get('/ebooks', checkAuth, async (req, res) => {
    try {
        const data = { ...req.user }
        let classData = await userClass(data._id);
        data.classId = classData._id;
        res.render('students/ebook.ejs', { data })
        createLog(req.user, 'Accessed Ebooks', 'info');
    } catch (err) {
        createLog(req.user, 'In /ebooks during getting ebooks error' + err, 'error');
        res.render("common/500.ejs")
    }
})

app.get('/classWork', checkAuth, async (req, res) => {
    try {
        const data = { ...req.user }
        let classData = await userClass(data._id);
        data.classId = classData._id;
        res.render('students/classWork.ejs', { data })
        createLog(req.user, 'Accessed Classwork', 'info');
    } catch (err) {
        createLog(req.user, 'In /classwork during getting classwork error' + err, 'error');
        res.render("common/500.ejs")
    }
})


app.get('/classMates', checkAuth, async (req, res) => {
    try {
        const data = { ...req.user }
        let classData = await userClass(data._id);
        data.classId = classData._id;
        res.render('students/classMates.ejs', { data })
        createLog(req.user, 'Accessed classMates', 'info');
    } catch (err) {
        createLog(req.user, 'In /classMates during getting classmates error' + err, 'error');
        res.render("common/500.ejs")
    }
})


app.post('/updateProfile/:id', checkAuth, async (req, res) => {
    if (req.user.role === 'Principle') {
        try {
            let user = await User.findById(req.user._id);
            if (req.body.password === user.password) {
                let updatedUser = await User.findByIdAndUpdate(req.params.id, { profile: req.body.icon || '/img/nouser.jpg' }, { new: true });
                res.json({ success: true, update: true, by: 'p', id: updatedUser._id });
                createLog(req.user, 'Profile Updated of ' + updatedUser.username + 'with rid: ' + updatedUser.rid, 'info');
            }
            else {
                createLog(req.user, 'Wrong admin password entered during updating profile', 'warn');
                res.json({ success: true, update: false, msz: "Wrong Admin Password!" });
            }
        } catch (err) {
            createLog(req.user, 'In /updateProfile/:id during updating student profie error' + err, 'error');
            res.json({ success: false });
        }
    } else if (req.user.role === 'Teacher') {
        try {
            let user = await User.findById(req.user._id);
            if (req.body.password === user.password) {
                let updatedUser = await User.findByIdAndUpdate(req.params.id, { profile: req.body.icon || '/img/nouser.jpg' }, { new: true });
                res.json({ success: true, update: true, by: 'p', id: updatedUser._id });
                createLog(req.user, 'Profile Updated of ' + updatedUser.username + 'with rid: ' + updatedUser.rid, 'info');
            }
            else {
                createLog(req.user, 'Wrong teacher password entered during updating profile', 'warn');
                res.json({ success: true, update: false, msz: "Wrong Teacher Password!" });
            }
        } catch (err) {
            createLog(req.user, 'In /updateProfile/:id during updating student profie error' + err, 'error');
            res.json({ success: false });
        }
    } else {
        try {
            let user = await User.findById(req.params.id);
            if (user) {
                if (user.password === req.body.password) {
                    let updatedUser = await User.findByIdAndUpdate(user._id, { profile: req.body.icon || '/img/nouser.jpg' }, { new: true });
                    res.json({ success: true, update: true, profile: updatedUser.profile, id: updatedUser._id });
                    createLog(req.user, 'Profile Updated of ' + updatedUser.username + 'with rid: ' + updatedUser.rid, 'info');
                }
                else {
                    createLog(req.user, 'Wrong student password entered during updating profile', 'warn');
                    res.json({ success: true, update: false, msz: "Wrong Password!" });
                }
            } else {
                createLog(req.user, 'No User Found', 'warn');
                res.json({ success: false });
            }
        } catch (err) {
            createLog(req.user, 'In /updateProfile/:id during updating student profie error' + err, 'error');
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
                createLog(req.user, 'Password Updated of ' + updatedUser.username + 'with rid: ' + updatedUser.rid, 'info');
            }
            else {
                res.json({ success: true, update: false, msz: "Wrong Admin Password!" });
            }
        } catch (err) {
            createLog(req.user, 'In /updatePassword/:id during updating student password error' + err, 'error');
            res.json({ success: false });
        }
    }
    else if (req.user.role === 'Teacher') {
        try {
            let user = await User.findById(req.user._id);
            if (req.body.password === user.password) {
                let updatedUser = await User.findByIdAndUpdate(req.params.id, { password: req.body.newPassword }, { new: true });
                res.json({ success: true, update: true, by: 'p', id: updatedUser._id });
                createLog(req.user, 'Password Updated of ' + updatedUser.username + 'with rid: ' + updatedUser.rid, 'info');
            }
            else {
                res.json({ success: true, update: false, msz: "Wrong Teacher Password!" });
            }
        } catch (err) {
            res.json({ success: false });
            createLog(req.user, 'In /updatePassword/:id during updating student password error' + err, 'error');
        }
    }
    else {
        try {
            let user = await User.findById(req.user._id);
            if (user.password === req.body.password) {
                let updatedUser = await User.findByIdAndUpdate(user._id, { password: req.body.newPassword }, { new: true });
                res.json({ success: true, update: true, id: updatedUser._id, by: 'self' });
                createLog(req.user, 'Password Updated of ' + updatedUser.username + 'with rid: ' + updatedUser.rid, 'info');
            }
            else {
                res.json({ success: true, update: false, msz: "Wrong Password!" });
            }
        } catch (err) {
            res.json({ success: false });
            createLog(req.user, 'In /updatePassword/:id during updating student password error' + err, 'error');
        }
    }
})






app.get('/result', checkAuth, async (req, res) => {
    try {
        const data = { ...req.user }
        let classData = await userClass(data._id);
        data.classId = classData._id;
        data.className = classData.className;
        res.render('students/selectResult.ejs', { data });
        createLog(req.user, 'Accessed result', 'info');
    } catch (err) {
        createLog(req.user, 'In student result error' + err, 'error');
        res.render("common/500.ejs")
    }
})


app.get('/notifications', checkAuth, async (req, res) => {
    try {
        const data = { ...req.user }
        let classData = await userClass(data._id);
        data.classId = classData._id;
        data.className = classData.className;
        res.render('students/notifications.ejs', { data })
        createLog(req.user, 'Accessed Notifications', 'info');
    } catch (err) {
        createLog(req.user, 'In student notifications error' + err, 'error');
        res.render("common/500.ejs")
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
        createLog(req.user, 'In /notifications/all/:cid student notifications error' + err, 'error');
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
            res.render('students/liveClasses.ejs', { data });
            createLog(req.user, 'Accessed LiveClasses', 'info');
        }
        else {
            createLog(req.user, 'In student LiveClasses Onlt Student routes:', 'warn');
            res.render("common/404.ejs")
        }
    } catch (err) {
        createLog(req.user, 'In student LiveClasses error:' + err, 'error');
        res.render("common/500.ejs")
    }
})
export default app;