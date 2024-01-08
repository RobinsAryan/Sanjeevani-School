import express from 'express';
import fs from 'fs';
import readline from 'readline';
import { exec } from 'child_process'
import { createLogger, format, transports } from 'winston';
import { checkAuth, checkPrinciple } from '../../utils/middleware.js';
const app = express();

app.get('/', checkAuth, checkPrinciple, (req, res) => {
    createLog(req.user, 'Accessed Logs', 'info');
    res.render('principle/logs.ejs');
})



app.get('/start', checkAuth, checkPrinciple, async (req, res) => {
    try {
        let lines = await getLastnLines(10);
        lines.push(`$$$ System Time: ${new Date()}`)
        res.json({ success: true, lines });
    } catch (err) {
        res.json({ success: false });
    }
})



const getLastnLines = (n) => {
    return new Promise((resolve) => {
        let lines = [];
        let stream = fs.createReadStream('./static/logs/data.log');
        let rl = readline.createInterface(stream);
        rl.on('line', (e) => {
            lines.push(e);
            if (lines.length > n) lines.shift();
        })
        stream.on('close', () => {
            resolve(lines);
        })
    })
}


app.get('/run', checkAuth, checkPrinciple, async (req, res) => {
    try {
        let cmd = req.query.cmd;
        let check = cmd.split(' ');
        if (check.length == 3 && check[0] == 'last' && (check[2] == 'line' || check[2] == 'lines')) {
            let n = +check[1];
            if (!isNaN(n)) {
                let lines = await getLastnLines(n);
                return res.json({ success: true, from: 'logs', lines });
            }
            else {
                res.json({ success: true, from: 'system', output: { type: 'error', output: 'Cmd not found either on system or logs\nrun logs --help for more' } });
            }
        } else {
            cmd = cmd.split(';').join('&&');
            let output = await executeCmd(cmd);
            res.json({ success: true, from: 'system', output });
        }
    } catch (err) {
        res.json({ success: false });
    }
});


const executeCmd = (cmd) => {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                resolve({ type: 'error', output: error.message })
                return;
            }
            const output = stdout || stderr;
            resolve({ type: 'success', output });
        });
    })
}

let Socketio;
export const ioLogs = (io) => {
    Socketio = io;
}

export const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.simple()
    ),
    transports: [
        new transports.File({ filename: './static/logs/data.log', level: 'info' })
    ]
});

export const createLog = (user, log, type) => {
    let userValue = '';
    if (user) {
        switch (user.role) {
            case 'Principle':
                userValue += 'Principle';
                break;
            case 'Student':
                userValue += `${user.username}(Student) with rid:${user.rid}`;
                break;
            case 'Teacher':
                userValue += `${user.username}(Teacher) with phone:${user.phone}`;
                break;
            default:
                userValue += 'Someone';
                break;
        }
    } else {
        userValue += 'Someone'
    }
    let finalLog = `${userValue}: ${log}`;
    if (type == 'info') {
        logger.info(finalLog);
        Socketio.emit('newLog', 'info: ' + finalLog);
    }
    else if (type == 'warn') {
        logger.warn(finalLog);
        Socketio.emit('newLog', 'warn:' + finalLog);
    }
    else {
        logger.error(finalLog);
        Socketio.emit('newLog', 'error:' + finalLog);
    }
}

export default app;