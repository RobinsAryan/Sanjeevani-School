import mongoose from "mongoose";
const peerUser = new mongoose.Schema({
    peerId: {
        type: String,
        require: true,
    },
    name: {
        type: String,
        require: true,
    },
    audio: {
        type: Boolean,
        required: true,
    },
    video: {
        type: Boolean,
        required: true,
    },
});

export default mongoose.model("peerUser", peerUser);
