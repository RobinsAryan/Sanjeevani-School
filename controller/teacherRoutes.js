import express from 'express';
const app = express();
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { checkAuth, checkPrinciple } from '../utils/middleware.js';

app.get('/all', checkAuth, async (req, res) => {
    try {
        let data = await User.find({ role: "Teacher" }).sort({ createdAt: -1 });
        res.json({ success: true, data });
    } catch (err) {
        res.json({ success: false });
    }
})

app.post('/add', checkAuth, checkPrinciple, async (req, res) => {
    try {
        let oldUser = await User.find({ email: req.body.email });
        if (oldUser.length) return res.json({ success: true, msz: "Teacher Email must be unique!" });
        let salt = await bcrypt.genSalt(10);
        let password = req.body.dob.split('-').reverse().join('');
        let hashedPassword = await bcrypt.hash(password, salt)
        let newClass = new User({
            username: req.body.name,
            profile: req.body.profile,
            role: "Teacher",
            email: req.body.email,
            dob: req.body.dob,
            password: hashedPassword,
        })
        await newClass.save();
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false });
    }
})

export default app;