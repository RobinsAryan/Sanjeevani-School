let classId = null;
const addStudent = () => {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML = `
    <div class="popup-form">
            <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
            <p style="margin-bottom: 15px;">Choose Action</p>
           <div>
            <button class="bigBtn" onclick="addOne()" >Add One Student</button>
           </div>
           <div>
            <button class="bigBtn" onclick="uploadSheet()" >Upload Sheet</button>
           </div>
        </div>
    `
}

const addOne = () => {
    document.getElementById('popup').innerHTML = `
    <div class="popup-form">
            <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
            <form onSubmit="handleSubmit(event,0)" id="fileUploadForm">
                <input type="number" id="rid" name="rid" placeholder="Reg. ID" required><br>
                <input type="text" id="username" name="username" placeholder="Name" required><br>
                <input type="number" min="1" id="rollNo" name="rollNo" placeholder="Roll No" required><br>
                <input type="string" id="phone" name="phone" placeholder="Phone" required><br>
                <input type="date" id="dob" name="dob" placeholder="dob" required><br>
                <input type="text" id="fname" name="fname" placeholder="Father's Name" required><br>
                <input type="text" id="add" name="add" placeholder="Address" required><br>
                <input type="text" id="gender" name="gender" placeholder="Gender" required><br>
                <div>
                    <button style="background:#ff4646;" type="reset">Reset</button>
                    <button type="submit">Submit</button>
                </div>
            </form>
        </div>
    `
}

const uploadSheet = () => {
    document.getElementById('popup').innerHTML = `
    <div class="popup-form">
            <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
            <form onreset="resetForm(this)" onSubmit="handleSubmit(event,1)" id="fileUploadForm">
                <input style="width:85%" type="file" id="file" name="file" required><br> 
                <div>
                    <button style="background:#ff4646;" type="reset">Reset</button>
                    <button type="submit">Submit</button>
                </div>
            </form>
        </div>
    `
}

const handleSubmit = async (event, id) => {
    event.preventDefault();
    try {
        if (id == 0) {
            let data = {
                regId: event.target.rid.value,
                name: event.target.username.value,
                rollno: event.target.rollNo.value,
                phone: event.target.phone.value,
                dob: event.target.dob.value,
                fname: event.target.fname.value,
                add: event.target.add.value,
                gender: event.target.gender.value,
            }
            document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
            let res = await myPost(`/class/addSingleStudent/${classId}`, data);
            if (res.success) {
                if (res.added) {
                    vibrate.success();
                    closePopup();
                    loadStudents();
                }
                else {
                    vibrate.warning();
                    alert(res.msz);
                    addOne();
                }
            }
            else {
                vibrate.failure();
                document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('addStudent()')}
                </div>
    `
            }
        }
        else if (id == 1) {
            let file = event.target.file.files[0];
            document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
            let data = await uploadFile(file, `/class/addMultipleStudents/${classId}`);
            if (data.success) {
                if (!data.allInserted) {
                    vibrate.success();
                    document.getElementById('popup').innerHTML =
                        `
            <div class="popup-form">
                <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
                <h3 style="color:#f85100;padding-bottom: 20px;">Warning!!!</h3>
                <p><div>${data.unInserted}/${data.total}</div> Students not Inserted</p>
                <p style="padding:20px 0 10px">For More <a href='/download/${data.descFile}' target='__blank'>Download Sheet</a></p>
                <button onclick='closePopup();loadStudents()'>Ignore</button>
            </div>
        `
                }
                else {
                    vibrate.warning();
                    closePopup();
                    loadStudents();
                }
            } else {
                vibrate.failure();
                document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('addStudent()')}
                </div>
            `
            }
        }
    } catch (err) {
        vibrate.failure();
        document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('addStudent()')}
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
    loadStudents();
}

const loadStudents = async () => {
    let pdiv = document.getElementsByClassName('classes')[0];
    pdiv.innerHTML = `
        <div style="padding-top:30px">
            <i class="fas fa-spinner rotateMe"></i>
            </div>
        `
    let data = await myGET(`/class/students/all/${classId}`);
    if (data.success) {
        pdiv.innerHTML = '';
        document.getElementById('totalStudent').innerText = data.data.length;
        data.data.map(student => {
            pdiv.innerHTML += `<div class="student" onclick="location.href='/user/profile/${student.student._id}'">
            <div class="profile">
                        <img src="${student.student.profile ? student.student.profile : '/img/nouser.png'}" alt="">
                    </div>
                    <div class="Info">
                        <p>${student.student.username}</p>
                        <p style="font-size: 12px; color: gray;">Roll No. ${student.student.rollno}</p>
                        <p style="font-size: 12px; color: gray;">Phone No. ${student.student.phone}</p>
                        <p style="font-size: 12px; color: gray;">Reg. Id ${student.student.rid}</p>
                        </div> 
                        <a class="phone" href="tel:${student.phone}"><i class="fas fa-phone-alt"></i></a>
                        </div>`
        })
    }
    else {
        vibrate.touch();
        pdiv.innerHTML = showSWrong('loadStudents()');
    }
}