import moment from "moment";
import Class from "../models/Class.js";
import mongoose from "mongoose";
import { putNotification } from "./webPush.js";
import User from "../models/User.js";
import { createLog } from "../controller/logs/logs.js";


/**
 * 
 * @param {*} req Express Request
 * @param {*} res Express Response
 * @param {*} next Next function to continue execution
 */
export function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        next();
    } else {
        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            res.json({ success: false });
        } else {
            req.flash('error_messages', "Please Login to continue !");
            res.redirect('/login');
        }
    }
}


/**
 * 
 * @param {*} req Express Request
 * @param {*} res Express Response
 * @param {*} next Next function to continue execution
 */
export const checkPrinciple = (req, res, next) => {
    if (req.user.role === 'Principle') next();
    else {
        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            res.json({ success: false });
        } else {
            req.flash('error_messages', "Please Login as Principle !");
            createLog(req.user, 'Invalid Principle Route Accessing', 'warn');
            res.redirect('/');
        }
    }
}


/**
 * 
 * @param {*} time Time to format
 * @returns formated time (xx:xx of xx/xx/xxxx)
 */
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


/**
 * 
 * @param {Date} input date to parse
 * @returns  parsed date
 */
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


/**
 * 
 * @param {Date} date Date object ist
 * @returns utc date
 */
export const istToUtc = (date) => {
    const istOffset = 330 * 60 * 1000;
    return new Date(date.getTime() - istOffset);
};


/**
 * 
 * @param {mongoose.Types.ObjectId} classId _id of class
 * @param {string} title title of notification
 * @param {string} body body of notification
 */
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


/**
 *  
 * @param {string} title title of notification
 * @param {string} body body of notification
 */
export const sendNotificationToSchool = async (title, body) => {
    let allStudents = await User.aggregate([
        {
            $match: {
                role: 'Student'
            }

        }, {
            $project: {
                _id: 1,
            }
        }
    ])
    if (allStudents.length) {
        allStudents.map(student => {
            putNotification(student._id, title, body);
        })
    }
}
