import axios from 'axios';
import checkXSS from '../../utils/xss.js';
import { hostCfg, iceServers } from './rtcServer.js';
// Room presenters
const roomPresentersString = process.env.PRESENTERS || '["Sanjeevani School"]';
const roomPresenters = JSON.parse(roomPresentersString);

const surveyEnabled = getEnvBoolean(process.env.SURVEY_ENABLED);
const surveyURL =  'https://app.thesanjeevanischool.in';

// IP Lookup
const IPLookupEnabled = getEnvBoolean(process.env.IP_LOOKUP_ENABLED);


// Redirect URL
const redirectEnabled = getEnvBoolean(process.env.REDIRECT_ENABLED);
const redirectURL = process.env.REDIRECT_URL || '/newcall';


let channels = {}; // collect channels
let sockets = {}; // collect sockets
let peers = {}; // collect peers info grp by channels
let presenters = {}; // collect presenters grp by channels
const ioFunction = (io) => {
    io.sockets.on('connect', async (socket) => {
        socket.channels = {};
        sockets[socket.id] = socket;

        socket.on('disconnect', async (reason) => {
            for (let channel in socket.channels) {
                await removePeerFrom(channel);
                removeIP(socket);
            }
            delete sockets[socket.id];
        });

        socket.on('data', async (dataObj, cb) => {
            const data = checkXSS(dataObj);

            const { room_id, peer_id, peer_name, method, params } = data;
            if (method == 'checkPeerName') {
                for (let id in peers[room_id]) {
                    if (peer_id != id && peers[room_id][id]['peer_name'] == peer_name) {
                        cb(true);
                        break;
                    }
                }
            }
            cb(false);
        });

        socket.on('join', async (cfg) => {
            const peer_ip = socket.handshake.headers['x-forwarded-for'] || socket.conn.remoteAddress;

            if (IPLookupEnabled && peer_ip != '::1') {
                cfg.peer_geo = await getPeerGeoLocation(peer_ip);
            }

            const config = checkXSS(cfg);

            const {
                channel,
                channel_password,
                peer_uuid,
                peer_name,
                peer_username,
                peer_password,
                peer_video,
                peer_audio,
                peer_video_status,
                peer_audio_status,
                peer_screen_status,
                peer_hand_status,
                peer_rec_status,
                peer_privacy_status,
            } = config;

            if (channel in socket.channels) {
                return 'error';
            }
            if (!(channel in channels)) channels[channel] = {};

            if (!(channel in peers)) peers[channel] = {};

            if (!(channel in presenters)) presenters[channel] = {};

            const presenter = {
                peer_ip: peer_ip,
                peer_name: peer_name,
                peer_uuid: peer_uuid,
                is_presenter: true,
            };
            if (roomPresenters && roomPresenters.includes(peer_name)) {
                presenters[channel][socket.id] = presenter;
            } else {
                if (Object.keys(presenters[channel]).length === 0) {
                    presenters[channel][socket.id] = presenter;
                }
            }

            const isPresenter = await isPeerPresenter(channel, socket.id, peer_name, peer_uuid);

            peers[channel][socket.id] = {
                peer_name: peer_name,
                peer_presenter: isPresenter,
                peer_video: peer_video,
                peer_audio: peer_audio,
                peer_video_status: peer_video_status,
                peer_audio_status: peer_audio_status,
                peer_screen_status: peer_screen_status,
                peer_hand_status: peer_hand_status,
                peer_rec_status: peer_rec_status,
                peer_privacy_status: peer_privacy_status,
            };

            const activeRooms = getActiveRooms();

            await addPeerTo(channel);

            channels[channel][socket.id] = socket;
            socket.channels[channel] = channel;

            const peerCounts = Object.keys(peers[channel]).length;

            await sendToPeer(socket.id, sockets, 'serverInfo', {
                peers_count: peerCounts,
                host_protected: hostCfg.protected,
                user_auth: hostCfg.user_auth,
                is_presenter: isPresenter,
                survey: {
                    active: surveyEnabled,
                    url: surveyURL,
                },
                redirect: {
                    active: redirectEnabled,
                    url: redirectURL,
                },
            });
        });

        socket.on('relayICE', async (config) => {
            const { peer_id, ice_candidate } = config;

            await sendToPeer(peer_id, sockets, 'iceCandidate', {
                peer_id: socket.id,
                ice_candidate: ice_candidate,
            });
        });

        socket.on('relaySDP', async (config) => {
            const { peer_id, session_description } = config;

            await sendToPeer(peer_id, sockets, 'sessionDescription', {
                peer_id: socket.id,
                session_description: session_description,
            });
        });



        /**
         * Handle messages
         */
        socket.on('message', async (message) => {
            const data = checkXSS(message);
            await sendToRoom(data.room_id, socket.id, 'message', data);
        });

        /**
         * Relay Audio Video Hand ... Status to peers
         */
        socket.on('peerStatus', async (cfg) => {
            // Prevent XSS injection
            const config = checkXSS(cfg);
            const { room_id, peer_name, peer_id, element, status } = config;

            const data = {
                peer_id: peer_id,
                peer_name: peer_name,
                element: element,
                status: status,
            };

            try {
                for (let peer_id in peers[room_id]) {
                    if (peers[room_id][peer_id]['peer_name'] == peer_name && peer_id == socket.id) {
                        switch (element) {
                            case 'video':
                                peers[room_id][peer_id]['peer_video_status'] = status;
                                break;
                            case 'audio':
                                peers[room_id][peer_id]['peer_audio_status'] = status;
                                break;
                            case 'screen':
                                peers[room_id][peer_id]['peer_screen_status'] = status;
                                break;
                            case 'hand':
                                peers[room_id][peer_id]['peer_hand_status'] = status;
                                break;
                            case 'rec':
                                peers[room_id][peer_id]['peer_rec_status'] = status;
                                break;
                            case 'privacy':
                                peers[room_id][peer_id]['peer_privacy_status'] = status;
                                break;
                        }
                    }
                }


                await sendToRoom(room_id, socket.id, 'peerStatus', data);
            } catch (err) {
            }
        });

        /**
         * Relay actions to peers or specific peer in the same room
         */
        socket.on('peerAction', async (cfg) => {
            const config = checkXSS(cfg);
            const { room_id, peer_id, peer_uuid, peer_name, peer_use_video, peer_action, send_to_all } = config;

            const presenterActions = ['muteAudio', 'hideVideo', 'ejectAll'];
            if (presenterActions.some((v) => peer_action === v)) {
                const isPresenter = await isPeerPresenter(room_id, peer_id, peer_name, peer_uuid);
                if (!isPresenter) return;
            }

            const data = {
                peer_id: peer_id,
                peer_name: peer_name,
                peer_action: peer_action,
                peer_use_video: peer_use_video,
            };

            if (send_to_all) {

                await sendToRoom(room_id, socket.id, 'peerAction', data);
            } else {

                await sendToPeer(peer_id, sockets, 'peerAction', data);
            }
        });

        socket.on('kickOut', async (cfg) => {
            const config = checkXSS(cfg);
            const { room_id, peer_id, peer_uuid, peer_name } = config;

            const isPresenter = await isPeerPresenter(room_id, peer_id, peer_name, peer_uuid);

            if (isPresenter) {

                await sendToPeer(peer_id, sockets, 'kickOut', {
                    peer_name: peer_name,
                });
            }
        });


        /**
         * Relay video player action
         */
        socket.on('videoPlayer', async (cfg) => {
            // Prevent XSS injection
            const config = checkXSS(cfg);
            const { room_id, peer_id, peer_name, video_action, video_src } = config;

            // Check if valid video src url
            if (video_action == 'open' && !isValidHttpURL(video_src)) {
                return;
            }

            const data = {
                peer_id: socket.id,
                peer_name: peer_name,
                video_action: video_action,
                video_src: video_src,
            };

            if (peer_id) {

                await sendToPeer(peer_id, sockets, 'videoPlayer', data);
            } else {

                await sendToRoom(room_id, socket.id, 'videoPlayer', data);
            }
        });

        /**
         * Whiteboard actions for all user in the same room
         */
        socket.on('wbCanvasToJson', async (cfg) => {
            // Prevent XSS injection
            const config = checkXSS(cfg);
            const { room_id } = config;
            await sendToRoom(room_id, socket.id, 'wbCanvasToJson', config);
        });

        socket.on('whiteboardAction', async (cfg) => {
            // Prevent XSS injection
            const config = checkXSS(cfg);
            const { room_id } = config;
            await sendToRoom(room_id, socket.id, 'whiteboardAction', config);
        });

        async function addPeerTo(channel) {
            for (let id in channels[channel]) {
                // offer false
                await channels[channel][id].emit('addPeer', {
                    peer_id: socket.id,
                    peers: peers[channel],
                    should_create_offer: false,
                    iceServers: iceServers,
                });
                // offer true
                socket.emit('addPeer', {
                    peer_id: id,
                    peers: peers[channel],
                    should_create_offer: true,
                    iceServers: iceServers,
                });
            }
        }

        async function removePeerFrom(channel) {
            if (!(channel in socket.channels)) {
                return 'Warning';
            }
            try {
                delete socket.channels[channel];
                delete channels[channel][socket.id];
                delete peers[channel][socket.id]; // delete peer data from the room

                switch (Object.keys(peers[channel]).length) {
                    case 0: // last peer disconnected from the room without room lock & password set
                        delete peers[channel];
                        delete presenters[channel];
                        break;
                    case 2: // last peer disconnected from the room having room lock & password set
                        if (peers[channel]['lock'] && peers[channel]['password']) {
                            delete peers[channel]; // clean lock and password value from the room
                            delete presenters[channel]; // clean the presenter from the channel
                        }
                        break;
                }
            } catch (err) {
            }

            const activeRooms = getActiveRooms();


            for (let id in channels[channel]) {
                await channels[channel][id].emit('removePeer', { peer_id: socket.id });
                socket.emit('removePeer', { peer_id: id });
            }
        }

        function toJson(data) {
            return JSON.stringify(data, null, 4); // "\t"
        }

        async function sendToRoom(room_id, socket_id, msg, config = {}) {
            for (let peer_id in channels[room_id]) {
                // not send data to myself
                if (peer_id != socket_id) {
                    await channels[room_id][peer_id].emit(msg, config);
                }
            }
        }

        async function sendToPeer(peer_id, sockets, msg, config = {}) {
            if (peer_id in sockets) {
                await sockets[peer_id].emit(msg, config);
            }
        }
    });
}


function isValidHttpURL(url) {
    const pattern = new RegExp(
        '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
        'i', // fragment locator
    );
    return pattern.test(url);
}


async function getPeerGeoLocation(ip) {
    const endpoint = `https://get.geojs.io/v1/ip/geo/${ip}.json`;
    return axios
        .get(endpoint)
        .then((response) => response.data)
        .catch((error) => { console.log(error) });
}


async function isPeerPresenter(room_id, peer_id, peer_name, peer_uuid) {
    try {
        if (!presenters[room_id] || !presenters[room_id][peer_id]) {
            for (const [existingPeerID, presenter] of Object.entries(presenters[room_id] || {})) {
                if (presenter.peer_name === peer_name) {
                    return true;
                }
            }
            return false;
        }

        const isPresenter =
            (typeof presenters[room_id] === 'object' &&
                Object.keys(presenters[room_id][peer_id]).length > 1 &&
                presenters[room_id][peer_id]['peer_name'] === peer_name &&
                presenters[room_id][peer_id]['peer_uuid'] === peer_uuid) ||
            (roomPresenters && roomPresenters.includes(peer_name));


        return isPresenter;
    } catch (err) {
        return false;
    }
}

function isAuthPeer(username, password) {
    return hostCfg.users && hostCfg.users.some((user) => user.username === username && user.password === password);
}

function getActiveRooms() {
    const roomPeersArray = [];
    for (const roomId in peers) {
        if (peers.hasOwnProperty(roomId)) {
            const peersCount = Object.keys(peers[roomId]).length;
            roomPeersArray.push({
                roomId: roomId,
                peersCount: peersCount,
            });
        }
    }
    return roomPeersArray;
}

function getIP(req) {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
}
function allowedIP(ip) {
    return authHost != null && authHost.isAuthorized(ip);
}

function removeIP(socket) {
    if (hostCfg.protected) {
        const ip = socket.handshake.address;
        if (ip && allowedIP(ip)) {
            authHost.deleteIP(ip);
            hostCfg.authenticated = false;
        }
    }
}

function getEnvBoolean(key, force_true_if_undefined = false) {
    if (key == undefined && force_true_if_undefined) return true;
    return key == 'true' ? true : false;
}

export default ioFunction;