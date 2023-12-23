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
    inCharge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    syllabus: {
        type: String
    },
    schedule: {
        type: String
    },
}, { timestamps: true });

export default mongoose.model('class', classSchema);