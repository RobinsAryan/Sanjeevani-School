import express from 'express';
import passport from 'passport';
import passportLocal from './Auth/localAuth.js';
const app = express();
import utilsRoute from './utilsRoute.js'
import classRoute from './classRoutes.js'
import teacherRoute from './teacherRoutes.js'
import userRoute, { userClass } from './userRoutes.js'
import studentRoute from './studentRoutes.js'
import { checkAuth, checkPrinciple } from '../utils/middleware.js';
import webPush from '../utils/webPush.js'
import webRTC from './RTC/liveClass.js'
import rtcServer from './RTC/rtcServer.js'
import logRoute, { createLog } from './logs/logs.js'
import cardRoute from './cards.js';
import feeRoutes from './Fee/fee.js'
passportLocal(passport);


app.get('/', async (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.role === 'Principle') {
            res.render('principle/home.ejs', { profile: req.user.profile, username: req.user.username });
        } else if (req.user.role === 'Teacher') {
            res.render('teachers/home.ejs', { profile: req.user.profile, username: req.user.username, userId: req.user._id });
        }
        else {
            let data = {
                ...req.user
            }
            let today = new Date();
            today.setHours(0, 0, 0, 0);
            if (today.getUTCDate() === data.dob.getUTCDate() && today.getUTCMonth() === data.dob.getUTCMonth()) {
                data["userBirthday"] = 1;
            }
            else data["userBirthday"] = 0;
            let classData = await userClass(req.user._id)
            res.render('students/home.ejs', { data, classData });
        }
    } else {
        res.render("common/base.ejs");
    }
})

app.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        createLog(req.user, "Trys reLogin!!")
        res.redirect('/');
    }
    else {
        res.render("common/login.ejs");
    }
})

app.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        failureRedirect: '/loginFail',
        successRedirect: '/loginSuccess',
        failureFlash: true,
    })(req, res, next);
})

app.get('/loginFail', async (req, res) => {
    createLog(null, `Login Failed msz: ${res.locals.error}`, 'warn');
    res.json({
        success: false,
        msz: res.locals.error.length ? res.locals.error[0] : 'something wrong',
    })
})

app.get('/loginSuccess', checkAuth, async (req, res) => {
    createLog(req.user, 'Logged In!!', 'info');
    res.json({
        success: true,
    })
})


app.get('/logout', (req, res) => {
    createLog(req.user, 'Logged Out!!', 'info');
    req.logout(function (err) {
        req.session.destroy(function (err) {
            res.redirect('/');
        });
    });
});

app.get('/graph', checkPrinciple, (req, res) => {
    createLog(req.user, 'Accessed Graph', 'info');
    res.render('principle/graph.ejs');
})

app.get('/about', (req, res) => {
    createLog(req.user, 'Accessed About', 'info');
    res.render('common/about.ejs');
})

app.use(utilsRoute);
app.use('/class', classRoute);
app.use('/teacher', teacherRoute);
app.use('/user', userRoute);
app.use('/student', studentRoute);
app.use('/RTC', webRTC);
app.use('/rtcServer', rtcServer);
app.use('/cards', cardRoute);
app.use('/logs', logRoute);
app.use('/fee', feeRoutes);
app.use(webPush);
app.get('*', (req, res) => res.render('common/404.ejs'));

export default app;