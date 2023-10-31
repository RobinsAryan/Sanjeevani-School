import mongoose from 'mongoose';
const classSchema = new mongoose.Schema({
    className: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
    },
    students: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'user'
    },
    subjects: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'subject'
    },
    inCharge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
});

export default mongoose.model('class', classSchema);