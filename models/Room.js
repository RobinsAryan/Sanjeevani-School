import mongoose from "mongoose";
const rooms = new mongoose.Schema({
    roomId: {
        type: String,
        require: true,
    },
    userId: {
        type: String,
        require: true,
    },
    class: {
        type: String,
    }, 
}, { timestamps: true });

export default mongoose.model("rooms", rooms);
