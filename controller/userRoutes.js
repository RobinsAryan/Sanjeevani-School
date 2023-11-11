import express from 'express';
const app = express();
import User from '../models/User.js';
import Attandance from '../models/Attendance.js';
import Gallary from '../models/Gallary.js';
import bcrypt from 'bcryptjs';
import { checkAuth, checkPrinciple, formatTime } from '../utils/middleware.js';
import Class from '../models/Class.js';
import mongoose from 'mongoose';
import { deleteFile } from '../utils/fileOperation.js';

export const userClass = async (id) => {
    let data = await Class.aggregate([
        {
            $match: {
                students: new mongoose.Types.ObjectId(id)
            }
        }, {
            $project: {
                students: 0,
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
                    subject: user.subject,
                    department: user.department,
                    doj: user.dateofjoin,
                    access: (user._id.toString() === req.user._id.toString()) || req.user.role === 'Principle',
                    isPrinciple: (req.user.role === 'Principle')
                }
                res.render('profile', { data, userData: JSON.stringify(data) })
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
                    add: user.add,
                    access: (user._id.toString() === req.user._id.toString()) || req.user.role !== 'Student',
                    isPrinciple: (req.user.role === 'Principle')
                }
                res.render('profile', { data, userData: JSON.stringify(data) })
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


app.get('/profile/remove/:id', checkAuth, checkPrinciple, async (req, res) => {
    try {
        res.json({ success: true });
        let user = await User.findByIdAndDelete(req.params.id);
        let userClass = await Class.findOneAndUpdate(
            { students: user._id },
            { $pull: { students: user._id } },
            { new: true }
        );
        if (userClass) {
            await Attandance.updateMany({ class: userClass._id }, {
                $pull: {
                    status: {
                        userId: user._id,
                    }
                }
            })
        }
        if (user.profile) {
            await deleteFile(`./static${user.profile}`);
        }
    } catch (err) {
        res.json({ success: false });
    }
})

app.get('/teacher/remove/:id', checkAuth, checkPrinciple, async (req, res) => {
    try {
        res.json({ success: true });
        let user = await User.findByIdAndDelete(req.params.id);
        await Class.updateMany({ inCharge: req.params.id }, { $unset: { inCharge: 1 } })
        if (user.profile != '/img/teacher.jpg') {
            await deleteFile(`./static${user.profile}`);
        }
    } catch (err) {
        res.json({ success: false });
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


app.get('/gallary', checkAuth, async (req, res) => {
    try {
        const data = { ...req.user }
        res.render('gallary', { data });
    } catch (err) {

    }
})

app.post('/gallary/add', checkAuth, checkPrinciple, async (req, res) => {
    try {
        let newFrame = new Gallary({
            title: req.body.title,
            images: req.body.images
        })
        newFrame.save();
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false });
    }
})

app.get('/gallary/all', checkAuth, async (req, res) => {
    try {
        let pageNum = parseInt(req.query.page);
        let data = await Gallary.aggregate([
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $skip: pageNum * 2,
            },
            {
                $limit: 2
            }
        ])
        res.json({ success: true, data });
    } catch (err) {
        res.json({ success: false });
    }
})

app.get('/gallary/remove/:id', checkAuth, async (req, res) => {
    try {
        let frame = await Gallary.findByIdAndDelete(req.params.id);
        res.json({ success: true });
        if (frame.images.length) {
            frame.images.map(async img => {
                await deleteFile(`./static${img}`);
            })
        } 
    } catch (err) {
        res.json({ success: false });
    }
})

export default app;