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
            res.render('principle_liveClass', { className: data.className, classId: req.params.cid });
        }
        else {
            res.render("404")
        }
    } catch (err) {
        res.render('500');
    }
})

app.get('/liveClasses/all/:cid', checkAuth, async (req, res) => {
    console.log("hee")
    try {
        let data = await Room.aggregate([
            {
                $match: {
                    class: req.params.cid
                }
            }, {
                $sort: {
                    'createdAt': -1
                }
            }
        ])
        res.json({ success: true, data });
    } catch (err) {
        res.json({ success: false });
    }
})


export default app;