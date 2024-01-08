let linesContainer = document.getElementById('lines');
let cursor = document.getElementById('cursor');
let fakeCursor = document.getElementById('fakeCursor');
let cmdInput = document.getElementById('cmdInput');

let speed = 10, isType = true, typeTime = [], cmdHistory = [], inbuiltCmd = ['cls', 'clear', 'erase', 'remove', 'history', 'exit','robins'];
window.onload = () => {
    feedLastLines();
    adjustInputWidth(cursor.children[0]);
}

function getLogLevel(logString) {
    if (/error:/i.test(logString)) {
        return 'error';
    } else if (/info:/i.test(logString)) {
        return 'info';
    } else if (/warn:/i.test(logString)) {
        return 'warn';
    } else {
        return 'info';
    }
}

const feedLastLines = async () => {
    try {
        let resData = await myGET('/logs/start');
        if (resData.success) {
            isType = true;
            let lines = resData.lines;
            let time = 0;
            lines.forEach(line => {
                let logLevel = getLogLevel(line);
                let lineArray = line.split(' ');
                let id = setTimeout(() => appendLine(lineArray, logLevel), time);
                time += speed * lineArray.length;
                typeTime.push(id);
            });
        } else {
            alert('Something Wrong!!');
        }
    } catch (err) {
        console.log(err);
    }
}

let lineNo = 1;
const appendLine = (lineArray, logLevel, type = 'output') => {
    if (isType || type === 'input') {
        let newLine = document.createElement('p');
        newLine.classList.add('line', type, logLevel);
        newLine.style.whiteSpace = 'pre-wrap';
        linesContainer.append(newLine);
        newLine.innerHTML += `<span>${lineNo++}.  </span>`
        let i = 0, n = lineArray.length;
        const interval = setInterval(() => {
            if (i < n && (isType || type === 'input')) {
                newLine.innerText += lineArray[i];
                newLine.innerText += ' ';
                i++;
            } else {
                cursor.scrollIntoView();
                clearInterval(interval);
            }
        }, speed);
    }
}


const cmdInputFocus = () => {
    cmdInput.focus();
}


cmdInput.onfocus = () => { fakeCursor.classList.add('blink') };
cmdInput.onblur = () => { fakeCursor.classList.remove('blink') };


cmdInput.onkeydown = async (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        let value = cmdInput.innerText;
        cmdInput.innerHTML = '';
        value = value.trim();
        if (value.length) {
            cancelExe();
            runCmd(value);
            cmdHistory.push(value);
            value = '>> ' + value;
            value = value.split(' ');
            appendLine(value, 'info', 'input');
        }
    }
}



const runCmd = async (cmd) => {
    if (inbuiltCmd.includes(cmd)) {
        runInbuildCmd(cmd);
        return;
    }
    else if (cmd.split(' ').length == 2 && cmd.split(' ')[0] == 'speed') {
        if (!isNaN(cmd.split(' ')[1])) {
            speed = +cmd.split(' ')[1];
            setTimeout(() => {
                value = `printing speed set to ${speed}`;
                value = value.split(' ');
                appendLine(value, 'warn', 'input');
            }, 2000);
            return;
        }
    }
    let resData = await myGET(`/logs/run?cmd=${cmd}`);
    if (resData.success) {
        isType = true;
        if (resData.from === 'system') {
            let lines = resData.output.output;
            lines = lines.split(/\r?\n/).filter(line => line.trim() !== '');
            let time = 0;
            lines.forEach(line => {
                let lineArray = line.split(' ');
                let id = setTimeout(() => appendLine(lineArray, 'info', resData.output.type), time);
                time += speed * lineArray.length;
                typeTime.push(id);
            });
        } else {
            let lines = resData.lines;
            let time = 0;
            lines.forEach(line => {
                let logLevel = getLogLevel(line);
                let lineArray = line.split(' ');
                let id = setTimeout(() => appendLine(lineArray, logLevel), time);
                time += speed * lineArray.length;
                typeTime.push(id);
            });
        }
    } else {
        alert('Something Wrong!!');
    }
}




const runInbuildCmd = (cmd) => {
    if (cmd == 'cls' || cmd == 'clear' || cmd == 'erase' || cmd == 'remove') {
        linesContainer.innerHTML = '';
        lineNo = 1;
    }
    else if (cmd == 'robins') {
        let value = `Robin is a bug 💀💀💀`;
        value = value.split(' ');
        appendLine(value, 'error', 'input');
    }
    else if (cmd == 'history') {
        isType = true;
        let time = 0;
        cmdHistory.forEach(line => {
            let lineArray = line.split(' ');
            let id = setTimeout(() => appendLine(lineArray, 'info'), time);
            time += speed * lineArray.length;
            typeTime.push(id);
        });
    }
    else if (cmd == 'exit') {
        location.href = '/';
    }
}



let rindex = 0;
window.onkeydown = (e) => {
    if (e.key === 'c' && e.ctrlKey) {
        let value = cmdInput.innerText;
        cmdInput.innerHTML = '';
        value = value.trim();
        value = `${value}^C`;
        value = value.split(' ');
        appendLine(value, 'info', 'input');
        cancelExe();
    }
    else if (e.key === 'ArrowUp') {
        cmdInputFocus();
        if ((cmdHistory.length - rindex - 1) >= 0) {
            cmdInput.innerText = cmdHistory[cmdHistory.length - rindex - 1];
            rindex++;
        }
    }
    else if (e.key === 'ArrowDown') {
        cmdInputFocus();
        if ((cmdHistory.length - rindex + 1) < cmdHistory.length) {
            cmdInput.innerText = cmdHistory[cmdHistory.length - rindex + 1];
            rindex--;
        }
    } else {
        rindex = 0;
    }
}



const cancelExe = () => {
    isType = false;
    typeTime.forEach(id => clearTimeout(id));
    typeTime = [];
}



const socket = io({ transports: ['websocket'] });

socket.on('newLog', (line) => {
    isType = true;
    let logLevel = getLogLevel(line);
    let lineArray = line.split(' ');
    appendLine(lineArray, logLevel);
});