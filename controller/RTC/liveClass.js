import express from 'express';
const app = express();
import mongoose from 'mongoose';
import { checkAuth } from '../../utils/middleware.js';
import Class from '../../models/Class.js';
import peerUser from '../../models/peerUser.js';
import room from '../../models/Room.js';
import { v4 as uuidV4 } from 'uuid';


app.get('/new-meeting/:cid', async (req, res) => {
    let RoomId = uuidV4();
    res.redirect(`/RTC/room/${RoomId}/${req.params.cid}`);
})

app.get('/room/:id/:cid', async (req, res) => {
    const roomData = await room.findOne({ roomId: req.params.id }).exec();
    res.render("room", {
        tabName: "Class",
        classId: req.params.cid,
        roomId: req.params.id,
        screen: req.query.screen,
        user: req.user,
    });
})

app.get("/user", async (req, res) => {
    res.json({
        user: await peerUser.findOne({ peerId: req.query.peer }).exec(),
    });
});

app.get('/class/:cid', checkAuth, async (req, res) => {
    try {
        let data = await Class.findById(req.params.cid);
        if (data) {
            res.render('principle_liveClass', { className: data.className, classId: req.params.cid });
        }
        else {
            res.render("404")
        }
    } catch (err) {
        res.render('500');
    }
})

export default app;