import mongoose from 'mongoose';
const user = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    fname: {
        type: String,
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
    },
    profile: {
        type: String,
    },
    dob: {
        type: Date,
    },
    role: {
        type: String
    },
    rollno: {
        type: Number,
        default: -1,
    },
    rid: {
        type: Number,
        default: 0,
    },
    add: {
        type: String,
    },
    gender: {
        type: String,
    }
},
    { timestamps: true });

export default mongoose.model('user', user);