let dateInput = document.getElementById('date');
let liveAttandance = document.getElementById('liveAttandance');
let scrollRefrence = document.getElementById('scrollRefrence');
let liveAttandanceStudents = document.getElementById('students');
let searchAttandanceBtn = document.getElementById('searchAttandance');
let prevAttandance = document.getElementById('prevAttandance');
let prevAttandanceStudents = document.getElementById('prevAttandanceStudents');
let subInfos = document.getElementsByClassName('subInfo');
let classId = null, prevAttandanceId = null;
let attandanceData = {}, prevAttandanceData = [], originalPrevAttandanceData = [];
let totalStudents = 0;

dateInput.addEventListener('change', (e) => {
    vibrate.touch();
    searchAttandanceBtn.innerHTML = '<i class="fas fa-spinner rotateMe"></i>';
    subInfos[0].innerHTML = formatTime(e.target.value).split('of')[1];
    loadPrevAttandance(e.target.value);
})

const loadPrevAttandance = async (date) => {
    prevAttandanceId = null;
    prevAttandanceStudents.innerHTML = ''
    let resData = await myGET(`/class/attandance/prev/${classId}/${date}`);
    searchAttandanceBtn.innerHTML = 'Search';
    if (resData.success) {
        if (resData.data.length) {
            prevAttandanceId = resData.data[0]._id;
            originalPrevAttandanceData = resData.data[0].status;
            subInfos[1].innerHTML = resData.data[0].author.username;
            subInfos[2].innerHTML = formatTime(resData.data[0].createdAt);
            prevAttandance.style.display = 'block';
            let prevTotalPresent = 0, prevTotalStudent = resData.data[0].status.length;
            resData.data[0].status.map(val => {
                prevAttandanceData.push({ ...val });
                if (val.attendance) prevTotalPresent++;
                prevAttandanceStudents.innerHTML += `<div class='studentBody ${val.attendance ? 'present' : 'absent'}' id='update-${val.user._id}'>
                        <div class="student">
                            <div class="profile">
                                <img src="${val.user.profile ? val.user.profile : '/img/nouser.png'}" alt="">
                            </div>
                            <div class="Info">
                                <p>${val.user.username}</p>
                                <p style="font-size: 12px; color: gray;">Roll No. ${val.user.rollno}</p>
                            </div>
                        </div>
                        <hr>
                        <div class="attandanceBtn">
                            <button onclick="updatePresent(this,'${val.user._id}')" class='normalButton ${val.attendance ? 'hide' : ''}'>Present</button>
                            <button onclick="updateAbsent(this,'${val.user._id}')" class='normalButton ${val.attendance ? '' : 'hide'}' style="background-color: red;">Absent</button>
                        </div>
                    </div>`
            })
            subInfos[3].innerHTML = `${prevTotalPresent}/${prevTotalStudent}`
        }
        else {
            vibrate.failure();
            document.getElementById('popup').style.display = 'block';
            document.getElementById('popup').innerHTML = `
    <div class="popup-form"> 
            <p style="margin-bottom: 15px;">Warning!!</p>
           <div>
           <p>No Attendance Found With Selected Date</p>
           <p>For more contact Class Incharge<p>
           </div>
           <div> 
            <button class="normalButton" style="background-color: red;" onclick="closePopup()" >Cancel</button>
           </div>
        </div>
    `
        }
    } else {
        vibrate.failure();
        document.getElementById('popup').style.display = 'block';
        document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('closePopup()')}
                </div>
            `
    }
}

const updatePresent = (ele, id) => {
    ele.classList.add('hide');
    ele.nextElementSibling.classList.remove('hide');
    document.getElementById(`update-${id}`).classList.remove('absent')
    document.getElementById(`update-${id}`).classList.add('present')
    prevAttandanceData.forEach(obj => {
        if (obj.user._id === id) {
            obj.attendance = 1;
        }
    })
}
const updateAbsent = (ele, id) => {
    ele.classList.add('hide');
    ele.previousElementSibling.classList.remove('hide');
    document.getElementById(`update-${id}`).classList.remove('present')
    document.getElementById(`update-${id}`).classList.add('absent')
    prevAttandanceData.forEach(obj => {
        if (obj.user._id === id) {
            obj.attendance = 0;
        }
    })
}

const processPrevUpdates = () => {
    let ct = 0, newPresent = 0, newAbsent = 0;
    for (let index = 0; index < originalPrevAttandanceData.length; index++) {
        if (originalPrevAttandanceData[index].attendance !== prevAttandanceData[index].attendance) {
            ct++;
            if (originalPrevAttandanceData[index].attendance) newAbsent++;
            else newPresent++;
        }
    }
    if (ct) {
        vibrate.warning();
        document.getElementById('popup').style.display = 'block';
        document.getElementById('popup').innerHTML = `
    <div class="popup-form"> 
            <p style="margin-bottom: 15px;">Warning!!</p>
           <div>
            <p>${ct} Student will be affected</p>
            <p>New Present marked : ${newPresent}</p>
           <p>New Absent marked : ${newAbsent}</p> 
           </div>
           <div> 
            <button class="normalButton" onclick="updatePrevData()" >Upload</button>
            <button class="normalButton" style="background-color: red;" onclick="closePopup()" >Cancel</button>
           </div>
        </div>
    `
    }
    else {
        document.getElementById('popup').style.display = 'block';
        document.getElementById('popup').innerHTML = `
    <div class="popup-form"> 
            <p style="margin-bottom: 15px;">Warning!!</p>
           <div>
           <p>No Changes are made to Update.</p> 
           </div>
           <div> 
            <button class="normalButton" style="background-color: red;" onclick="closePopup()" >Cancel</button>
           </div>
        </div>
    `
    }
}

const updatePrevData = async () => {
    try {
        document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
        let newJsonData = prevAttandanceData.map(obj => {
            return {
                userId: obj.user._id,
                attendance: obj.attendance
            }
        })
        let resData = await myPost(`/class/attandance/update/${prevAttandanceId}`, { data: newJsonData });
        if (resData.success) {
            vibrate.success();
            location.reload();
        } else {
            vibrate.failure();
            document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('processPrevUpdates()')}
                </div>
            `
        }
    } catch (err) {
        vibrate.failure();
        document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('processPrevUpdates()')}
                </div>
            `
    }
}

const downloadAttandance = async () => {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML =
        `<div class="loading_div">
        <div>Preparing File....</div>
        <i class="fas fa-spinner rotateMe" ></i> 
        </div >
    `
    try {
        let resData = await myGET(`/class/attandance/download/${prevAttandanceId}`)
        if (resData.success) {
            vibrate.success();
            document.getElementById('popup').innerHTML = `
    <div class="popup-form"> 
            <p style="margin-bottom: 15px;">File Created!!</p>
           <div>
           <p style="font-size:12px;padding-bottom: 10px;">File Will be deleted in 5 mins</p>
           </div>
           <div>
           <button class="normalButton" style="background-color: red;" onclick="closePopup()" >Cancel</button>
            <a class="normalButton" href='/download/${resData.fileName}' target='__blank' >Download</a>
           </div>
        </div>
    `
        } else {
            vibrate.failure();
            document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('downloadAttandance()')}
                </div>
            `
        }
    } catch (err) {
        vibrate.failure();
        document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('downloadAttandance()')}
                </div>
            `
    }
}

const takeTodayAttandance = () => {
    liveAttandance.style.display = 'block';
    scrollRefrence.scrollIntoView({ behavior: "smooth", block: "start" })
    loadLiveAttandanceStudents();
}

const loadLiveAttandanceStudents = async () => {
    liveAttandanceStudents.innerHTML = `
        <div style="padding-top:30px">
            <i class="fas fa-spinner rotateMe"></i>
            </div>
        `
    let data = await myGET(`/class/students/all/${classId}`);
    if (data.success) {
        totalStudents = data.data.length;
        liveAttandanceStudents.innerHTML = '';
        data.data.map(student => {
            liveAttandanceStudents.innerHTML += `<div class="studentBody" id='${student.student._id}'>
                        <div class="student">
                            <div class="profile">
                                <img src="${student.student.profile ? student.student.profile : '/img/nouser.png'}" alt="">
                            </div>
                            <div class="Info">
                                <p>${student.student.username}</p>
                                <p style="font-size: 12px; color: gray;">Roll No. ${student.student.rollno}</p>
                            </div>
                        </div>
                        <hr>
                        <div class="attandanceBtn">
                            <button id='P-${student.student._id}' onclick="markPresent(this,'${student.student._id}')" class="normalButton">Present</button>
                            <button id='A-${student.student._id}' onclick="markAbsent(this,'${student.student._id}')" class="normalButton" style="background-color: red;">Absent</button>
                        </div>
                    </div>`
        })
    }
    else {
        liveAttandanceStudents.innerHTML = showSWrong('loadLiveAttandanceStudents()');
    }
}

const markAllPresent = () => {
    Array.from(liveAttandanceStudents.children).forEach(student => {
        let ele = document.getElementById(`P-${student.getAttribute('id')}`);
        if (ele) markPresent(ele, student.getAttribute('id'));
    })
}
const markAllAbsent = () => {
    Array.from(liveAttandanceStudents.children).forEach(student => {
        let ele = document.getElementById(`A-${student.getAttribute('id')}`);
        if (ele) markAbsent(ele, student.getAttribute('id'));
    })
}

const markPresent = (ele, id) => {
    ele.classList.add('hide');
    ele.nextElementSibling.classList.remove('hide');
    document.getElementById(id).classList.remove('absent')
    document.getElementById(id).classList.add('present')
    attandanceData[id] = 1;
}
const markAbsent = (ele, id) => {
    ele.classList.add('hide');
    ele.previousElementSibling.classList.remove('hide');
    document.getElementById(id).classList.remove('present')
    document.getElementById(id).classList.add('absent')
    attandanceData[id] = 0;
}

const uploadAttandance = () => {
    let presentStudent = 0, absentStudent = 0;
    let values = Object.values(attandanceData);
    values.forEach(val => {
        if (val) presentStudent++;
        else absentStudent++;
    })
    if (presentStudent + absentStudent !== totalStudents) {
        vibrate.warning();
        alert("Some Students Remains Unmarked!");
        return;
    }
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML = `
    <div class="popup-form"> 
            <p style="margin-bottom: 15px;">Review Attandance</p>
           <div>
           <p>Present : ${presentStudent}/${totalStudents}</p>
           <p>Absent : ${absentStudent}/${totalStudents}</p> 
           </div>
           <div>
            <button class="normalButton" onclick="uploadJSON()" >Upload</button>
            <button class="normalButton" style="background-color: red;" onclick="closePopup()" >Cancel</button>
           </div>
        </div>
    `
}

const uploadJSON = async () => {
    try {
        document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
        let resData = await myPost(`/class/attandance/upload/${classId}`, { data: attandanceData });
        if (resData.success) {
            vibrate.success();
            location.reload();
        } else {
            vibrate.failure();
            document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('uploadAttandance()')}
                </div>
            `
        }
    } catch (err) {
        vibrate.failure();
        document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('uploadAttandance()')}
                </div>
            `
    }
}

window.onload = () => {
    classId = document.getElementById('classID').value;
    if (!classId) {
        alert("Class Not Exist!!");
        location.replace('/');
    }
}


const downloadAll = async () => {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML =
        `<div class="loading_div">
        <div>Preparing File....</div>
        <i class="fas fa-spinner rotateMe" ></i> 
        </div >
    `
    try {
        let resData = await myGET(`/class/attandance/download/all/${classId}`)
        if (resData.success) {
            document.getElementById('popup').innerHTML = `
    <div class="popup-form"> 
            <p style="margin-bottom: 15px;">File Created!!</p>
           <div>
           <p style="font-size:12px;padding-bottom: 10px;">File Will be deleted in 5 mins</p>
           </div>
           <div>
           <button class="normalButton" style="background-color: red;" onclick="closePopup()" >Cancel</button>
            <a class="normalButton" href='/download/${resData.fileName}' target='__blank' >Download</a>
           </div>
        </div>
    `
        } else {
            document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('downloadAll()')}
                </div>
            `
        }
    } catch (err) {
        document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('downloadAll()')}
                </div>
            `
    }
}


const showCnf = () => {
    vibrate.confirm();
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML = `
        <div class="popup-form">
        <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
            <h2 style="font-size:15px;margin-bottom:20px">This Step cant be Undo</h2>
            <p style="font-size:12px">Removing Attandance, remove all its Nested Data and visuals.</p>
            <h1 style="margin:10px 0" id="h1val">${1000 + Math.floor(Math.random() * 8999)}</h1>
            <input type="number" id="username" placeholder="Enter Number">
            <button onclick="checkCnf()" style="background:#f07979">Remove</button>
        </div>
    `
}

const checkCnf = async () => {
    let val = document.getElementById('username').value;
    let val2 = document.getElementById('h1val').innerHTML;
    if (val == val2) {
        document.getElementById('popup').style.display = 'block';
        document.getElementById('popup').innerHTML =
            `<div class="loading_div">
        <div>Requesting Server....</div>
            <i class="fas fa-spinner rotateMe" ></i> 
        </div >
    `
        try {
            let resData = await myGET(`/class/attandance/remove/all/${classId}`)
            if (resData.success) {
                document.getElementById('popup').innerHTML = `
                        <div class="popup-form">
                        <div class="hidePopUp"><i onClick="location.reload()" class="fa-solid fa-xmark"></i></div>
                            <h2 style="font-size:15px;margin-bottom:20px">Attandance of ${resData.data.deletedCount} days Deleted.</h2>
                            <button onclick="location.reload()" style="background:#f07979">Close</button>
                        </div>
                    `
            } else {
                document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('showCnf()')}
                </div>
            `
            }
        } catch (err) {
            document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('showCnf()')}
                </div>
            `
        }
    }
    else {
        document.getElementById('popup').style.display = 'block';
        document.getElementById('popup').innerHTML = `
        <div class="popup-form">
        <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
            <h2 style="font-size:15px;margin-bottom:20px">Action Failed</h2>
            <button onclick="closePopup()" style="background:#f07979">Close</button>
        </div>
    `
    }
}