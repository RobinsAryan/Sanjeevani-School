import dotenv from 'dotenv';
import express from 'express';
import { v4 as uuidV4 } from 'uuid';
import Room from '../../models/Room.js';
import { checkAuth } from '../../utils/middleware.js';

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
// Stun is mandatory for not internal network
if (stunServerEnabled && stunServerUrl) iceServers.push({ urls: stunServerUrl });
// Turn is recommended if direct peer to peer connection is not possible
if (turnServerEnabled && turnServerUrl && turnServerUsername && turnServerCredential) {
    iceServers.push({ urls: turnServerUrl, username: turnServerUsername, credential: turnServerCredential });
}

// Test Stun and Turn connection with query params
// const testStunTurn = host + '/test?iceServers=' + JSON.stringify(iceServers);


// set new room name and join
app.get('/newCall', (req, res) => {
    res.render('vc/newCall.ejs')
});





app.get('/join/:roomId/:cid', checkAuth, async function (req, res) {
    if (hostCfg.authenticated) {
        let RoomData = await Room.findOne({ roomId: req.params.roomId });
        console.log(RoomData);
        if (!RoomData && req.params.roomId && req.params.roomId.length == 36) {
            await (new Room({
                roomId: req.params.roomId,
                class: req.params.cid,
                userId: req.user._id,
                title: `Meet No. ${Math.floor(Math.random() * 1000)}`
            })).save();
        }
        res.render('common/room.ejs', { username: req.user.username, rid: req.user.rid ? req.user.rid : (Math.floor(Math.random() * 8999 + 1000)), profile: req.user.profile ? req.user.profile : false });
    } else {
        if (hostCfg.protected) {
            return res.sendFile(views.login);
        }
        res.redirect('/');
    }
});

app.post('/meetingURL', (req, res) => {
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