import peerUser from '../../models/peerUser.js';
import room from '../../models/Room.js';
let ioFunction = (io) => {
    io.on("connection", (socket) => {
        socket.on(
            "join-room",
            async (roomId, peerId, userId, classId, name, audio, video) => {
                // add peer details  
                await peerUser({
                    peerId: peerId,
                    name: name,
                    audio: audio,
                    video: video,
                }).save();
                // add room details
                var roomData = await room.findOne({ roomId: roomId }).exec();
                if (roomData == null) {
                    await room({
                        roomId: roomId,
                        userId: userId,
                        class: classId
                    }).save();
                }
                socket.join(roomId);
                socket.to(roomId).emit(
                    "user-connected",
                    peerId,
                    name, 
                    audio,
                    video
                );
                socket.on("audio-toggle", async (type) => {
                    await peerUser.updateOne({ peerId: peerId }, { audio: type });
                    socket
                        .to(roomId)
                        .emit("user-audio-toggle", peerId, type);
                });
                socket.on("video-toggle", async (type) => {
                    await peerUser.updateOne({ peerId: peerId }, { video: type });
                    socket
                        .to(roomId)
                        .emit("user-video-toggle", peerId, type);
                });
                // chat
                socket.on("client-send", (data) => {
                    socket.to(roomId).emit("client-podcast", data, name);
                });
                socket.on("disconnect", async () => {
                    await peerUser.deleteOne({ peerId: peerId });
                    socket
                        .to(roomId)
                        .emit(
                            "user-disconnected",
                            peerId
                        );
                });

            }
        );
    });
}

export default ioFunction;