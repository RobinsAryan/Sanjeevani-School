import mongoose from 'mongoose';
const ebook = new mongoose.Schema({
    url: String,
    title: String,
    size: Number, 
    class: {
        type: mongoose.Schema.ObjectId,
        ref: 'class'
    }
}, { timestamps: true });

export default mongoose.model('ebook', ebook);