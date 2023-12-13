import mongoose from 'mongoose';
const card = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    baseImg: {
        type: String,
    },
    desc: {
        type: String,
    }
}, { timestamps: true });

export default mongoose.model('card', card);