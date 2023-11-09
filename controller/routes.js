import express from 'express';
import passport from 'passport';
import passportLocal from './Auth/localAuth.js';
const app = express();
import utilsRoute from './utilsRoute.js'
import classRoute from './classRoutes.js'
import teacherRoute from './teacherRoutes.js'
import userRoute, { userClass } from './userRoutes.js'
import studentRoute from './studentRoutes.js'
import { checkAuth } from '../utils/middleware.js';
import webPush from '../utils/webPush.js'
passportLocal(passport);


app.get('/', async (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.role === 'Principle') {
            res.render('principle_home', { profile: req.user.profile, username: req.user.username });
        } else if (req.user.role === 'Teacher') {
            res.render('teacher_home');
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
            res.render('home', { data, classData });
        }
    } else {
        res.render("base");
    }
})

app.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/');
    }
    else {
        res.render("login");
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
    res.json({
        success: false,
        msz: res.locals.error.length ? res.locals.error[0] : 'something wrong',
    })
})

app.get('/loginSuccess', checkAuth, async (req, res) => {
    res.json({
        success: true,
    })
})


app.get('/logout', (req, res) => {
    req.logout(function (err) {
        req.session.destroy(function (err) {
            res.redirect('/');
        });
    });
});

app.get('/home', checkAuth, async (req, res) => {
    res.render('home', { username: req.user.username, amount: (await roomPrice()).amount });
})

app.get('/help', (req, res) => {
    res.render('help');
})

app.use(utilsRoute);

app.use('/class', classRoute);
app.use('/teacher', teacherRoute);
app.use('/user', userRoute);
app.use('/student', studentRoute);
app.use(webPush);

export default app;