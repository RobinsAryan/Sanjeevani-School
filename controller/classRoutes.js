import express from 'express';
const app = express();
import User from '../models/User.js';
import Class from '../models/Class.js';
import Ebook from '../models/Ebook.js';
import { checkAuth, checkPrinciple, formatTime, istToUtc, parseDateString, sendNotificationToClass } from '../utils/middleware.js';
import mongoose, { isValidObjectId } from 'mongoose';
import { upload } from './utilsRoute.js';
import fs from 'fs';
import XLSX from 'xlsx'
import classWork from '../models/classWork.js';
import Attendance from '../models/Attendance.js';
import { deleteFile } from '../utils/fileOperation.js';
import Notification from '../models/Notification.js';
import { userClass } from './userRoutes.js';
import Result from '../models/Result.js';
import { createLog } from './logs/logs.js';

//class routes
app.get('/single/:id', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.id)) {
            let data = await Class.findById(req.params.id);
            if (data) {
                res.render('principle/class.ejs', {
                    className: data.className,
                    classId: req.params.id,
                    isPrinciple: req.user.role === 'Principle',
                    isInCharge: (req.user.role === 'Principle') || (data.inCharge && data.inCharge.toString() === req.user._id.toString())
                });
                createLog(req.user, 'Accessed Class', 'info');
            }
            else {
                res.render('common/404.ejs');
                noPermissionLog(req.user, 'Class Page')
            }
        }
        else {
            createLog(req.user, 'In class/single/:id Invalid Class Id or no permissible Route', 'warn');
            res.render('common/404.ejs');
        }
    } catch (err) {
        createLog(req.user, 'In class/single/:id Error in getting Class error:' + err, 'error');
        res.render("common/500.ejs");
    }
})



app.get('/all', checkAuth, async (req, res) => {
    try {
        if (req.user.role !== 'Student') {
            let data = await Class.find();
            res.json({ success: true, data });
        }
        else {
            res.json({ success: false });
            noPermissionLog(req.user, 'all Class Info');
        }
    } catch (err) {
        createLog(req.user, 'In class/all Error in getting all Class data error:' + err, 'error');
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
        infoLog(req.user, 'Added a New Class');
    } catch (err) {
        createLog(req.user, 'In class/add Error in adding new Class error:' + err, 'error');
        res.json({ success: false });
    }
})


app.post('/update/className/:id', checkAuth, checkPrinciple, async (req, res) => {
    try {
        if (isValidObjectId(req.params.id)) {
            await Class.findByIdAndUpdate(req.params.id, { className: req.body.className });
            res.json({ success: true });
            infoLog(req.user, 'Update ClassName');
        }
        else {
            createLog(req.user, 'No class exist with provided id ' + req.params.id, 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, 'In class/update/className/:id Error in updating Class Name error:' + err, 'error');
        res.json({ success: false });
    }
})


app.get('/remove/:id', checkAuth, checkPrinciple, async (req, res) => {
    try {
        if (isValidObjectId(req.params.id)) {
            let data = await Class.findByIdAndDelete(req.params.id);
            if (data.icon != "/img/class.jpg") {
                await deleteFile(`./static${data.icon}`);
            }
            if (data.students) {
                data.students.forEach(studentId => {
                    deleteStudent(studentId);
                })
            }
            await Attendance.deleteMany({ class: new mongoose.Types.ObjectId(req.params.id) });
            await classWork.deleteMany({ class: new mongoose.Types.ObjectId(req.params.id) });
            await Ebook.deleteMany({ class: new mongoose.Types.ObjectId(req.params.id) });
            await Notification.deleteMany({ class: new mongoose.Types.ObjectId(req.params.id) });
            res.json({ success: true });
            infoLog(req.user, 'Removed Class', 'info');
        } else {
            createLog(req.user, 'No class exist with provided id ' + req.params.id, 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, 'In class/remove/:id Error in removing Class error:' + err, 'error');
        res.json({ success: false });
    }
})


/**
 * 
 * @param {*} studentId student Id to delete
 */
const deleteStudent = async (studentId) => {
    let data = await User.findByIdAndDelete(studentId);
    if (data.profile) {
        await deleteFile(`./static${data.profile}`);
    }
}




//Incharge routes
app.get('/inCharge/:id', checkAuth, checkPrinciple, async (req, res) => {
    try {
        if (isValidObjectId(req.params.id)) {
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
            infoLog(req.user, 'Accessed Incharges of class');
        } else {
            createLog(req.user, 'No class exist with provided id ' + req.params.id, 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, 'In class/incharge/:id Error in getting Class incharge:' + err, 'error');
        res.json({ success: false });
    }
})

app.get('/setInCharge/:classID/:id', checkAuth, checkPrinciple, async (req, res) => {
    try {
        if (isValidObjectId(req.params.id) && isValidObjectId(req.params.classID)) {
            let userData = await User.findById(req.params.id);
            if (userData.role == 'Teacher') {
                await Class.findByIdAndUpdate(req.params.classID, {
                    inCharge: req.params.id
                });
                res.json({ success: true });
                infoLog(req.user, 'Seted new Incharge');
            } else {
                createLog(req.user, 'Not a Teacher to set a Incharge', 'warn');
                res.json({ success: false });
            }
        } else {
            createLog(req.user, 'No class exist with provided id ' + req.params.classID, 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, 'In class/setInCharge/:classID/:id Error in setting Class Incharge error:' + err, 'error');
        res.json({ success: false });
    }
})







//students routes
app.get('/student/:cid', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.cid)) {
            let data = await Class.findById(req.params.cid);
            if (data) {
                res.render('principle/student.ejs', {
                    className: data.className,
                    classId: req.params.cid,
                    isPrinciple: req.user.role === 'Principle'
                });
                infoLog(req.user, 'Accessed Class Students');
            }
            else {
                createLog(req.user, 'No class exist with provided id ' + req.params.cid, 'warn');
                res.render("common/404.ejs");
            }
        } else {
            createLog(req.user, 'No class exist with provided id or Student Forbiden Route /student/:cid', 'warn');
            res.render("common/404.ejs");
        }
    } catch (err) {
        createLog(req.user, 'In class/student/:cid Error in getting Class students error:' + err, 'error');
        res.render("common/500.ejs");
    }
})

app.get('/students/all/:classID', checkAuth, async (req, res) => {
    try {
        if (isValidObjectId(req.params.classID)) {
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
                        'student._id': 1,
                        'student.rollno': 1,
                        'student.username': 1,
                        'student.rid': 1,
                        'student.phone': 1,
                        'student.fname': 1,
                        'student.profile': 1,
                        '_id': 0
                    }
                }, {
                    '$sort': {
                        'student.rollno': 1
                    }
                }
            ])
            res.json({ success: true, data });
        } else {
            createLog(req.user, 'No class exist with provided id ' + req.params.classID, 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, 'In class/student/all/:classID Error in getting all Class students error:' + err, 'error');
        res.json({ success: false });
    }
})


/**
 * 
 * @param {*} data student Data
 * @param {*} id class Id
 * @returns student added or not
 */
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
            createLog(req.user, 'In addStudent Error in adding new student error:' + err, 'error');
            resolve({ success: false });
        }
    })
}



app.post('/addSingleStudent/:classID', checkAuth, checkPrinciple, async (req, res) => {
    try {
        if (isValidObjectId(req.params.classID)) {
            let classData = await Class.findById(req.params.classID);
            if (!classData) return res.json({ success: false });
            let phone = req.body.phone;
            phone = (typeof (phone) === 'number' ? parseInt((phone.toString()).split('-').pop()) : parseInt(phone.split('-').pop()));
            req.body.phone = phone;
            let dob = parseDateString(req.body.dob);
            if (!dob) return res.json({ success: true, added: false, msz: "Invalid Dob" });
            req.body.dob = dob;
            let resData = await addStudent(req.body, req.params.classID);
            res.json(resData);
            infoLog(req.user, 'Add a new Single student');
        } else {
            createLog(req.user, 'No class exist with provided id ' + req.params.classID, 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, 'In /addSingleStudent/:classId Error in adding new single student error:' + err, 'error');
        res.json({ success: false });
    }
})




app.post('/addMultipleStudents/:classID', checkAuth, checkPrinciple, upload.single('file'), async (req, res) => {
    try {
        if (isValidObjectId(req.params.classID)) {
            let classData = await Class.findById(req.params.classID);
            if (!classData) return res.json({ success: false });
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
                        infoLog(req.user, "New Students added via uploading sheet");
                    } else {
                        res.json({ success: true, allInserted: true, total: students.length });
                        infoLog(req.user, "New Students added via uploading sheet");
                    }
                } catch (err) {
                    createLog(req.user, 'In /addMultipleStudent/:classId Error in reading file:' + req.file.path + 'Error: ' + err, 'error');
                    res.json({ success: false });
                }
            });
        } else {
            createLog(req.user, 'No class exist with provided id ' + req.params.classID, 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, 'In /addMultipleStudent/:classId Error in adding new multiple students error:' + err, 'error');
        res.json({ success: false });
    }
})


app.post('/updateStudent/:id', checkAuth, checkPrinciple, async (req, res) => {
    try {
        if (isValidObjectId(req.params.id)) {
            let userData = await User.findById(req.params.id);
            if (!userData && userData.role !== "Student") res.json({ success: false });
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
                infoLog(req.user, 'Updated Studnet');
            }
        } else {
            createLog(req.user, 'No student exist with provided id ' + req.params.id, 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In /updatestudent/:id during updating Student info Error:" + err, 'error');
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
        infoLog(req.user, "Added a New Announcement");
    } catch (err) {
        createLog(req.user, "In /announcement/add during creating Announcement info Error:" + err, 'error');
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
        createLog(req.user, "In /announcement/all during getting Announcement info Error:" + err, 'error');
        res.json({ success: false });
    }
})

app.get('/announcement/remove/:id', checkAuth, checkPrinciple, async (req, res) => {
    try {
        if (isValidObjectId(req.params.id)) {
            res.json({ success: true });
            let notify = await Notification.findByIdAndDelete(req.params.id);
            if (notify.icon !== '/img/logo.png')
                await deleteFile(`./static${notify.icon}`);
            infoLog(req.user, "New Announcement Added");
        } else {
            createLog(req.user, 'No Announcemnet exist with provided id ' + req.params.id, 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In /announcement/remove/:id during removing Announcement info Error:" + err, 'error');
        res.json({ success: false });
    }
})



// Ebooks
app.get('/Ebooks/:id', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.id)) {
            let data = await Class.findById(req.params.id);
            if (data) {
                res.render('principle/ebook.ejs', {
                    className: data.className,
                    classId: req.params.id,
                    canAdd: true
                });
                infoLog(req.user, 'Accessed Ebooks');
            } else {
                createLog(req.user, 'No class exist with provided id ' + req.params.id, 'warn');
                res.render('common/404.ejs');
            }
        }
        else {
            noPermissionLog(req.user, "Principle/Teacher Ebook Page");
            res.render('common/404.ejs');
        }
    } catch (err) {
        createLog(req.user, "In /Ebooks/:id during getting Ebook Page info Error:" + err, 'error');
        res.render("common/500.ejs");
    }
})

app.get('/ebooks/all/:id', checkAuth, async (req, res) => {
    try {
        if (isValidObjectId(req.params.id)) {
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
        } else {
            createLog(req.user, 'No class exist with provided id ' + req.params.id, 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In /Ebooks/all/:id during getting all Ebooks info Error:" + err, 'error');
        res.json({ success: false });
    }
})



app.post('/ebook/add/:id', checkAuth, async (req, res) => {
    try {
        if (req.user != 'Student' && isValidObjectId(req.params.id)) {
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
        } else {
            createLog(req.user, "Invalid Id or Studnet trying to Add New Ebooks", 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In /ebook/add/:id during adding Ebooks info Error:" + err, 'error');
        res.json({ success: false });
    }
})

app.get('/ebook/remove/:id', checkAuth, async (req, res) => {
    try {
        if (req.user != 'Student' && isValidObjectId(req.params.id)) {
            let ebook = await Ebook.findByIdAndDelete(req.params.id);
            await deleteFile(`./static/downloads/${ebook.url}`);
            infoLog(req.user, 'Removed Ebooks');
            res.json({ success: true });
        } else {
            createLog(req.user, "Invalid Id or Studnet trying to remove Ebooks", 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In /ebook/remove/:id during removing Ebooks info Error:" + err, 'error');
        res.json({ success: false });
    }
})






//class Work
app.get('/classWork/:id', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.id)) {
            let data = await Class.findById(req.params.id);
            if (data) {
                res.render('principle/classWork.ejs', {
                    className: data.className,
                    classId: req.params.id,
                    canAdd: true
                });
                infoLog(req.user, 'Accessed Classwork Page');
            }
            else {
                createLog(req.user, 'No class exist with provided id ' + req.params.id, 'warn');
                res.render('common/404.ejs');
            }
        }
        else {
            createLog(req.user, "Invalid Id or Studnet trying to access principle/teacher classwork", 'warn');
            res.render('common/404.ejs');
        }
    } catch (err) {
        createLog(req.user, "In /classWork/:id during getting classwork Page info Error:" + err, 'error');
        res.render("common/500.ejs");
    }
})


app.get('/classWork/all/:id', checkAuth, async (req, res) => {
    try {
        if (isValidObjectId(req.params.id)) {
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
        } else {
            createLog(req.user, "Invalid Id", 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In /classWork/all/:id during getting all classwork info Error:" + err, 'error');
        res.json({ success: false });
    }
})


app.post('/classWork/add/:id', checkAuth, async (req, res) => {
    try {
        if (req.user.role !== 'Student' && isValidObjectId(req.params.id) && await Class.findById(req.params.id)) {
            let work = new classWork({
                file: req.body.file,
                text: req.body.text,
                size: parseInt(req.body.size),
                class: req.params.id,
                author: req.user._id
            })
            await work.save();
            infoLog(req.user, 'Added new Classwork');
            res.json({ success: true });
            let newNotification = new Notification({
                title: 'New Class Work',
                body: 'A new class work is added in classroom',
                event: 'ClassWork',
                scope: "Class",
                class: req.params.id,
            });
            await newNotification.save();
        }
        else {
            createLog(req.user, "Invalid Id or Studnet trying to add classwork", 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In /classWork/add/:id during adding classwork info Error:" + err, 'error');
        res.json({ success: false });
    }
})


app.get('/classWork/remove/:id', checkAuth, async (req, res) => {
    try {
        if (req.user.role !== 'Student' && isValidObjectId(req.params.id)) {
            let work = await classWork.findByIdAndDelete(req.params.id);
            res.json({ success: true });
            if (work.file.length) {
                await deleteFile(`./static/downloads/${work.file}`);
            }
            infoLog(req.user, 'Classwork Removed');
        } else {
            createLog(req.user, "Invalid Id or Studnet trying to remove classwork", 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In /classWork/remove/:id during removing classwork info Error:" + err, 'error');
        res.json({ success: false });
    }
})




//Attandance
app.get('/attandance/:id', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.id) && await Class.findById(req.params.id)) {
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
                res.render('principle/attandance.ejs', {
                    className: data.className,
                    classId: req.params.id,
                    isPrinciple: req.user.role === 'Principle',
                    todayAttandance
                });
            }
            infoLog(req.user, 'Accessed Attandance');
        }
        else {
            createLog(req.user, "Invalid Id or Studnet trying to access Principle/Teacher Attandance Routes", 'warn');
            res.render('common/404.ejs');
        }
    } catch (err) {
        createLog(req.user, "In /attandance/:id during getting attandance Page info Error:" + err, 'error');
        res.render("common/500.ejs");
    }
})

app.post('/attandance/upload/:id', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.id) && await Class.findById(req.params.id)) {
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
        } else {
            createLog(req.user, "Invalid Id or Studnet trying to uploading Attandance", 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In /attandance/upload/:id during uploading attandance info Error:" + err, 'error');
        res.json({ success: false });
    }
})

app.get('/attandance/download/:id', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.id) && await Attendance.findById(req.params.id)) {
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
                        'status.user.rid': 1,
                        'date': 1
                    }
                }
            ]);
            let jsonSheet = attandanceSheet[0].status.map(obj => {
                return {
                    'Roll No': obj.user.rollno,
                    'Name': obj.user.username,
                    'Attandance': `${obj.isPresent ? 'Present' : 'Absent'}`,
                    'Reg. ID': obj.user.rid,

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
        } else {
            createLog(req.user, "Invalid Id or Studnet trying to download attandance", 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In /attandance/download/:id during downloading attandance info Error:" + err, 'error');
        res.json({ success: false });
    }
})

app.get('/attandance/prev/:classID/:date', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.classID) && await Class.findById(req.params.classID)) {
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
        } else {
            createLog(req.user, "Invalid Id or Studnet trying to load class prev attandance", 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In /attandance/prev/:classID/:date during getting previous attandance info Error:" + err, 'error');
        res.json({ success: false });
    }
})


app.post('/attandance/update/:sheetId', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.sheetId) && await Attendance.findById(req.params.sheetId)) {
            let attandanceSheet = req.body.data;
            await Attendance.findByIdAndUpdate(req.params.sheetId, {
                status: attandanceSheet
            })
            res.json({ success: true });
            infoLog("Attandance Updated");
        } else {
            createLog(req.user, "Invalid Id or Studnet trying to updating attandance", 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In /attandance/update/:sheetId during updating previous attandance info Error:" + err, 'error');
        res.json({ success: false });
    }
})

app.get('/attandance/download/all/:classId', checkAuth, checkPrinciple, async (req, res) => {
    try {
        if (isValidObjectId(req.params.classId) && await Class.findById(req.params.classId)) {
            let attandanceSheet = await Attendance.aggregate(
                [
                    {
                        $match: {
                            'class': new mongoose.Types.ObjectId(req.params.classId)
                        }
                    },
                    {
                        '$project': {
                            'status.userId': 1,
                            'status.attendance': 1,
                            'createdAt': 1
                        }
                    }, {
                        '$sort': {
                            'createdAt': 1
                        }
                    }, {
                        '$unwind': {
                            'path': '$status'
                        }
                    }, {
                        '$group': {
                            '_id': '$status.userId',
                            'status': {
                                '$push': {
                                    'date': '$createdAt',
                                    'status': '$status.attendance'
                                }
                            }
                        }
                    }, {
                        '$lookup': {
                            'from': 'users',
                            'localField': '_id',
                            'foreignField': '_id',
                            'as': 'user'
                        }
                    }, {
                        '$project': {
                            'status': 1,
                            'user.username': 1,
                            'user.rid': 1,
                            'user.rollno': 1
                        }
                    }, {
                        '$unwind': {
                            'path': '$user'
                        }
                    }, {
                        '$sort': {
                            'user.rollno': 1
                        }
                    }

                ]);
            let jsonSheet = attandanceSheet.map(obj => {
                return {
                    'Reg. ID': obj.user.rid,
                    'Roll No': obj.user.rollno,
                    'Name': obj.user.username,
                    'attandance': obj.status,
                }
            });
            jsonSheet.map(obj => {
                let attandance = obj.attandance;
                delete obj.attandance;
                attandance.map(obj2 => {
                    let date = new Date(obj2.date);
                    obj[`${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`] = obj2.status ? 'P' : 'A';
                })
            })
            const workSheet = XLSX.utils.json_to_sheet(jsonSheet);
            const workBook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workBook, workSheet, `students`);
            const fileName = `WorkBook_attandance.xlsx`
            const outputPath = `static/downloads/${fileName}`;
            XLSX.writeFile(workBook, outputPath);
            res.json({ success: true, fileName });
            infoLog(req.user, 'Attandance of all class downloaded');
        }
        else {
            createLog(req.user, "Invalid Id to download all class attandance" + req.params.classId, 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In /attandance/download/:id during downloading previous attandance info Error:" + err, 'error');
        res.json({ success: false });
    }
})

app.get('/attandance/remove/all/:cid', checkAuth, checkPrinciple, async (req, res) => {
    try {
        if (isValidObjectId(req.params.cid) && await Class.findById(req.params.id)) {
            let data = await Attendance.deleteMany({ class: req.params.cid });
            res.json({ success: true, data });
            infoLog(req.user, 'Attandance of class removed');
        } else {
            createLog(req.user, "Invalid Id to remove all class attandance" + req.params.classId, 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In /attandance/remove/all/:cid during removing all attandance of a class info Error:" + err, 'error');
        res.json({ success: false });
    }
})




// Class Announcement

app.get('/announcement/:id', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.id)) {
            let data = await Class.findById(req.params.id);
            if (data) {
                res.render('principle/announcement.ejs', { className: data.className, classId: req.params.id });
                infoLog(req.user, 'Accessed Announcement Page');
            }
            else {
                createLog(req.user, 'No class exist with provided id ' + req.params.id, 'warn');
                res.render("common/404.ejs");
            }
        } else {
            createLog(req.user, "Invalid Id or Studnet trying to access principle/teacher announcement page", 'warn');
            res.render("common/404.ejs");
        }
    } catch (err) {
        createLog(req.user, "In /announcement/:id during getting class announcement page info Error:" + err, 'error');
        res.render("common/500.ejs");
    }
})
app.post('/announcement/add/:id', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.id)) {
            let data = await Class.findById(req.params.id);
            if (data) {
                await (new Notification({
                    title: req.body.title,
                    body: req.body.body,
                    class: req.params.id,
                    author: req.user._id,
                    scope: "Class",
                    event: 'Genral'
                })).save();
                res.json({ success: true });
                sendNotificationToClass(req.params.id, req.body.title, req.body.body)
                infoLog(req.user, 'Announcement Added');
            }
            else {
                createLog(req.user, 'No class exist with provided id ' + req.params.id, 'warn');
                res.json({ success: false });
            }
        }
        else {
            createLog(req.user, "Invalid Id or Studnet trying to add Announcement", 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In /announcement/add/:id during adding class announcement info Error:" + err, 'error');
        res.json({ success: false });
    }
})

app.get('/announcement/all/:id', checkAuth, async (req, res) => {
    try {
        if (isValidObjectId(req.params.id)) {
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
        } else {
            createLog(req.user, "Invalid Id", 'warn');
        }
    } catch (err) {
        createLog(req.user, "In /announcement/all/:id during getting all class announcement info Error:" + err, 'error');
        res.json({ success: false });
    }
})



//Syllabus
app.get('/syllabus/:id', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.id)) {
            let data = await Class.findById(req.params.id);
            if (data) {
                infoLog(req.user, "Accessed Syllabus");
                res.render('principle/syllabus.ejs', { className: data.className, classId: req.params.id, syllabus: data.syllabus || false });
            }
            else {
                createLog(req.user, 'No class exist with provided id ' + req.params.id, 'warn');
                res.render("common/404.ejs");
            }
        } else {
            createLog(req.user, "Invalid Id or Studnet trying to access add syllabus page", 'warn');
            res.render("common/404.ejs");
        }
    } catch (err) {
        createLog(req.user, "In syllabus/:id during getting syllabus info Error:" + err, 'error');
        res.render("common/500.ejs")
    }
})


app.post('/syllabus/add/:id', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.id)) {
            await Class.findByIdAndUpdate(req.params.id, {
                syllabus: req.body.url,
            })
            res.json({ success: true });
            infoLog("Syllabus Added");
        } else {
            createLog(req.user, "Invalid Id or Studnet trying to access add syllabus", 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In syllabus/add/:id during adding syllabus info Error:" + err, 'error');
        res.json({ success: false });
    }
})



//Schedule
app.get('/schedule/:id', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.id)) {
            let data = await Class.findById(req.params.id);
            if (data) {
                res.render('principle/schedule.ejs', { className: data.className, classId: req.params.id, schedule: data.schedule || false });
                infoLog(req.user, "Accessed Schedule Page");
            }
            else {
                createLog(req.user, 'No class exist with provided id ' + req.params.id, 'warn');
                res.render("common/404.ejs")
            }
        }
        else {
            createLog(req.user, "Invalid Id or Studnet trying to access add schedule page", 'warn');
            res.render("common/404.ejs")
        }
    } catch (err) {
        createLog(req.user, "In /schedule/:id during getting schedule page info Error:" + err, 'error');
        res.render("common/500.ejs")
    }
})


app.post('/schedule/add/:id', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.id)) {
            await Class.findByIdAndUpdate(req.params.id, {
                schedule: req.body.url,
            })
            res.json({ success: true });
            infoLog(req.user, 'Add Schedule');
        } else {
            createLog(req.user, "Invalid Id or Studnet trying to access add schedule", 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In /schedule/add/:id during adding schedule info Error:" + err, 'error');
        res.json({ success: false });
    }
})



//Result
app.get('/principleResult/:id', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.id)) {
            let data = await Class.findById(req.params.id);
            if (data) {
                res.render('principle/result.ejs', {
                    className: data.className,
                    classId: req.params.id,
                    isInCharge: (req.user.role === 'Principle') || (data.inCharge && data.inCharge.toString() === req.user._id.toString())
                });
                infoLog(req.user, "Accessed Principle/Techer Result Page");
            }
            else {
                createLog(req.user, 'No class exist with provided id ' + req.params.id, 'warn');
                res.render("common/404.ejs")
            }
        }
        else {
            createLog(req.user, "Invalid Id or Studnet trying to access Priciple/techer result page", 'warn');
            res.render("common/404.ejs")
        }
    } catch (err) {
        createLog(req.user, "In /principleResult/:id during getting result Page info Error:" + err, 'error');
        res.render("common/500.ejs")
    }
})


app.post('/result/upload/:id', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.id)) {
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
                    await (new Result({
                        title: req.body.title,
                        classId: req.params.id,
                        MM: req.body.MM,
                        result: JSONResult
                    })).save();
                } else {
                    return res.json({ success: true, uploaded: false, data: errorData });
                }
                infoLog(req.user, "Result Uploaded");
                res.json({ success: true, uploaded: true });
            })
        } else {
            createLog(req.user, "Invalid Id or Studnet trying to add Result", 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In /result/upload/:id during uploading result info Error:" + err, 'error');
        res.json({ success: false });
    }
})

const resultBuilder = (data) => {
    delete data['Reg. ID'];
    return JSON.stringify(data);
}


app.get('/result/all/:id', checkAuth, async (req, res) => {
    try {
        if (isValidObjectId(req.params.id)) {
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
        } else {
            createLog(req.user, "Invalid Id", 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In /result/all/:id during getting all result info Error:" + err, 'error');
        res.json({ success: false });
    }
})


app.get('/explainResult/:id/:classId', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.id) && isValidObjectId(req.params.classId)) {
            let data = await Class.findById(req.params.classId);
            if (data) {
                res.render('principle/explain_result.ejs', {
                    className: data.className,
                    classId: data._id,
                    resultId: req.params.id,
                    isInCharge: (req.user.role === 'Principle') || (data.inCharge && data.inCharge.toString() === req.user._id.toString())
                });
                infoLog(req.user, 'Accessed Explaine Result');
            }
            else {
                createLog(req.user, 'No class exist with provided id ' + req.params.classId, 'warn');
                res.render("common/404.ejs")
            }
        } else {
            createLog(req.user, "Invalid Id or Studnet trying to access class Explain Result page", 'warn');
            res.render("common/404.ejs")
        }
    } catch (err) {
        createLog(req.user, "In /explainResult/:id/:classId during getting explained result page info Error:" + err, 'error');
        res.render("common/500.ejs")
    }
})


app.get('/result/single/:id', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.id)) {
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
        } else {
            createLog(req.user, "Invalid Id or Studnet trying to access forbiden routes", 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In result/single/:id during getting single student result info Error:" + err, 'error');
        res.json({ success: false });
    }
})

app.get('/result/students/:id', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.id)) {
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
                res.render('principle/result_students.ejs', { data: data[0] });
                infoLog(req.user, 'Accessed Result students');
            }
            else {
                res.render("common/404.ejs")
                createLog(req.user, "Invalid result id or result with no student", 'warn');
            }
        } else {
            createLog(req.user, "Invalid Id or Studnet trying to access forbiden routes", 'warn');
            res.render("common/404.ejs")
        }
    } catch (err) {
        createLog(req.user, "In result/students/:id during getting result student page info Error:" + err, 'error');
        res.render("common/500.ejs")
    }
})

app.get('/result/students/all/:id', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.id)) {
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
        } else {
            createLog(req.user, "Invalid Id or Studnet trying to access forbiden routes", 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In result/students/all/:id during getting result students info Error:" + err, 'error');
        res.json({ success: false });
    }
})

app.get('/result/students/single/:sid/:rid', checkAuth, async (req, res) => {
    try {
        if (isValidObjectId(req.params.sid) && isValidObjectId(req.params.rid)) {
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
                            'result.userId._id': 1,
                            'classId': 1
                        }
                    },
                    {
                        $lookup: {
                            'from': 'classes',
                            'localField': 'classId',
                            'foreignField': '_id',
                            'as': 'class'
                        }
                    },
                    {
                        $project: {
                            'title': 1,
                            'MM': 1,
                            'createdAt': 1,
                            'result.userId.username': 1,
                            'result.userId.profile': 1,
                            'result.userId._id': 1,
                            'class.inCharge': 1
                        }
                    },
                    {
                        $unwind: {
                            'path': '$class',
                            preserveNullAndEmptyArrays: true,
                        }
                    }
                ]
            )
            if (data.length) {
                data = data[0];
                data.createdAt = formatTime(data.createdAt); 
                res.render('common/result.ejs', { data, isPrinciple: (req.user.role === 'Principle') || (data.class.inCharge && data.class.inCharge.toString() === req.user._id.toString()) });
                infoLog(req.user, "Accessed Result Routes");
            }
            else {
                createLog(req.user, "Invalid result id or result with no student", 'warn');
                res.render("common/404.ejs")
            }
        } else {
            createLog(req.user, "Invalid Id", 'warn');
            res.render("common/404.ejs")
        }
    } catch (err) {
        createLog(req.user, "In /result/students/single/:sid/:rid during getting result of single student page info Error:" + err, 'error');
        res.render("common/500.ejs")
    }
})

app.get('/result/single/:rid/:sid', checkAuth, async (req, res) => {
    try {
        if (isValidObjectId(req.params.sid) && isValidObjectId(req.params.rid)) {
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
            else {
                createLog(req.user, "Invalid result id or result with no student", 'warn');
                res.json({ success: false });
            }
        } else {
            createLog(req.user, "Invalid Id", 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In /result/single/:rid/:sid during getting result of single student info Error:" + err, 'error');
        res.json({ success: false });
    }
})



//student accessing all result in which he/she present in class
app.get('/result/all/student/:cid', checkAuth, async (req, res) => {
    try {
        if (isValidObjectId(req.params.cid)) {
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
        } else {
            createLog(req.user, "Invalid Id", 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In /result/all/student/:cid during getting all results of student info Error:" + err, 'error');
        res.json({ success: false });
    }
})

app.post('/result/update/resultName/:id', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.id)) {
            await Result.findByIdAndUpdate(req.params.id, { title: req.body.title });
            res.json({ success: true });
            infoLog(req.user, "Result name Updated");
        } else {
            createLog(req.user, "Invalid result id or student trying ro change result name", 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In /result/update/resultName/:id during updating result name info Error:" + err, 'error');
        res.json({ success: false });
    }
})


app.post('/result/updatemarks/:uid/:rid', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.uid) && isValidObjectId(req.params.rid)) {
            await Result.updateOne({ "_id": new mongoose.Types.ObjectId(req.params.rid), "result.userId": new mongoose.Types.ObjectId(req.params.uid) },
                { $set: { "result.$.desc": req.body.result } },)
            res.json({ success: true });
            infoLog(req.user, 'Marks updated');
        } else {
            createLog(req.user, "Invalid Id or Studnet trying to update marks", 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In /result/updatemarks/:uid/:rid during updating marks of a studnet with id as uid info Error:" + err, 'error');
        res.json({ success: false });
    }
})


app.get('/result/remove/:id', checkAuth, async (req, res) => {
    try {
        if (req.user.role != 'Student' && isValidObjectId(req.params.id)) {
            await Result.findByIdAndDelete(req.params.id);
            res.json({ success: true });
            infoLog(req.user, "Result Removed");
        } else {
            createLog(req.user, "Invalid Id or Studnet trying to remove result", 'warn');
            res.json({ success: false });
        }
    } catch (err) {
        createLog(req.user, "In /result/remove//:id during removing result info Error:" + err, 'error');
        res.json({ success: false });
    }
})


const noPermissionLog = (user, item) => {
    createLog(user, 'No Permission to Access ' + item, 'warn');
}

const infoLog = (user, log) => {
    createLog(user, log, 'info');
}

export default app;