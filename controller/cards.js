import express from 'express';
import { checkAuth, checkPrinciple, formatTime } from '../utils/middleware.js';
import Card from '../models/Card.js';
import User from '../models/User.js';
import { userClass } from './userRoutes.js';
import { createIdCard } from '../utils/fileOperation.js';
import archiver from 'archiver';
import fs from 'fs'
import { createLog } from './logs/logs.js';
const app = express();

app.get('/', checkAuth, async (req, res) => {
    if (req.user.role == 'Principle') {
        res.render('principle/cards.ejs')
    }
})
app.get('/create/:id', checkAuth, checkPrinciple, async (req, res) => {
    try {
        if (req.user.role == 'Principle') {
            let card = await Card.findById(req.params.id);
            card = JSON.stringify(card);
            let studentData = await User.findOne({ role: 'Student' });
            studentData = studentData._doc;
            let classInfo = await userClass(studentData._id);
            studentData['class'] = classInfo.className;
            delete studentData['password'];
            delete studentData['createdAt'];
            delete studentData['__v'];
            delete studentData['_id'];
            delete studentData['updatedAt'];
            delete studentData['role'];
            studentData['dob'] = formatTime(studentData['dob']).split('of ').pop();
            studentData = JSON.stringify(studentData);
            createLog(req.user, `Access create card route`, 'info');
            res.render('utils/card.ejs', { card, studentData })
        }
    } catch (err) {
        createLog(req.user, `In cards/create/:id getting card page error: ${err}`, 'error');
        res.render('common/500.ejs');
    }
})

app.post('/preAdd', checkAuth, checkPrinciple, async (req, res) => {
    try {
        let data = await (new Card({
            title: req.body.title,
            baseImg: req.body.card
        })).save();
        res.json({ success: true, cardId: data._id });
    } catch (err) {
        createLog(req.user, `In cards/preAdd during adding card error: ${err}`, 'error');
        res.json({ success: false });
    }
})

app.post('/finalAdd/:id', checkAuth, checkPrinciple, async (req, res) => {
    try {
        await Card.findByIdAndUpdate(req.params.id, { desc: JSON.stringify(req.body.finalPaints) })
        createLog(req.user, `New card added`, 'info');
        res.json({ success: true });
    } catch (err) {
        createLog(req.user, `In cards/finalAdd/:id during adding card error: ${err}`, 'error');
        res.json({ success: false });
    }
})


app.get('/all', checkAuth, async (req, res) => {
    try {
        let data = await Card.aggregate([
            {
                $sort: {
                    createdAt: -1
                }
            }
        ])
        res.json({ success: true, data });
    } catch (err) {
        createLog(req.user, `In cards/all during getting all cards error: ${err}`, 'error');
        res.json({ success: false });
    }
})

app.get('/print/all/:id', checkAuth, checkPrinciple, async (req, res) => {
    try {
        let card = await Card.findById(req.params.id);
        let studentsData = await User.find({ role: 'Student' });
        studentsData.forEach(async studentData => {
            studentData = studentData._doc;
            let classInfo = await userClass(studentData._id);
            studentData['class'] = classInfo.className;
            delete studentData['password'];
            delete studentData['createdAt'];
            delete studentData['__v'];
            delete studentData['_id'];
            delete studentData['updatedAt'];
            delete studentData['role'];
            studentData['dob'] = formatTime(studentData['dob']).split('of ').pop();
            createIdCard(card, studentData);
        })
        let resData = await createZip();
        if (resData.success)
            res.json({ success: true, fileName: 'cards.zip' });
        else
            res.json({ success: false });
    } catch (err) {
        createLog(req.user, `In cards/print/all/:id during printing card error: ${err}`, 'error');
        res.json({ success: false });
    }
})

const createZip = () => {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream('./static/downloads/cards.zip');
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });
        archive.pipe(output);
        archive.directory('static/cards', 'cards');
        archive.finalize();
        output.on('close', () => {
            resolve({ success: true });
        });
        archive.on('error', (err) => {
            createLog(req.user, `In cards/print during creating zip error: ${err}`, 'error');
            resolve({ success: false });
        });
    })
}

app.get('/remove/:id', checkAuth, checkPrinciple, async (req, res) => {
    try {
        await Card.findByIdAndDelete(req.params.id);
        createLog(req.user, `Card removed`, 'info');
        res.json({ success: true });
    } catch (err) {
        createLog(req.user, `In cards/remove/:id during removing card error: ${err}`, 'error');
        res.json({ success: false });
    }
})
export default app;