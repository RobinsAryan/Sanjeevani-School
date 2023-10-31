let classID = null;
let inChargeId = null;
let initialChargeId = null;

const loadIncharge = async () => {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
    let data = await myGET(`/class/inCharge/${classID}`);
    if (data.success) {
        document.getElementById('popup').innerHTML = `
        <div class="popup-form">
            <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
            <p style="margin-bottom: 10px;">Select Class Incharge</p>
             <div class="popup_list">
            </div>
            <button onclick="uploadInCharge()">Save</button>
        </div>`
        inChargeId = data.inCharge;
        initialChargeId = inChargeId;
        let popup_list = document.getElementsByClassName('popup_list')[0];
        data.teachers.map(teacher => {
            popup_list.innerHTML += `
            <div onClick="setInCharge(this,'${teacher._id}')" class="option ${inChargeId == teacher._id ? 'optionActive' : ''}">
                    <div class="optionProfile">
                        <img src="${teacher.profile}" alt="">
                    </div>
                    <div class="optionInfo">
                        <p>${teacher.username}</p>
                        <p class="optionMail">${teacher.email}</p>
                    </div>
                </div>
            `
        })
    }
    else {
        document.getElementById('popup').innerHTML = `
        <div class="popup-form">
            <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
            ${showSWrong('loadIncharge()')}
        </div>`
    }
}


const setInCharge = (HTMLElement, id) => {
    if (inChargeId == id) return;
    if (inChargeId)
        document.getElementsByClassName('optionActive')[0].classList.remove('optionActive');
    HTMLElement.classList.add('optionActive');
    inChargeId = id;
}


window.onload = () => {
    classID = document.getElementById('classID').value;
}


const uploadInCharge = async () => {
    if (initialChargeId == inChargeId) {
        document.getElementById('popup').style.display = 'none';
        return;
    }
    else {
        document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
        let data = await myGET(`/class/setInCharge/${classID}/${inChargeId}`);
        if (data.success) {
            document.getElementById('popup').style.display = 'none';
        }
        else {
            document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                    <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
                    ${showSWrong('uploadInCharge()')}
                </div>`
        }
    }
}

const removeClassPopup = () => {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML = `
        <div class="popup-form">
        <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
            <h2 style="font-size:15px;margin-bottom:20px">This Step cant be Undo</h2>
            <p style="font-size:12px">Removing a class, remove all its access to students and teachers but students in the class remains unaffected.</p>
            <button onclick="removeClass()" style="background:#f07979">Remove</button>
        </div>
    `
}
const removeClass = async () => {
    document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
    let data = await myGET(`/class/remove/${classID}`)
    if (data.success) {
        location.replace('/')
    } else {
        document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                    <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
                    ${showSWrong('removeClassPopup()')}
                </div>`
    }
}