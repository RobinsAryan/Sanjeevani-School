import express from 'express';
const app = express();
import User from '../models/User.js';
import { checkAuth, checkPrinciple } from '../utils/middleware.js';
import { createLog } from './logs/logs.js';

app.get('/all', checkAuth, async (req, res) => {
    try {
        let data = await User.find({ role: "Teacher" }).sort({ createdAt: -1 });
        res.json({ success: true, data });
    } catch (err) {
        createLog(req.user, 'In teachers/all during getting all teachers error:' + err, 'error');
        res.json({ success: false });
    }
})

app.post('/add', checkAuth, checkPrinciple, async (req, res) => {
    try {
        let newPhone = parseInt((req.body.phone).split('-').pop());
        let oldUser = await User.find({ phone: newPhone });
        if (oldUser.length) return res.json({ success: true, msz: "Employee Phone must be unique!" });
        let password = `${req.body.name.slice(0, 3)}${newPhone % 10000}`;
        let newClass = new User({
            username: req.body.name,
            profile: req.body.profile,
            role: "Teacher",
            phone: newPhone,
            dob: req.body.dob,
            password,
            subject: req.body.subject,
            dateofjoin: req.body.doj,
            department: req.body.department
        })
        await newClass.save();
        res.json({ success: true });
    } catch (err) {
        createLog(req.user, 'In teachers/add during adding a teacher error:' + err, 'error');
        res.json({ success: false });
    }
})

app.post('/updateTeacher/:id', checkAuth, checkPrinciple, async (req, res) => {
    try {
        let newPhone = parseInt((req.body.phone).split('-').pop());
        let oldUser = await User.findOne({ phone: newPhone, role: "Teacher" });
        if (oldUser && oldUser._id.toString() != req.params.id) return res.json({ success: true, updated: false, msz: "Employee Phone must be unique!" });
        if (!oldUser) oldUser = await User.findById(req.params.id);
        let possibleOldPassword = `${oldUser.username.slice(0, 3)}${parseInt(oldUser.phone) % 10000}`;
        let newPassword = oldUser.password;
        if (possibleOldPassword == oldUser.password) {
            newPassword = `${req.body.name.slice(0, 3)}${newPhone % 10000}`;
        }
        await User.findByIdAndUpdate(req.params.id, {
            username: req.body.name,
            role: "Teacher",
            phone: newPhone,
            dob: req.body.dob,
            newPassword,
            subject: req.body.subject,
            dateofjoin: req.body.doj,
            department: req.body.department
        })
        res.json({ success: true, updated: true });
    } catch (err) { 
        createLog(req.user, 'In updateTeacher/:id during updating a teacher error:' + err, 'error');
        res.json({ success: false });
    }
})

export default app;