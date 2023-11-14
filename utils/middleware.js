import moment from "moment";
import Class from "../models/Class.js";
import mongoose from "mongoose";
import { putNotification } from "./webPush.js";

export function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        next();
    } else {
        req.flash('error_messages', "Please Login to continue !");
        res.redirect('/login');
    }
}

export const checkPrinciple = (req, res, next) => {
    if (req.user.role === 'Principle') next();
    else {
        req.flash('error_message', "Your are not Principle");
        res.redirect('/');
    }
}

export const formatTime = (time) => {
    if (time === '' || !time) return 'A long Time Ago.'
    const istDate = new Date(time);
    const istYear = istDate.getFullYear();
    const istMonth = istDate.toLocaleString('default', { month: 'short' });
    const istDay = istDate.getDate();
    const istHours = istDate.getHours();
    const istMinutes = istDate.getMinutes();
    const formattedTime = `${istHours.toString().padStart(2, '0')}:${istMinutes.toString().padStart(2, '0')}`;

    const formattedDateString = `${formattedTime} of ${istDay} ${istMonth} ${istYear}`;

    return formattedDateString;
}

export function parseDateString(input) {
    const dateFormats = [
        "YYYY-MM-DD",
        "DD-MM-YYYY",
        "DD-MMM-YYYY",
        "DD/MM/YYYY",
        "DD-MM-YY",
        "D-M-YYYY",
        "YYYY MMM DD",
        "YYYY MMM DD",
    ];

    for (const format of dateFormats) {
        const momentDate = moment(input, format, true);
        if (momentDate.isValid()) {
            return momentDate.toDate();
        }
    }
    return false;
}

export const istToUtc = (date) => {
    const istOffset = 330 * 60 * 1000;
    return new Date(date.getTime() - istOffset);
};



export const sendNotificationToClass = async (classId, title, body) => {
    let allStudents = await Class.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(classId)
            }

        }, {
            $project: {
                students: 1,
            }
        }
    ])
    // console.log(allStudents)
    allStudents = allStudents[0].students;
    if (allStudents.length) {
        allStudents.map(student => {
            putNotification(student, title, body);
        })
    }
}