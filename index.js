//Imports 
import express from 'express';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import expressSession from 'express-session';
import flash from 'connect-flash';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MemoryStore from 'memorystore';
import path from 'path'
import connectMongoDBSession from 'connect-mongodb-session';
import routes from './controller/routes.js';

const app = express();
dotenv.config({ path: ".env" });
const MemorystoreSession = MemoryStore(expressSession);
const MongoDBSession = connectMongoDBSession(expressSession);


//DB connection
(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("connected to data base");
    } catch (err) {
        console.error(err);
    }
})();


//middlewares
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser('random'));
const store = new MongoDBSession({
    uri: process.env.MONGO_URL,
    collection: "mySessions",
    expires: 1000 * 60 * 60 * 24
})
app.use(expressSession({
    secret: "random",
    resave: true,
    saveUninitialized: true,
    maxAge: 24 * 60 * 60 * 1000,
    store: store,
}));
app.use(express.static(path.join(path.resolve(), 'static')))
app.set('view engine', 'ejs');
app.set('views', path.resolve(path.resolve() + '/views'));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function (req, res, next) {
    res.locals.success_messages = req.flash('success_messages');
    res.locals.error_messages = req.flash('error_messages');
    res.locals.error = req.flash('error');
    next();
});


app.use(routes);

//port setup
let port = process.env.PORT || 9090;
app.listen(port, () => {
    console.log("connected to backend");
})