const lineContainer = document.querySelector(".line-container");
let page = document.getElementsByClassName('classes')[0];
let createBtn = document.getElementById('createBtn');
const menu = document.querySelector(".menu");




lineContainer.addEventListener("click", () => {
    lineContainer.classList.toggle("active");
    menu.classList.toggle("active");
});




const pages = [
    {
        title: 'Classes',
        url: '/',
        btnText: 'Add Class'
    },
    {
        title: 'Teachers',
        url: '/',
        btnText: 'Add Teacher'
    },
    {
        title: 'Schedule',
        url: '/',
        btnText: 'Change Schedule'
    },
    {
        title: 'Announcements',
        url: '/',
        btnText: 'Make Announcement'
    },
]




let openedPage = -1;
const showClasses = async () => {
    page.innerHTML = ` 
            <i class="fas fa-spinner rotateMe"></i> 
        `
    let data = await myGET('/class/all');
    if (data.success) {
        data = data.data;
        page.innerHTML = ``
        data.forEach(Class => {
            page.innerHTML += `<div onclick="location.href = '/class/single/${Class._id}'" class="class">
            <div class="classImg">
            <div>
            <img src="${Class.icon}" alt="">
            </div>
            </div>
            <p>${Class.className}</p>
            </div>`
        });
    }
    else {
        page.innerHTML = showSWrong('showClasses()');
    }
}
const showTeachers = async () => {
    page.innerHTML = `<i class="fas fa-spinner rotateMe"></i>`
    let data = await myGET('/teacher/all');
    if (data.success) {
        data = data.data;
        page.innerHTML = ``
        data.forEach(teacher => {
            page.innerHTML += `<div class="class teacherClass" onclick="location.href='/user/profile/${teacher._id}'">
        <div class="classImg">
                        <div>
                        <img src="${teacher.profile}" alt="">
                        </div>
                        </div>
                        <p>${teacher.username}</p>
                        </div>`
        });
    }
    else {
        page.innerHTML = showSWrong('showTeachers()');
    }
}


const openPage = async (num, toggle = 1) => {
    if (toggle) {
        lineContainer.click();
        localStorage.removeItem('openedPage');
        localStorage.setItem('openedPage', JSON.stringify({ page: num }));
    }
    if (openedPage === num) return;
    openedPage = num;
    document.getElementById('headerTitle').innerText = pages[openedPage].title;
    createBtn.innerText = pages[openedPage].btnText;
    if (openedPage == 0) {
        showClasses();
    }
    else if (openedPage == 1) {
        showTeachers();
    }
    else page.innerHTML = 'Upcoming...'
}


createBtn.addEventListener('click', () => {
    document.getElementById('popup').style.display = 'block';
    if (openedPage == 0) {
        document.getElementById('popup').innerHTML = `<div class="popup-form">
        <div class="hidePopUp" ><i onClick = "closePopup()" class="fa-solid fa-xmark"></i></div>
        <form onreset = "resetForm(this)" onSubmit="handleSubmit(event,0)" id="fileUploadForm">
        <label for="file">
        <div>
        <img id="demoImg" src="/img/upload_img.png" alt="">
        </div>
        </label>
        <input onchange = "handleFile(this)" type="file" id="file" name="file" accept=".jpg, .png, .pdf" hidden ><br><br>
        <input type="text" id="className" name="className" placeholder="Class Name" required><br><br>
        <div>
        <button style="background:#ff4646;" type="reset">Reset</button>
        <button type="submit">Submit</button>
        </div>
        </form>
        </div>`
    }
    else if (openedPage == 1) {
        document.getElementById('popup').innerHTML = `<div class="popup-form">
        <div class="hidePopUp" ><i onClick = "closePopup()" class="fa-solid fa-xmark"></i></div>
        <form onreset = "resetForm(this)" onSubmit="handleSubmit(event,1)" id="fileUploadForm">
        <label for="file">
        <div>
        <img id="demoImg" src="/img/upload_img.png" alt="">
        </div>
        </label>
        <input onchange = "handleFile(this)" type="file" id="file" name="file" accept=".jpg, .png, .pdf" hidden ><br><br>
        <input type="text" id="className" name="className" placeholder="Name" required><br><br>
        <input type="text" id="email" name="email" placeholder="Email" required><br><br>
        <input type="date" id="dob" name="dob" placeholder="Date of Birth" required><br><br>
        <div>
        <button style="background:#ff4646;" type="reset">Reset</button>
        <button type="submit">Submit</button>
        </div>
        </form>
        </div>`
    }
})


const handleSubmit = async (e, num) => {
    e.preventDefault();
    document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
    if (num == 0) {
        let data = {
            icon: '/img/class.jpg',
            name: e.target.className.value
        }
        if (e.target.file.files.length) {
            let resData = await uploadImage(e.target.file.files[0]);
            if (resData.success) {
                data.icon = resData.path
            }
            else {
                closePopup();
                page.innerHTML = showSWrong("showClasses()");
                return;
            }
        }
        let resData = await myPost('/class/add', data);
        if (resData.success) {
            location.reload();
        }
        else {
            closePopup();
            page.innerHTML = showSWrong('showClasses()');
        }
    }
    else if (num == 1) {
        let data = {
            profile: '/img/class.jpg',
            name: e.target.className.value,
            email: e.target.email.value,
            dob: e.target.dob.value,
        }
        if (e.target.file.files.length) {
            let resData = await uploadImage(e.target.file.files[0]);
            if (resData.success) {
                data.profile = resData.path;
            }
            else {
                closePopup();
                page.innerHTML = showSWrong('showTeachers()');
                return;
            }
        }
        let resData = await myPost('/teacher/add', data);
        if (resData.success) {
            if (resData.msz) {
                alert(resData.msz);
                closePopup();
                showTeachers();
            } else {
                location.reload();
            }
        }
        else {
            closePopup();
            page.innerHTML = showSWrong('showTeachers()');
        }
    }

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
        document.getElementById('demoImg').src = '/img/upload_img.png';
    }
}



const resetForm = (HTMLFormInput) => {
    setTimeout(() => {
        handleFile(HTMLFormInput.file);
    }, 200);
}




window.onload = () => {
    let pageNum = 0;
    let data = localStorage.getItem('openedPage');
    if (data) {
        data = JSON.parse(data);
        pageNum = data.page;
    }
    openPage(pageNum, 0);
}