import mongoose from 'mongoose';
const classWork = new mongoose.Schema({
    file: {
        type: String,
    },
    text: {
        type: String,
    },
    size: {
        type: Number,
    },
    class: {
        type: mongoose.Schema.ObjectId,
        ref: 'class'
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'user'
    }
}, { timestamps: true });

export default mongoose.model('classWork', classWork);