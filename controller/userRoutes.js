import express from 'express';
const app = express();
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { checkAuth, checkPrinciple, formatTime } from '../utils/middleware.js';
import Class from '../models/Class.js';
import mongoose from 'mongoose';

export const userClass = async (id) => {
    let data = await Class.aggregate([
        {
            $match: {
                students: new mongoose.Types.ObjectId(id)
            }
        }, {
            $project: {
                className: 1,
            }
        }
    ])
    if (data.length)
        return data[0];
    else return [];
}

const inChargeofClass = async (id) => {
    let data = await Class.aggregate([
        {
            $match: {
                inCharge: new mongoose.Types.ObjectId(id)
            }
        }, {
            $project: {
                className: 1,
            }
        }
    ])
    let fclassName = '';
    data.map((obj, index) => {
        fclassName += obj.className;
        if (index != (data.length - 1)) fclassName += ','
    })
    return fclassName;
}

app.get('/profile/:id', checkAuth, async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (user) {
            if (user.role === 'Teacher') {
                let className = await inChargeofClass(req.params.id);
                let data = {
                    role: 'Teacher',
                    className,
                    userId: user._id,
                    userName: user.username,
                    email: user.phone,
                    profile: user.profile || '/img/nouser.png',
                    dob: formatTime(user.dob).split('of').pop(),
                    access: user._id === req.user._id,
                }
                res.render('profile', { role: 'Student', data })
            }
            else if (user.role === 'Student') {
                let classData = await userClass(req.params.id);
                let data = {
                    role: 'Student',
                    userId: user._id,
                    className: classData.className,
                    userName: user.username,
                    email: user.phone,
                    profile: user.profile || '/img/nouser.png',
                    dob: formatTime(user.dob).split('of').pop(),
                    rollno: user.rollno,
                    fname: user.fname,
                    studentId: user.rid,
                    gender: user.gender,
                    access: (user._id.toString() === req.user._id.toString()),
                }
                res.render('profile', { role: 'Student', data })
            }
            else {
                res.send("Unknown Pearson may be Principle of None!");
            }
        }
        else {
            res.render('404');
        }
    }
    catch (err) {
        res.render('500');
    }
})


app.get('/attandance/:id', checkAuth, async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (user && user.role === 'Student') {
            let classData = await userClass(req.params.id);
            let data = {
                role: 'Student',
                userId: user._id,
                className: classData.className,
                userName: user.username,
                email: user.phone,
                profile: user.profile || '/img/nouser.png',
                dob: formatTime(user.dob).split('of').pop(),
                rollno: user.rollno,
                fname: user.fname,
                studentId: user.rid
            }
            res.render('student_attandance', { data })
        }
        else res.render("404");
    } catch (err) {
        res.render("500");
    }
})

export default app;