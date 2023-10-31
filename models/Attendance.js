import mongoose from 'mongoose';
const attendance = new mongoose.Schema({ 
    class: {
        type: mongoose.Schema.ObjectId,
        ref: 'class'
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'user'
    },
    status: {
        type: [{
            userId: {
                type: mongoose.Schema.ObjectId,
                ref: 'user'
            },
            attendance: {
                type: Number
            }
        }]
    }
}, { timestamps: true });

export default mongoose.model('attendance', attendance);