import express from 'express';
const app = express();
import { checkAuth } from '../../utils/middleware.js';
import Class from '../../models/Class.js';
import Room from '../../models/Room.js';
import mongoose from 'mongoose';



app.get('/class/:cid', checkAuth, async (req, res) => {
    try {
        let data = await Class.findById(req.params.cid);
        if (data) {
            res.render('principle/liveClass.ejs', { className: data.className, classId: req.params.cid });
        }
        else {
            res.render("404")
        }
    } catch (err) {
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
    } catch (err) {
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
        } else {
            res.json({ success: false });
        }
    } catch (err) {
        res.json({ success: false });
    }
})


app.get('/room/remove/:rid', checkAuth, async (req, res) => {
    try {
        let room = await Room.findById(req.params.rid);
        if (room) {
            if (req.user.role === 'Principle') {
                await Room.findByIdAndDelete(req.params.rid);
                res.json({ success: true });
            }
            else if (req.user.role === 'Teacher') {
                if (new mongoose.Types.ObjectId(room.userId).equals(req.user._id)) {
                    await Room.findByIdAndDelete(req.params.rid);
                    res.json({ success: true });
                } else {
                    res.json({ success: false });
                }
            } else {
                res.json({ success: false });
            }
        } else {
            res.json({ success: false });
        }
    } catch (err) {
        res.json({ success: false });
    }
})


export default app;