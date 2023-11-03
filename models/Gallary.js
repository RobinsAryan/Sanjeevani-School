import mongoose from 'mongoose';
const gallary = new mongoose.Schema({
    title: String,
    images:[String]
}, { timestamps: true });

export default mongoose.model('gallary', gallary);