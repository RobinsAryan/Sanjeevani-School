import express from 'express';
const app = express();
import { checkAuth } from '../../utils/middleware.js';
import Class from '../../models/Class.js';
import Room from '../../models/Room.js';
import mongoose from 'mongoose';
import { createLog } from '../logs/logs.js';



app.get('/class/:cid', checkAuth, async (req, res) => {
    try {
        let data = await Class.findById(req.params.cid);
        if (data) {
            res.render('principle/liveClass.ejs', { className: data.className, classId: req.params.cid });
            createLog(req.user, 'Accessed LiveClasses', 'info');
        }
        else {
            res.render("404")
            createLog(req.user, `No Class Found with id ${req.params.cid}`, 'warn');
        }
    } catch (err) {
        createLog(req.user, `Error in LiveClass /class/:cid error: ${err}`, 'error');
        res.render('500');
    }
})

app.get('/liveClasses/all/:cid', checkAuth, async (req, res) => {
    try {
        let data = await Room.aggregate([
            {
                $match: {
                    class: req.params.cid
                }
            },
            {
                $addFields: {
                    userId: {
                        $toObjectId: '$userId'
                    }
                }
            }, {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: {
                    path: '$user'
                }
            },
            {
                $project: {
                    _id: 1,
                    roomId: 1,
                    title: 1,
                    'user.username': 1,
                    'user._id': 1,
                    createdAt: 1,
                }
            },
            {
                $sort: {
                    'createdAt': -1
                }
            }
        ])
        data = data.map((room) => {
            let newRoom = {
                ...room,
                isAdmin: (room.user._id.equals(req.user._id) || (req.user.role === 'Principle')),
            }
            return newRoom;
        })
        res.json({ success: true, data });
        createLog(req.user, 'Accessed All LiveClasses', 'info');
    } catch (err) {
        createLog(req.user, `Error in /liveClasses/all/:cid error: ${err}`, 'error');
        res.json({ success: false });
    }
})

app.post('/create/:cid/:rid', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student') {
            let data = await (new Room({
                roomId: req.params.rid,
                class: req.params.cid,
                userId: req.user._id,
                title: req.body.title
            })).save();
            res.json({ success: true, data });
            createLog(req.user, `In Create Room: Created new Live Class info:${data}`, 'info');
        } else {
            res.json({ success: false });
            createLog(req.user, ` In Create Room: Student Role accessed create live class`, 'warn');
        }
    } catch (err) {
        res.json({ success: false });
        createLog(req.user, `In Create Room: Error in /create/:cid/:rid: ${err}`, 'error');
    }
})


app.get('/room/remove/:rid', checkAuth, async (req, res) => {
    try {
        let room = await Room.findById(req.params.rid);
        if (room) {
            if (req.user.role === 'Principle') {
                await Room.findByIdAndDelete(req.params.rid);
                res.json({ success: true });
                createLog(req.user, `In remove Room: Room Removed`, 'info');
            }
            else if (req.user.role === 'Teacher') {
                if (new mongoose.Types.ObjectId(room.userId).equals(req.user._id)) {
                    await Room.findByIdAndDelete(req.params.rid);
                    res.json({ success: true });
                    createLog(req.user, `In remove Room: Room Removed`, 'info');
                } else {
                    res.json({ success: false });
                    createLog(req.user, `In remove Room:Other Teacher tries to remove room`, 'warn');
                }
            } else {
                res.json({ success: false });
                createLog(req.user, `In remove Room:Tries to remove room with no access`, 'warn');
            }
        } else {
            createLog(req.user, `In remove Room: No Room with id: ${req.params.rid}`, 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        res.json({ success: false });
        createLog(req.user, `In remove Room: Error in /room/remove/:rid: ${err}`, 'error');
    }
})


export default app;