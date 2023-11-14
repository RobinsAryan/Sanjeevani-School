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

app.get('/idCard/download/:id', checkAuth, async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (user && user.role === 'Student') {
            let classData = await userClass(req.params.id);
            const canvas = createCanvas(700, 400);
            const ctx = canvas.getContext('2d');
            loadImage('./static/img/idCard.jpg').then(async (image) => {
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                let image2 = await loadImage(`./static${user.profile ? user.profile : '/img/nouser.png'}`);
                ctx.drawImage(image2, 535, 135, 120, 135);
                let image4 = await loadImage('./static/img/sign.jpg');
                ctx.drawImage(image4, 525, 288, 120, 40);
                ctx.font = '20px Arial';
                ctx.fillStyle = 'Black';
                ctx.fillText(user.username, 240, 188);
                ctx.fillText(`Sh.${user.fname}`, 240, 235);
                ctx.fillText(classData.className, 147, 278);
                ctx.fillText(user.rollno, 349, 276);
                const fileName = `${user.rid}_id_card.png`;
                const output = fs.createWriteStream(`./static/downloads/${fileName}`);
                const stream = canvas.createPNGStream();
                stream.pipe(output);
                res.json({ success: true, fileName });
            });
        }
        else {
            res.json({ success: false });
        }
    } catch (err) {
        res.json({ success: false });
    }

})


app.get('/ebooks', checkAuth, async (req, res) => {
    try {
        const data = { ...req.user }
        let classData = await userClass(data._id);
        data.classId = classData._id;
        res.render('ebook', { data })
    } catch (err) {
        res.json({ success: false });
    }
})

app.get('/classWork', checkAuth, async (req, res) => {
    try {
        const data = { ...req.user }
        let classData = await userClass(data._id);
        data.classId = classData._id;
        res.render('classWork', { data })
    } catch (err) {
        res.json({ success: false });
    }
})


app.get('/classMates', checkAuth, async (req, res) => {
    try {
        const data = { ...req.user }
        let classData = await userClass(data._id);
        data.classId = classData._id;
        res.render('classMates', { data })
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
        res.render('selectResult', { data })
    } catch (err) {
        res.json({ success: false });
    }
})
export default app;