import mongoose from 'mongoose';
const result = new mongoose.Schema({
    title: String,
    classId: {
        type: mongoose.Schema.ObjectId,
        ref: 'class'
    },
    result: [{
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: 'class'
        },
        desc: String
    }]
}, { timestamps: true });

export default mongoose.model('result', result);