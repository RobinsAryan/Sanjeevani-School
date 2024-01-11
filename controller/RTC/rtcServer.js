import dotenv from 'dotenv';
import express from 'express';
import { v4 as uuidV4 } from 'uuid';
import Room from '../../models/Room.js';
import { checkAuth } from '../../utils/middleware.js';
import { userClass } from '../userRoutes.js';
import mongoose from 'mongoose';
import { createLog } from '../logs/logs.js';

const app = express();
dotenv.config();


// Host protection (disabled by default)
const hostProtected = getEnvBoolean(process.env.HOST_PROTECTED);
const userAuth = getEnvBoolean(process.env.HOST_USER_AUTH);
const hostUsersString = '[{"username": "Sanjeevani School", "password": "admin"}]';
const hostUsers = JSON.parse(hostUsersString);
export const hostCfg = {
    protected: hostProtected,
    user_auth: userAuth,
    users: hostUsers,
    authenticated: !hostProtected,
};


export let iceServers = [];
const stunServerUrl = process.env.STUN_SERVER_URL;
const turnServerUrl = process.env.TURN_SERVER_URL;
const turnServerUsername = process.env.TURN_SERVER_USERNAME;
const turnServerCredential = process.env.TURN_SERVER_CREDENTIAL;
const stunServerEnabled = getEnvBoolean(process.env.STUN_SERVER_ENABLED);
const turnServerEnabled = getEnvBoolean(process.env.TURN_SERVER_ENABLED);
if (stunServerEnabled && stunServerUrl) iceServers.push({ urls: stunServerUrl });
if (turnServerEnabled && turnServerUrl && turnServerUsername && turnServerCredential) {
    iceServers.push({ urls: turnServerUrl, username: turnServerUsername, credential: turnServerCredential });
}


app.get('/join/:roomId', checkAuth, async function (req, res) {
    console.log(iceServers);
    try {
        let room = await Room.findOne({ roomId: req.params.roomId });
        if (room) {
            if (req.user.role != 'Student') {
                res.render('common/room.ejs', {
                    username: req.user.username,
                    rid: req.user.rid ? req.user.rid : (Math.floor(Math.random() * 8999 + 1000)),
                    profile: req.user.profile ? req.user.profile : false
                });
            }
            else {
                let classData = await userClass(req.user._id);
                if (classData._id.toString() === room.class) {
                    res.render('common/room.ejs', {
                        username: req.user.username,
                        rid: req.user.rid ? req.user.rid : (Math.floor(Math.random() * 8999 + 1000)),
                        profile: req.user.profile ? req.user.profile : false
                    });
                } else {
                    createLog(req.user, `In Join Room: Student Access Room of other Class`, 'warn');
                    res.render('common/404.ejs');
                }
            }
        } else {
            createLog(req.user, `In Join Room: No Room with Id: ${req.params.roomId}`, 'warn');
            res.render('common/404.ejs');
        }
    } catch (err) {
        createLog(req.user, `In Join Room: Error in /join/:roomId error: ${err}`, 'error');
        res.render('common/500.ejs');
    }
});


app.post('/meetingURL', checkAuth, (req, res) => {
    const meetingURL = getMeetingURL(host);
    res.end(JSON.stringify({ meeting: meetingURL }));
});


function getMeetingURL(host) {
    return 'http' + (host.includes('localhost') ? '' : 's') + '://' + host + '/join/' + uuidV4();
}






function getEnvBoolean(key, force_true_if_undefined = false) {
    if (key == undefined && force_true_if_undefined) return true;
    return key == 'true' ? true : false;
}





export default app;