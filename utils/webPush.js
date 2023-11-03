import webPush from "web-push"
import express from 'express'
import dotenv from 'dotenv';
import User from '../models/User.js';
dotenv.config({ path: ".env" });
const app = express();

webPush.setVapidDetails('mailto: deepaksuthar40128@gmail.com', process.env.PublicKey, process.env.PrivateKey);

app.post('/subscribe', async (req, res) => {
    const subscription = req.body;
    res.json({ success: true }); 
    await User.findByIdAndUpdate(req.user._id, { sub: JSON.stringify(subscription) });
})

export const putNotification = async (id, title, body) => {
    let user = await User.findById(id);
    if (user.sub) {
        let subscription = JSON.parse(user.sub);
        webPush.sendNotification(subscription, JSON.stringify({ title, body })).catch((err) => console.log(err));
    }
}


// app.get('/try', (req, res) => {
//     res.send("hello")
//     putNotification(req.user._id, "Hello Boyus", "Hello");
// })
export default app;