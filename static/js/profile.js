let userId = null, userData = null;
let originalImage = '';
let userProfile = document.getElementById('userProfile');
const downloadIdcard = async () => {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML =
        `<div class="loading_div">
        <div>Preparing File....</div>
        <i class="fas fa-spinner rotateMe" ></i> 
        </div >
    `
    try {
        let resData = await myGET(`/student/idCard/download/${userId}`)
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
                ${showSWrong('downloadIdcard()')}
                </div>
            `
        }
    } catch (err) {
        document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('downloadIdcard()')}
                </div>
            `
    }
}

window.onload = () => {
    userId = document.getElementById('userId').value;
    if (!userId) {
        alert("Class Not Exist!!");
        location.replace('/');
    }
    userData = document.getElementById('userData').value;
    userData = JSON.parse(userData);
    console.log(userData)
}

const editProfile = () => {
    if (originalImage === '') originalImage = userProfile.src;
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML = `<div class="popup-form">
        <div class="hidePopUp" ><i onClick = "closePopup()" class="fa-solid fa-xmark"></i></div>
            <span>Change Profile Photo</span>
            <form onreset = "resetForm(this)" onSubmit="handleSubmit(event,1)" id="fileUploadForm">
                <label for="file">
                    <div>
                        <img id="demoImg" src="${originalImage}" alt="">
                    </div>
                </label>
                <span style="font-size: 12px;">Click to Change</span>
                <input onchange = "handleFile(this)" type="file" id="file" name="file" accept=".jpg, .png, .pdf" hidden required ><br><br>
                <input type="text" id="password" name="password" placeholder="Password" required><br><br>
                <div>
                    <button style="background:#ff4646;" type="reset">Reset</button>
                    <button type="submit">Submit</button>
                </div>
            </form>
        </div>`
}

function handleFile(HTMLFileInput) {
    let fileList = HTMLFileInput.files;
    if (fileList.length) {
        let file = fileList[0];
        let fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = (event) => {
            document.getElementById('demoImg').src = event.target.result;
        }
    }
    else {
        document.getElementById('demoImg').src = originalImage;
    }
}

const resetForm = (HTMLFormInput) => {
    setTimeout(() => {
        handleFile(HTMLFormInput.file);
    }, 200);
}



const handleSubmit = async (e, num) => {
    e.preventDefault();
    if (num == 1) {
        document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
        let data = {
            icon: originalImage,
            password: e.target.password.value
        }
        if (e.target.file.files.length) {
            let resData = await uploadImage(e.target.file.files[0]);
            console.log(resData)
            if (resData.success) {
                data.icon = resData.path
            }
            else {
                document.getElementById('popup').innerHTML = `
                <div class="popup-form"> 
                ${showSWrong('editProfile()')}
                </div>
            `
                return;
            }
        }
        else {
            document.getElementById('popup').innerHTML = '';
            closePopup();
            return;
        }
        let resData = await myPost(`/student/updateProfile/${userId}`, data);
        if (resData.success) {
            if (resData.update) {
                if (resData.id == userId) {
                    location.reload();
                }
                else {
                    alert("Unexpected Error");
                    console.log(resData);
                }
            }
            else {
                document.getElementById('popup').innerHTML = `
    <div class="popup-form"> 
            <p style="margin-bottom: 15px;">Error!!</p>
           <div>
           <p style="font-size:12px;padding-bottom: 10px;">${resData.msz}</p>
           </div>
           <div>
           <button class="normalButton" style="background-color: red;" onclick="closePopup()" >Close</button> 
           </div>
        </div>
    `
            }
        }
        else {
            document.getElementById('popup').innerHTML = `
                <div class="popup-form"> 
                ${showSWrong('editProfile()')}
                </div>
            `
        }
    } else if (num == 2) {
        let newPassword = e.target.newPassword;
        let newPassword2 = e.target.newPassword2;
        let password = e.target.password;
        if (newPassword.value !== newPassword2.value) {
            newPassword.style.border = '1px solid #ffa1a1';
            newPassword2.style.border = '1px solid #ffa1a1';
            showFormMsz(1, "Password Must be same!", 'red')
        }
        else if (newPassword.value.length < 6) {
            newPassword.style.border = '1px solid #ffa1a1';
            newPassword2.style.border = '1px solid #ffa1a1';
            showFormMsz(1, "Password is too Short!", 'red')
        }
        else if (newPassword.value == password.value) {
            newPassword.style.border = '1px solid #ffa1a1';
            password.style.border = '1px solid #ffa1a1';
            showFormMsz(2, "Use Different Password", 'red')
        }
        else {
            document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
            console.log(password.value);
            try {
                let resData = await myPost(`/student/updatePassword/${userId}`, { password: password.value, newPassword: newPassword.value });
                if (resData.success) {
                    if (resData.update) {
                        if (resData.by == 'p') {
                            location.reload();
                        } else
                            location.href = '/logout'
                    }
                    else {
                        document.getElementById('popup').innerHTML = `
                        <div class="popup-form"> 
                                <p style="margin-bottom: 15px;">Error!!</p>
                            <div>
                            <p style="font-size:12px;padding-bottom: 10px;">${resData.msz}</p>
                            </div>
                            <div>
                            <button class="normalButton" style="background-color: red;" onclick="closePopup()" >Close</button> 
                            </div>
                            </div>
                        `
                    }
                } else {
                    document.getElementById('popup').innerHTML = `
                <div class="popup-form"> 
                ${showSWrong('changePassword()')}
                </div>
            `
                }
            } catch (err) {
                document.getElementById('popup').innerHTML = `
                <div class="popup-form"> 
                ${showSWrong('changePassword()')}
                </div>
            `
            }
        }
    } else if (num == 3) {
        let data = {
            regId: e.target.rid.value,
            name: e.target.username.value,
            rollno: e.target.rollNo.value,
            phone: e.target.phone.value,
            dob: e.target.dob.value,
            fname: e.target.fname.value,
            add: e.target.add.value,
            gender: e.target.gender.value,
        }
        document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
        let res = await myPost(`/class/updateStudent/${userId}`, data);
        if (res.success) {
            if (res.updated) {
                closePopup();
                location.reload();
            }
            else {
                alert(res.msz);
                closePopup();
            }
        }
        else {
            document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('editStudent()')}
                </div>
    `
        }
    }
    else if (num == 4) {
        let data = {
            name: e.target.username.value, 
            phone: e.target.phone.value,
            dob: e.target.dob.value,
            subject: e.target.subjects.value,
            doj: e.target.doj.value,
            department: e.target.department.value
        }
        console.log(data);
        document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
        let res = await myPost(`/teacher/updateTeacher/${userId}`, data);
        if (res.success) {
            if (res.updated) {
                closePopup();
                location.reload();
            }
            else {
                alert(res.msz);
                closePopup();
            }
        }
        else {
            document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('editTeacher()')}
                </div>
    `
        }
    }
}

const showFormMsz = (div, msz, color) => {
    if (div == 1) {
        document.getElementById('msz2').innerHTML = '<br><br>';
        document.getElementById('msz1').innerHTML = msz;
        document.getElementById('msz1').style.color = color;
    }
    else if (div == 2) {
        document.getElementById('msz1').innerHTML = '<br><br>';
        document.getElementById('msz2').innerHTML = msz;
        document.getElementById('msz2').style.color = color;
    }
}


const changePassword = () => {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML = `<div class="popup-form">
        <div class="hidePopUp" ><i onClick = "closePopup()" class="fa-solid fa-xmark"></i></div>
            <span>Change Password</span>
            <form onSubmit="handleSubmit(event,2)" id="fileUploadForm">
                <input type="text" id="newPassword" name="newPassword" placeholder="Enter New Password" required> 
                <small style="white-space: nowrap;" id="msz1"><br><br></small>
                <input type="text" id="newPassword2" name="newPassword2" placeholder="Confirm New Password" required>
                <small style="white-space: nowrap;" id="msz2"><br><br></small>
                <input type="text" id="password" name="password" placeholder="Enter Current Password" required><br><br>
                <div>
                    <button style="background:#ff4646;" type="reset">Reset</button>
                    <button type="submit">Submit</button>
                </div>
            </form>
        </div>`
}


const deleteStudent = async () => {
    try {
        let val = confirm("This Step cant be Undo!!");
        if (val) {
            document.getElementById('popup').style.display = 'block';
            document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
            let resData = await myGET(`/user/profile/remove/${userId}`);
            if (resData.success) {
                history.back();
            } else {
                document.getElementById('popup').innerHTML = `
                <div class="popup-form"> 
                <div class="hidePopUp" ><i onClick = "closePopup()" class="fa-solid fa-xmark"></i></div>
                ${showSWrong('deleteStudent()')}
                </div>
            `
            }
        }
    } catch (err) {
        document.getElementById('popup').innerHTML = `
        <div class="popup-form"> 
        <div class="hidePopUp" ><i onClick = "closePopup()" class="fa-solid fa-xmark"></i></div>
                ${showSWrong('deleteStudent()')}
                </div>
            `
    }
}


const editStudent = () => {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML = `
    <div class="popup-form">
            <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
            <form onSubmit="handleSubmit(event,3)" id="fileUploadForm">
            <p class="editFormP">Reg Id:</p>
                <input type="number" id="rid" name="rid" placeholder="Reg. ID" value="${userData.studentId}" required> 
                <p class="editFormP">User Name:</p>
                <input type="text" id="username" name="username" placeholder="Name" value="${userData.userName}" required> 
                <p class="editFormP">Roll No:</p>
                <input type="number" min="1" id="rollNo" name="rollNo" placeholder="Roll No" value="${userData.rollno}" required> 
                <p class="editFormP">Phone:</p>
                <input type="string" id="phone" name="phone" placeholder="Phone" value="${parseInt(userData.email)}" required> 
                <p class="editFormP">DOB:</p>
                <input type="date" id="dob" name="dob" placeholder="dob" value="${genrateDateValue(userData.dob)}" required> 
                <p class="editFormP">Father Name:</p>
                <input type="text" id="fname" name="fname" placeholder="Father's Name" value="${userData.fname}" required> 
                <p class="editFormP">Address:</p>
                <input type="text" id="add" name="add" placeholder="Address" value="${userData.add}" required> 
                <p class="editFormP">Gender:</p>
                <input type="text" id="gender" name="gender" placeholder="Gender" value="${userData.gender}" required> 
                <div>
                    <button style="background:#ff4646;" type="reset">Reset</button>
                    <button type="submit">Update</button>
                </div>
            </form>
        </div>
    `
}


const genrateDateValue = (val) => {
    let date = new Date(Date.parse(userData.dob));
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    return `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`
}


const deleteTeacher = async () => {
    try {
        let val = confirm("This Step cant be Undo!!");
        if (val) {
            document.getElementById('popup').style.display = 'block';
            document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
            let resData = await myGET(`/user/teacher/remove/${userId}`);
            if (resData.success) {
                history.back();
            } else {
                document.getElementById('popup').innerHTML = `
                <div class="popup-form"> 
                <div class="hidePopUp" ><i onClick = "closePopup()" class="fa-solid fa-xmark"></i></div>
                ${showSWrong('deleteTeacher()')}
                </div>
            `
            }
        }
    } catch (err) {
        document.getElementById('popup').innerHTML = `
        <div class="popup-form"> 
        <div class="hidePopUp" ><i onClick = "closePopup()" class="fa-solid fa-xmark"></i></div>
                ${showSWrong('deleteTeacher()')}
                </div>
            `
    }
}


const editTeacher = () => {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML = `
    <div class="popup-form">
            <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
            <form onSubmit="handleSubmit(event,4)" id="fileUploadForm">
            <p class="editFormP">User Name:</p>
                <input type="text" id="username" name="username" placeholder="Name" value="${userData.userName}" required> 
                 <p class="editFormP">Phone:</p>
                <input type="string" id="phone" name="phone" placeholder="Phone" value="${parseInt(userData.email)}" required> 
                <p class="editFormP">DOB:</p>
                <input type="date" id="dob" name="dob" placeholder="dob" value="${genrateDateValue(userData.dob)}" required> 
                <p class="editFormP">Subjects:</p>
                <input type="text" id="subjects" name="subjects" placeholder="Subjects" value="${userData.subject || ''}"> 
                <p class="editFormP">Date of Joining:</p>
                <input type="text" id="doj" name="doj" placeholder="Date of Joining" value="${userData.doj || ''}"> 
                <p class="editFormP">Department:</p>
                <select name="department" id="department">
                    <option  value="none">Select Employee</option>
                    <option ${userData.department == 'Teacher' ? 'selected' : ''} value="Teacher">Teacher</option>
                    <option ${userData.department == 'busDriver' ? 'selected' : ''} value="busDriver">Bus Driver</option>
                    <option ${userData.department == 'Maid' ? 'selected' : ''} value="Maid">Maid</option>
                    <option ${userData.department == 'Other' ? 'selected' : ''} value="Other">Other</option>
                </select>
                <div>
                    <button style="background:#ff4646;" type="reset">Reset</button>
                    <button type="submit">Update</button>
                </div>
            </form>
        </div>
    `
}