import mongoose from 'mongoose';
const notification = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
    },
    icon: {
        type: String,
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'class'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    scope: {
        type: String,
    },
    event: {
        type: String,
    }
}, { timestamps: true });

export default mongoose.model('notification', notification);