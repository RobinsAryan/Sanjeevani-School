//Imports 
console.log("Jai Shree Ram!!");
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
import routes from './controller/routes.js';
import http from 'http';
import compression from 'compression';
import cors from 'cors';
import { Server } from 'socket.io';
import ioFunction from './controller/RTC/io.js';


const app = express();


dotenv.config({ path: ".env" });
const memorystore = MemoryStore(expressSession);


//DB connection
(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("connected to data base");
    } catch (err) {
        console.log(err);
    }
})();


//middlewares
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser('random'));
app.use(compression());
app.use(cors());
app.use(expressSession({
    secret: "random",
    resave: true,
    saveUninitialized: true,
    maxAge: 24 * 60 * 60 * 1000,
    store: new memorystore(),
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



// socket io 
let server = http.createServer(app);

let io = new Server({
    maxHttpBufferSize: 1e7,
    transports: ['websocket'],
}).listen(server);

ioFunction(io);




app.use(routes);

//port setup
let port = 8080;
server.listen(port, () => {
    console.log("connected to backend");
})