import express from 'express';
const app = express();
import User from '../models/User.js';
import Class from '../models/Class.js';
import Ebook from '../models/Ebook.js';
import { checkAuth, checkPrinciple, formatTime, istToUtc, parseDateString, sendNotificationToClass } from '../utils/middleware.js';
import mongoose from 'mongoose';
import { upload } from './utilsRoute.js';
import fs from 'fs';
import XLSX from 'xlsx'
import classWork from '../models/classWork.js';
import Attendance from '../models/Attendance.js';
import { deleteFile } from '../utils/fileOperation.js';
import Notification from '../models/Notification.js';
import { userClass } from './userRoutes.js';
import Result from '../models/Result.js';

//class routes
app.get('/single/:id', checkAuth, async (req, res) => {
    let data = await Class.findById(req.params.id);
    if (data) {
        if (req.user.role != 'Student') {
            res.render('principle_class', { className: data.className, classId: req.params.id });
        }
    }
})

app.get('/all', checkAuth, async (req, res) => {
    try {
        let data = await Class.find();
        res.json({ success: true, data });
    } catch (err) {
        res.json({ success: false });
    }
})

app.post('/add', checkAuth, checkPrinciple, async (req, res) => {
    try {
        let newClass = new Class({
            className: req.body.name,
            icon: req.body.icon,
        })
        await newClass.save();
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false });
    }
})


app.post('/update/className/:id', checkAuth, async (req, res) => {
    try {
        await Class.findByIdAndUpdate(req.params.id, { className: req.body.className });
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false });
    }
})


app.get('/remove/:id', checkAuth, checkPrinciple, async (req, res) => {
    try {
        let data = await Class.findByIdAndDelete(req.params.id);
        if (data.icon != "/img/class.jpg") {
            await deleteFile(`./static${data.icon}`);
        }
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false });
    }
})





//Incharge routes
app.get('/inCharge/:id', checkAuth, async (req, res) => {
    try {
        let inCharge = '';
        let data = await Class.findById(req.params.id);
        inCharge = data.inCharge;
        let teachers = await User.aggregate([
            {
                '$match': {
                    'role': 'Teacher',
                    'department': 'Teacher'
                }
            }, {
                '$project': {
                    'username': 1,
                    'phone': 1,
                    'profile': 1,
                    'subject': 1
                }
            }, {
                '$sort': {
                    'username': 1
                }
            }
        ]).exec();
        res.json({ success: true, 'inCharge': inCharge || false, teachers });
    } catch (err) {
        res.json({ success: false });
    }
})

app.get('/setInCharge/:classID/:id', checkAuth, checkPrinciple, async (req, res) => {
    try {
        await Class.findByIdAndUpdate(req.params.classID, {
            inCharge: req.params.id
        });
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false });
    }
})







//students routes
app.get('/student/:id', checkAuth, async (req, res) => {
    let data = await Class.findById(req.params.id);
    if (data) {
        if (req.user.role == 'Principle') {
            res.render('principle_student', { className: data.className, classId: req.params.id });
        }
    }
})

app.get('/students/all/:classID', checkAuth, async (req, res) => {
    try {
        let data = await Class.aggregate([
            {
                '$match': {
                    '_id': new mongoose.Types.ObjectId(req.params.classID)
                }
            }, {
                '$project': {
                    'students': 1
                }
            }, {
                '$unwind': {
                    'path': '$students'
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'students',
                    'foreignField': '_id',
                    'as': 'student'
                }
            }, {
                '$unwind': {
                    'path': '$student'
                }
            }, {
                '$project': {
                    'student': 1,
                    '_id': 0
                }
            }, {
                '$sort': {
                    'student.rollno': 1
                }
            }
        ])
        res.json({ success: true, data });
    } catch (err) {
        res.json({ success: false });
    }
})


const addStudent = (data, id) => {
    let { regId, name, rollno, phone, dob, fname, add, gender } = data;
    return new Promise(async (resolve, reject) => {
        try {
            let isSameId = await User.find({ rid: regId });
            if (isSameId.length) {
                resolve({ success: true, added: false, msz: "Duplicate Reg. Id within School!" });
            }
            let isSameRoll = await Class.aggregate([
                {
                    '$match': {
                        '_id': new mongoose.Types.ObjectId(id)
                    }
                }, {
                    '$unwind': {
                        'path': '$students'
                    }
                }, {
                    '$lookup': {
                        'from': 'users',
                        'localField': 'students',
                        'foreignField': '_id',
                        'as': 'student'
                    }
                }, {
                    '$match': {
                        'student.rollno': parseInt(rollno)
                    }
                }
            ]);
            if (isSameRoll.length) {
                resolve({ success: true, added: false, msz: "Duplicate Roll within Class" });
            }
            else {
                if (typeof (phone) === 'string') phone = parseInt(phone);
                let password = `${name.slice(0, 3)}${phone % 10000}`;
                let newStudent = new User({
                    rid: regId,
                    username: name,
                    phone,
                    dob,
                    fname,
                    password,
                    role: 'Student',
                    rollno,
                    add,
                    gender
                })
                newStudent = await newStudent.save();
                await Class.findByIdAndUpdate(id, { $push: { students: newStudent._id } });
                resolve({ success: true, added: true });
            }
        } catch (err) {
            console.log(err)
            resolve({ success: false });
        }
    })
}



app.post('/addSingleStudent/:classID', checkAuth, checkPrinciple, async (req, res) => {
    try {
        let phone = req.body.phone;
        phone = (typeof (phone) === 'number' ? parseInt((phone.toString()).split('-').pop()) : parseInt(phone.split('-').pop()));
        req.body.phone = phone;
        let dob = parseDateString(req.body.dob);
        if (!dob) return res.json({ success: true, added: false, msz: "Invalid Dob" });
        req.body.dob = dob;
        let resData = await addStudent(req.body, req.params.classID);
        res.json(resData);
    } catch (err) {
        res.json({ success: false });
    }
})




app.post('/addMultipleStudents/:classID', checkAuth, checkPrinciple, upload.single('file'), async (req, res) => {
    try {
        let uninsertedStudents = [];
        let classID = req.params.classID;
        fs.readFile(req.file.path, async (err, data) => {
            try {
                await deleteFile(req.file.path);
                const workbook = XLSX.read(data);
                const sheet_name_list = workbook.SheetNames;
                let students = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
                if (students.length == 0) return res.json({ success: true });
                else {
                    students = students.map(student => {
                        let date = new Date();
                        if (typeof (student.Dob) === 'number') {
                            date = XLSX.SSF.parse_date_code(student.Dob);
                            date = `${new Date(Date.parse(`${date.y}-${date.m}-${date.d}`))}`;
                        }
                        else {
                            date = parseDateString(student.Dob);
                        }
                        return {
                            regId: student["Registration Number"],
                            name: student.Name,
                            phone: typeof (student.Phone) === 'number' ? parseInt((student.Phone.toString()).split('-').pop()) : parseInt((student.Phone).split('-').pop()),
                            fname: student["Father Name"],
                            add: student["Current Address"],
                            gender: student["Gender"],
                            rollno: student["Roll No."],
                            dob: date,
                        }
                    })
                }

                await Promise.all(
                    students.map(async student => {
                        if (student.dob) {
                            let resData = await addStudent(student, classID);
                            if (resData.success) {
                                if (!resData.added) {
                                    uninsertedStudents.push({
                                        regId: student.regId,
                                        name: student.name,
                                        phone: student.phone,
                                        dob: student.dob,
                                        fname: student.fname,
                                        add: student.add,
                                        gender: student.gender,
                                        rollno: student.rollno,
                                        "reasone": resData.msz,
                                    })
                                }
                            }
                            else {
                                uninsertedStudents.push({
                                    regId: student.regId,
                                    name: student.name,
                                    phone: student.phone,
                                    dob: student.dob,
                                    fname: student.fname,
                                    add: student.add,
                                    gender: student.gender,
                                    rollno: student.rollno,
                                    "reasone": "UnExpected Error!",
                                })
                            }
                        } else {
                            uninsertedStudents.push({
                                regId: student.regId,
                                name: student.name,
                                phone: student.phone,
                                dob: student.dob,
                                fname: student.fname,
                                add: student.add,
                                gender: student.gender,
                                rollno: student.rollno,
                                "reasone": "Invalid Dob!",
                            })
                        }
                    })
                )
                if (uninsertedStudents.length) {
                    uninsertedStudents = uninsertedStudents.map(student => {
                        let date = new Date(student.dob);
                        return {
                            "Registration Number": student.regId,
                            "Name": student.name,
                            "Phone": student.phone.toString(),
                            "Father Name": student.fname,
                            "Roll No.": student.rollno,
                            "Dob": student.dob ? `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}` : '-',
                            "Gender": student.gender,
                            "Current Address": student.add,
                            "Error": student.reasone
                        }
                    })
                    const workSheet = XLSX.utils.json_to_sheet(uninsertedStudents);
                    const workBook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workBook, workSheet, `students`);
                    const fileName = `${Date.now()}-WorkBook-uninsertedStudents.xlsx`
                    const outputPath = `static/downloads/${fileName}`;
                    XLSX.writeFile(workBook, outputPath);
                    res.json({ success: true, allInserted: false, total: students.length, unInserted: uninsertedStudents.length, descFile: fileName });
                } else {
                    res.json({ success: true, allInserted: true, total: students.length });
                }
            } catch (err) {
                res.json({ success: false });
            }
        });
    } catch (err) {
        res.json({ success: false });
    }
})


app.post('/updateStudent/:id', checkAuth, checkPrinciple, async (req, res) => {
    try {
        let userData = await User.findById(req.params.id);
        let { regId, name, rollno, phone, dob, fname, add, gender } = req.body;
        dob = parseDateString(dob);
        let isSameIdUser = await User.find({ rid: regId });
        if (isSameIdUser.length && isSameIdUser[0]._id.toString() != req.params.id) {
            return res.json({ success: true, updated: false, msz: "Duplicate Reg. Id within School!" });
        }
        let classData = await userClass(req.params.id);
        let isSameRollUser = await Class.aggregate([
            {
                '$match': {
                    '_id': new mongoose.Types.ObjectId(classData._id)
                }
            }, {
                '$unwind': {
                    'path': '$students'
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'students',
                    'foreignField': '_id',
                    'as': 'student'
                }
            }, {
                '$match': {
                    'student.rollno': parseInt(rollno)
                }
            }
        ]);
        if (isSameRollUser.length && isSameRollUser[0].students.toString() != req.params.id) {
            res.json({ success: true, added: false, msz: "Duplicate Roll within Class" });
        }
        else {
            let possibleOldPassword = `${userData.username.slice(0, 3)}${parseInt(userData.phone) % 10000}`;
            let newPassword = userData.password;
            if (possibleOldPassword == userData.password) {
                if (typeof (phone) === 'string') phone = parseInt(phone);
                newPassword = `${name.slice(0, 3)}${phone % 10000}`;
            }

            await User.findByIdAndUpdate(req.params.id, {
                rid: regId,
                username: name,
                phone,
                dob,
                fname,
                password: newPassword,
                role: 'Student',
                rollno,
                add,
                gender
            });
            res.json({ success: true, updated: true });
        }
    } catch (err) {
        res.json({ success: false });
    }
})

//Announcement

app.post('/announcement/add', checkAuth, checkPrinciple, async (req, res) => {
    try {
        let newNotification = new Notification({
            title: req.body.title,
            body: req.body.body,
            icon: req.body.icon,
            event: 'Genral',
            scope: "School"
        });
        await newNotification.save();
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false });
    }
})

app.get('/announcement/all', checkAuth, async (req, res) => {
    try {
        let pageNum = parseInt(req.query.page);
        let data = await Notification.aggregate([
            {
                $match: {
                    'scope': 'School'
                }
            }, {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $skip: pageNum * 2,
            },
            {
                $limit: 2
            }
        ])
        res.json({ success: true, data });
    } catch (err) {
        res.json({ success: false });
    }
})

app.get('/announcement/remove/:id', checkAuth, checkPrinciple, async (req, res) => {
    try {
        res.json({ success: true });
        let notify = await Notification.findByIdAndDelete(req.params.id);
        if (notify.icon !== '/img/logo.png')
            await deleteFile(`./static${notify.icon}`);
    } catch (err) {
        res.json({ success: false });
    }
})



// Ebooks
app.get('/Ebooks/:id', checkAuth, checkPrinciple, async (req, res) => {
    let data = await Class.findById(req.params.id);
    if (data) {
        if (req.user.role == 'Principle') {
            res.render('principle_ebook', { className: data.className, classId: req.params.id, canAdd: true });
        }
    }
})

app.get('/ebooks/all/:id', checkAuth, async (req, res) => {
    try {
        let data = await Ebook.aggregate([
            {
                $match: {
                    class: new mongoose.Types.ObjectId(req.params.id)
                }
            }, {
                $sort: {
                    createdAt: -1,
                }
            }
        ])
        res.json({ success: true, data });
    } catch (err) {
        res.json({ success: false });
    }
})



app.post('/ebook/add/:id', checkAuth, async (req, res) => {
    try {
        let ebook = new Ebook({
            url: req.body.url,
            title: req.body.title,
            size: parseInt(req.body.size),
            class: req.params.id
        })
        await ebook.save();
        res.json({ success: true });
        let newNotification = new Notification({
            title: 'New Ebook Added',
            body: `${req.body.title} is added to Ebooks`,
            event: 'Ebook',
            scope: "Class",
            class: req.params.id,
        });
        await newNotification.save();
        sendNotificationToClass(req.params.id, "Ebooks", `Book ${req.body.title} is Added in Classroom`)
    } catch (err) {
        res.json({ success: false });
    }
})

app.get('/ebook/remove/:id', checkAuth, async (req, res) => {
    try {
        let ebook = await Ebook.findByIdAndDelete(req.params.id);
        await deleteFile(`./static/downloads/${ebook.url}`);
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false });
    }
})






//class Work
app.get('/classWork/:id', checkAuth, checkPrinciple, async (req, res) => {
    let data = await Class.findById(req.params.id);
    if (data) {
        if (req.user.role == 'Principle') {
            res.render('principle_classWork', { className: data.className, classId: req.params.id, canAdd: true });
        }
    }
})


app.get('/classWork/all/:id', checkAuth, async (req, res) => {
    try {
        let data = await classWork.aggregate([
            {
                '$match': {
                    'class': new mongoose.Types.ObjectId(req.params.id)
                }
            }, {
                '$sort': {
                    'createdAt': -1
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'author',
                    'foreignField': '_id',
                    'as': 'user'
                }
            }, {
                '$unwind': {
                    'path': '$user',
                    'preserveNullAndEmptyArrays': false
                }
            }, {
                $project: {
                    file: 1,
                    text: 1,
                    size: 1,
                    createdAt: 1,
                    user: {
                        _id: 1,
                        username: 1,
                        profile: 1
                    }
                }
            }
        ])
        res.json({ success: true, data });
    } catch (err) {
        res.json({ success: false });
    }
})


app.post('/classWork/add/:id', checkAuth, async (req, res) => {
    try {
        let work = new classWork({
            file: req.body.file,
            text: req.body.text,
            size: parseInt(req.body.size),
            class: req.params.id,
            author: req.user._id
        })
        await work.save();
        res.json({ success: true });
        let newNotification = new Notification({
            title: 'New Class Work',
            body: 'A new class work is added in classroom',
            event: 'ClassWork',
            scope: "Class",
            class: req.params.id,
        });
        await newNotification.save();
    } catch (err) {
        res.json({ success: false });
    }
})


app.get('/classWork/remove/:id', checkAuth, async (req, res) => {
    try {
        let work = await classWork.findByIdAndDelete(req.params.id);
        res.json({ success: true });
        if (work.file.length) {
            await deleteFile(`./static/downloads/${work.file}`);
        }
    } catch (err) {
        res.json({ success: false });
    }
})




//Attandance
app.get('/attandance/:id', checkAuth, checkPrinciple, async (req, res) => {
    let data = await Class.findById(req.params.id);
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    let attandanceData = await Attendance.aggregate([
        {
            '$match': {
                'class': new mongoose.Types.ObjectId(req.params.id),
                'createdAt': {
                    '$gte': startDate,
                    '$lte': endDate
                }
            }
        }]);
    let todayAttandance = attandanceData.length ? true : false;
    if (data) {
        if (req.user.role == 'Principle') {
            res.render('attandance', { className: data.className, classId: req.params.id, canAdd: true, todayAttandance });
        }
    }
})

app.post('/attandance/upload/:id', checkAuth, async (req, res) => {
    try {
        let attandanceJson = req.body.data;
        let attandanceSheet = Object.entries(attandanceJson).map(data => {
            return {
                userId: data[0],
                attendance: data[1],
            }
        })
        let attandance = new Attendance({
            class: req.params.id,
            author: req.user._id,
            status: attandanceSheet
        })
        await attandance.save();
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false });
    }
})

app.get('/attandance/download/:id', checkAuth, async (req, res) => {
    try {
        let attandanceSheet = await Attendance.aggregate([
            {
                '$match': {
                    '_id': new mongoose.Types.ObjectId(req.params.id)
                }
            }, {
                '$project': {
                    'status': 1,
                    'createdAt': 1
                }
            }, {
                '$unwind': {
                    'path': '$status'
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'status.userId',
                    'foreignField': '_id',
                    'as': 'status.userId'
                }
            }, {
                '$unwind': {
                    'path': '$status.userId'
                }
            }, {
                '$sort': {
                    'status.userId.rollno': 1
                }
            }, {
                '$group': {
                    '_id': '$_id',
                    'date': {
                        '$first': '$createdAt'
                    },
                    'status': {
                        '$push': {
                            'user': '$status.userId',
                            'isPresent': '$status.attendance'
                        }
                    }
                }
            }, {
                '$project': {
                    'status.user.username': 1,
                    'status.isPresent': 1,
                    'status.user.rollno': 1,
                    'status.user.studentId': 1,
                    'date': 1
                }
            }
        ]);
        let jsonSheet = attandanceSheet[0].status.map(obj => {
            return {
                'Roll No': obj.user.rollno,
                'Name': obj.user.username,
                'Attandance': `${obj.isPresent ? 'Present' : 'Absent'}`,
                'Student Id': obj.user.studentId,

            }
        });
        const istDate = new Date(attandanceSheet[0].date);
        const istYear = istDate.getFullYear();
        const istMonth = istDate.toLocaleString('default', { month: 'short' });
        const istDay = istDate.getDate();
        const formattedDateString = `${istDay}_${istMonth}_${istYear}`;
        const workSheet = XLSX.utils.json_to_sheet(jsonSheet);
        const workBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workBook, workSheet, `students`);
        const fileName = `${formattedDateString}-WorkBook-${formattedDateString}_attandance.xlsx`
        const outputPath = `static/downloads/${fileName}`;
        XLSX.writeFile(workBook, outputPath);
        res.json({ success: true, fileName });
    } catch (err) {
        res.json({ success: false });
    }
})

app.get('/attandance/prev/:classID/:date', checkAuth, async (req, res) => {
    try {
        const searchDate = new Date(req.params.date);
        const startDate = new Date(searchDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(searchDate);
        endDate.setHours(23, 59, 59, 999);
        let data = await Attendance.aggregate([
            {
                '$match': {
                    'class': new mongoose.Types.ObjectId(req.params.classID),
                    'createdAt': {
                        '$gte': startDate,
                        '$lte': endDate
                    }
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'author',
                    'foreignField': '_id',
                    'as': 'author'
                }
            }, {
                '$unwind': {
                    'path': '$status'
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'status.userId',
                    'foreignField': '_id',
                    'as': 'status.user'
                }
            }, {
                '$unwind': {
                    'path': '$status.user'
                }
            }, {
                '$group': {
                    '_id': '$_id',
                    'class': {
                        '$first': '$class'
                    },
                    'author': {
                        '$first': '$author'
                    },
                    'createdAt': {
                        '$first': '$createdAt'
                    },
                    'status': {
                        '$push': {
                            'user': '$status.user',
                            'attendance': '$status.attendance'
                        }
                    }
                }
            }, {
                '$project': {
                    'author': 1,
                    'createdAt': 1,
                    'status.attendance': 1,
                    'status.user.username': 1,
                    'status.user._id': 1,
                    'status.user.rollno': 1,
                    'status.user.profile': 1
                }
            }, {
                '$project': {
                    'author.password': 0,
                    'author.role': 0
                }
            }, {
                '$unwind': {
                    'path': '$author'
                }
            }
        ])
        res.json({ success: true, data });
    } catch (err) {
        res.json({ success: false });
    }
})


app.post('/attandance/update/:sheetId', checkAuth, async (req, res) => {
    try {
        let attandanceSheet = req.body.data;
        await Attendance.findByIdAndUpdate(req.params.sheetId, {
            status: attandanceSheet
        })
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false });
    }
})






// Class Announcement

app.get('/announcement/:id', checkAuth, async (req, res) => {
    try {
        let data = await Class.findById(req.params.id);
        if (data) {
            res.render('principle_announcement', { className: data.className, classId: req.params.id });
        }
        else {
            res.render("404")
        }
    } catch (err) {
        res.render("500")
    }
})
app.post('/announcement/add/:id', checkAuth, async (req, res) => {
    try {
        let data = await Class.findById(req.params.id);
        if (data) {
            await (new Notification({
                title: req.body.title,
                body: req.body.body,
                class: req.params.id,
                author: req.user._id,
                scope: "Class",
                event:'Genral'
            })).save();
            res.json({ success: true });
            sendNotificationToClass(req.params.id, req.body.title, req.body.body)
        }
        else {
            res.json({ success: false });
        }
    } catch (err) {
        res.json({ success: false });
    }
})

app.get('/announcement/all/:id', checkAuth, async (req, res) => {
    try {
        let data = await Notification.aggregate([
            {
                '$match': {
                    'scope': 'Class'
                }
            },
            {
                '$match': {
                    'class': new mongoose.Types.ObjectId(req.params.id)
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'author',
                    'foreignField': '_id',
                    'as': 'author'
                }
            }, {
                '$unwind': {
                    'path': '$author'
                }
            }, {
                '$project': {
                    'title': 1,
                    'body': 1,
                    'author._id': 1,
                    'author.username': 1,
                    'author.profile': 1,
                    'createdAt': 1
                }
            }, {
                '$sort': {
                    'createdAt': -1
                }
            }
        ])
        res.json({ success: true, data });
    } catch (err) {
        res.json({ success: false });
    }
})



//Syllabus
app.get('/syllabus/:id', checkAuth, async (req, res) => {
    try {
        let data = await Class.findById(req.params.id);
        if (data) {
            res.render('syllabus', { className: data.className, classId: req.params.id, syllabus: data.syllabus || false });
        }
        else {
            res.render("404")
        }
    } catch (err) {
        res.render("500")
    }
})


app.post('/syllabus/add/:id', checkAuth, async (req, res) => {
    try {
        await Class.findByIdAndUpdate(req.params.id, {
            syllabus: req.body.url,
        })
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false });
    }
})



//Schedule
app.get('/schedule/:id', checkAuth, async (req, res) => {
    try {
        let data = await Class.findById(req.params.id);
        if (data) {
            res.render('schedule', { className: data.className, classId: req.params.id, schedule: data.schedule || false });
        }
        else {
            res.render("404")
        }
    } catch (err) {
        res.render("500")
    }
})


app.post('/schedule/add/:id', checkAuth, async (req, res) => {
    try {
        await Class.findByIdAndUpdate(req.params.id, {
            schedule: req.body.url,
        })
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false });
    }
})



//Result
app.get('/principleResult/:id', checkAuth, async (req, res) => {
    try {
        let data = await Class.findById(req.params.id);
        if (data) {
            res.render('principle_result', { className: data.className, classId: req.params.id });
        }
        else {
            res.render("404")
        }
    } catch (err) {
        res.render("500")
    }
})


app.post('/result/upload/:id', checkAuth, async (req, res) => {
    try {
        let filePath = `./static/downloads/${req.body.url}`;
        fs.readFile(filePath, async (err, data) => {
            await deleteFile(filePath);
            const workbook = XLSX.read(data);
            const sheet_name_list = workbook.SheetNames;
            let resultData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            let JSONResult = [], errorData = [];
            await Promise.all(resultData.map(async item => {
                let student = await User.findOne({ rid: item['Reg. ID'] });
                if (student && student.role === 'Student') {
                    let classData = await userClass(student._id);
                    console.log(classData);
                    if (classData && classData._id.toString() === req.params.id) {
                        let result = resultBuilder(item);
                        JSONResult.push({
                            userId: student._id,
                            desc: result
                        })
                    }
                    else if (classData) {
                        errorData.push({
                            rid: item['Reg. ID'],
                            reasone: `Student of ${classData.className} Class`,
                        })
                    }
                    else {
                        errorData.push({
                            rid: item['Reg. ID'],
                            reasone: `Student of Unknown Class`,
                        })
                    }
                } else {
                    errorData.push({
                        rid: item['Reg. ID'],
                        reasone: "Not a Valid Reg. ID",
                    })
                }
            }))
            if (resultData.length === JSONResult.length) {
                console.log(JSONResult);
                console.log(errorData);
                await (new Result({
                    title: req.body.title,
                    classId: req.params.id,
                    MM: req.body.MM,
                    result: JSONResult
                })).save();

            } else {
                console.log(JSONResult);
                console.log(errorData);
                return res.json({ success: true, uploaded: false, data: errorData });
            }
            res.json({ success: true, uploaded: true });
        })
    } catch (err) {
        console.log(err);
        res.json({ success: false });
    }
})

const resultBuilder = (data) => {
    delete data['Reg. ID'];
    return JSON.stringify(data);
}


app.get('/result/all/:id', checkAuth, async (req, res) => {
    try {
        console.log(req.params.id)
        let data = await Result.aggregate([
            {
                $match: {
                    classId: new mongoose.Types.ObjectId(req.params.id)
                }
            },
            {
                $project: {
                    title: 1,
                    createdAt: 1,
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ])
        res.json({ success: true, data });
    } catch (err) {
        console.log(err)
        res.json({ success: false });
    }
})


app.get('/explainResult/:id/:classId', checkAuth, async (req, res) => {
    try {
        let data = await Class.findById(req.params.classId);
        if (data) {
            res.render('principle_explain_result', { className: data.className, classId: req.params.id, resultId: req.params.id });
        }
        else {
            res.render("404")
        }
    } catch (err) {
        res.render("500")
    }
})


app.get('/result/single/:id', checkAuth, async (req, res) => {
    try {
        let data = await Result.aggregate([
            {
                '$match': {
                    '_id': new mongoose.Types.ObjectId(req.params.id)
                }
            }, {
                '$lookup': {
                    'from': 'classes',
                    'localField': 'classId',
                    'foreignField': '_id',
                    'as': 'class'
                }
            }, {
                '$unwind': {
                    'path': '$class'
                }
            }, {
                '$project': {
                    'title': 1,
                    'MM': 1,
                    'result': 1,
                    'createdAt': 1,
                    'class.className': 1,
                    'class.icon': 1
                }
            }
        ])
        res.json({ success: true, data });
    } catch (err) {
        console.log(err);
        res.json({ success: false });
    }
})

app.get('/result/students/:id', checkAuth, async (req, res) => {
    try {
        let data = await Result.aggregate(
            [
                {
                    '$match': {
                        '_id': new mongoose.Types.ObjectId(req.params.id)
                    }
                }, {
                    '$unwind': {
                        'path': '$result'
                    }
                }, {
                    '$group': {
                        '_id': '$_id',
                        'class': {
                            '$first': '$classId'
                        },
                        'title': {
                            '$first': '$title'
                        },
                        'MM': {
                            '$first': '$MM'
                        },
                        'students': {
                            '$sum': 1
                        }
                    }
                }, {
                    '$lookup': {
                        'from': 'classes',
                        'localField': 'class',
                        'foreignField': '_id',
                        'as': 'class'
                    }
                }, {
                    '$unwind': {
                        'path': '$class'
                    }
                }, {
                    '$unwind': {
                        'path': '$class.students'
                    }
                }, {
                    '$group': {
                        '_id': '$_id',
                        'className': {
                            '$first': '$class.className'
                        },
                        'totalStudents': {
                            '$sum': 1
                        },
                        'resultedStudents': {
                            '$first': '$students'
                        },
                        'title': {
                            '$first': '$title'
                        },
                        'MM': {
                            '$first': '$MM'
                        }
                    }
                }
            ]
        )

        if (data.length) {
            res.render('principle_result_students', { data: data[0] });
        }
        else {
            res.render("404")
        }
    } catch (err) {
        res.render("500")
    }
})

app.get('/result/students/all/:id', checkAuth, async (req, res) => {
    try {
        let data = await Result.aggregate([
            {
                '$match': {
                    '_id': new mongoose.Types.ObjectId(req.params.id)
                }
            }, {
                '$project': {
                    'title': 1,
                    'MM': 1,
                    'result.userId': 1
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'result.userId',
                    'foreignField': '_id',
                    'as': 'result'
                }
            }, {
                '$project': {
                    'title': 1,
                    'MM': 1,
                    'result.username': 1,
                    'result.rollno': 1,
                    'result._id': 1,
                    'result.profile': 1
                }
            }, {
                '$unwind': {
                    'path': '$result'
                }
            }, {
                '$sort': {
                    'result.rollno': 1
                }
            }, {
                '$group': {
                    '_id': '$_id',
                    'title': {
                        '$first': '$title'
                    },
                    'MM': {
                        '$first': '$MM'
                    },
                    'result': {
                        '$push': '$result'
                    }
                }
            }
        ])
        res.json({ success: true, data });
    } catch (err) {
        console.log(err);
        res.json({ success: false });
    }
})

app.get('/result/students/single/:sid/:rid', checkAuth, async (req, res) => {
    try {
        let data = await Result.aggregate(
            [
                {
                    '$match': {
                        '_id': new mongoose.Types.ObjectId(req.params.rid)
                    }
                }, {
                    '$unwind': {
                        'path': '$result'
                    }
                }, {
                    '$match': {
                        'result.userId': new mongoose.Types.ObjectId(req.params.sid)
                    }
                }, {
                    '$lookup': {
                        'from': 'users',
                        'localField': 'result.userId',
                        'foreignField': '_id',
                        'as': 'result.userId'
                    }
                }, {
                    '$unwind': {
                        'path': '$result.userId'
                    }
                }, {
                    '$project': {
                        'title': 1,
                        'MM': 1,
                        'createdAt': 1,
                        'result.userId.username': 1,
                        'result.userId.profile': 1,
                        'result.userId._id': 1
                    }
                }
            ]
        )

        if (data.length) {
            data = data[0];
            data.createdAt = formatTime(data.createdAt);
            console.log(data);
            res.render('result', { data, isPrinciple: req.user.role == 'Principle' });
        }
        else {
            res.render("404")
        }
    } catch (err) {
        res.render("500")
    }
})

app.get('/result/single/:rid/:sid', checkAuth, async (req, res) => {
    try {
        let data = await Result.aggregate([
            {
                '$match': {
                    '_id': new mongoose.Types.ObjectId(req.params.rid)
                }
            }, {
                '$unwind': {
                    'path': '$result'
                }
            }, {
                '$match': {
                    'result.userId': new mongoose.Types.ObjectId(req.params.sid)
                }
            }, {
                '$project': {
                    'result.desc': 1
                }
            }
        ])
        if (data.length) {
            data = JSON.parse(data[0].result.desc);
            res.json({ success: true, data });
        }
    } catch (err) {
        res.json({ success: false });
    }
})




app.get('/result/all/student/:cid', checkAuth, async (req, res) => {
    try {
        let data = await Result.aggregate([
            {
                $match: {
                    classId: new mongoose.Types.ObjectId(req.params.cid),
                    'result.userId': new mongoose.Types.ObjectId(req.user._id),
                }
            },
            {
                $project: {
                    title: 1,
                    createdAt: 1,
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ])
        res.json({ success: true, data });
    } catch (err) {
        res.json({ success: false });
    }
})

app.post('/result/update/resultName/:id', checkAuth, async (req, res) => {
    try {
        await Result.findByIdAndUpdate(req.params.id, { title: req.body.title });
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false });
    }
})


app.post('/result/updatemarks/:uid/:rid', checkAuth, async (req, res) => {
    try {
        await Result.updateOne({ "_id": new mongoose.Types.ObjectId(req.params.rid), "result.userId": new mongoose.Types.ObjectId(req.params.uid) },
            { $set: { "result.$.desc": req.body.result } },)
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false });
    }
})


app.get('/result/remove/:id', checkAuth, async (req, res) => {
    try {
        await Result.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false });
    }
})


export default app;