import express from 'express';
import multer from 'multer';
import User from '../models/User.js';
import { checkAuth, checkPrinciple } from '../utils/middleware.js';
const app = express();
app.use(express.static('static'));
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'static/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'static/downloads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
export const upload = multer({ storage: storage });
export const uploadDownloads = multer({ storage: storage2 });


app.post('/uploadImage', checkAuth, upload.single('image'), (req, res) => {
    try {
        res.json({
            success: true,
            path: `/uploads/${req.file.filename}`
        })
    }
    catch (err) {
        res.json({
            success: false
        })
    }
})


app.get('/download/:fname', (req, res) => {
    let fileName = req.params.fname;
    const excelFilePath = `static/downloads/${fileName}`;
    let exectFileName = (fileName.split('-').reverse())[0];
    res.download(excelFilePath, exectFileName, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error downloading the file');
        }
    });
});

app.post('/saveFile', checkAuth, checkPrinciple, uploadDownloads.single('file'), (req, res) => {
    try {
        res.json({
            success: true,
            file: req.file
        })
    }
    catch (err) {
        res.json({
            success: false
        })
    }
})

app.get('/birthdays', checkAuth, async (req, res) => {
    try {
        let today = new Date();
        today.setHours(0, 0, 0, 0);  
        const day = today.getUTCDate();
        const month = today.getUTCMonth() + 1;  
        const data = await User.aggregate([
            {
                $project: {
                    username: 1,
                    profile:1,
                    dayOfBirth: { $dayOfMonth: '$dob' },
                    monthOfBirth: { $month: '$dob' },
                },
            },
            {
                $match: {
                    dayOfBirth: day,
                    monthOfBirth: month,
                },
            }, {
                '$lookup': {
                    'from': 'classes',
                    'localField': '_id',
                    'foreignField': 'students',
                    'as': 'class'
                }
            }, {
                '$unwind': {
                    'path': '$class'
                }
            }, {
                '$project': {
                    'profile': 1,
                    'username': 1,
                    'class.className': 1
                }
            }
        ]);
        res.json({ success: true, data });
    } catch (err) {
        res.json({ success: false });
    }
})

export default app;