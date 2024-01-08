import webPush from "web-push"
import express from 'express'
import dotenv from 'dotenv';
import User from '../models/User.js';
import { createLog } from "../controller/logs/logs.js";
import { checkAuth } from "./middleware.js";
dotenv.config({ path: ".env" });
const app = express();

webPush.setVapidDetails('mailto: deepaksuthar40128@gmail.com', process.env.PublicKey, process.env.PrivateKey);

app.post('/subscribe', checkAuth, async (req, res) => {
    try {
        const subscription = req.body;
        res.json({ success: true });
        await User.findByIdAndUpdate(req.user._id, { sub: JSON.stringify(subscription) });
    } catch (err) {
        createLog(req.user, 'In webPush->/subscribe during adding subscription error:' + err, 'error');
        res.json({ success: false });
    }
})

export const putNotification = async (id, title, body) => {
    let user = await User.findById(id);
    if (user && user.sub) {
        let subscription = JSON.parse(user.sub);
        webPush.sendNotification(subscription, JSON.stringify({ title, body })).catch((err) => {
            createLog(req.user, 'In webPush->putNotification during puting  notificaions to users error:' + err, 'error');
        });
    }
}

export default app;