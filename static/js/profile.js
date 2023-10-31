let userId = null;
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
                console.log(resData);
                console.log(userId);
                if (resData.id == userId) {
                    originalImage = resData.profile;
                    userProfile.src = originalImage;
                    closePopup();
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
            try { 
                let resData = await myPost(`/student/updatePassword`, { password:password.value, newPassword:newPassword.value });
                if (resData.success) {
                    if (resData.update) {
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
                <input type="text" id="password" name="password" placeholder="Enter Old Password" required><br><br>
                <div>
                    <button style="background:#ff4646;" type="reset">Reset</button>
                    <button type="submit">Submit</button>
                </div>
            </form>
        </div>`
}