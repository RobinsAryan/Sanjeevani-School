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
        title: 'Employees',
        url: '/',
        btnText: 'Add Employees'
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
    {
        title: 'Gallary',
        url: '/',
        btnText: 'New Posts'
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
        console.log(data)
        data.forEach(teacher => {
            page.innerHTML += `<div class="class teacherClass helloTeacher" onclick="location.href='/user/profile/${teacher._id}'">
        <div class="classImg">
                        <div>
                        <img src="${teacher.profile}" alt="">
                        </div>
                        </div>
                        <div class="info">
                        <p>${teacher.username}</p>
                        <p1>${teacher.phone}</p1>
                        <p2>${teacher.subject}</p2>
                        <p3>${teacher.department}</p3>
                        </div>
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
    else if (openedPage == 3) {
        showAnnouncement();
    }
    else if (openedPage == 4) {
        showGallary();
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
        <input type="text" id="phone" name="phone" placeholder="Phone" required><br><br>
        <input type="date" id="dob" name="dob" placeholder="Date of Birth" required><br><br>
        <input type="text" id="subject" name="subject" placeholder="Subjects"><br><br>
        <input type="text" id="doj" name="doj" placeholder="Date of Join" required><br><br>
        <select name="department" id="department">
                    <option value="none">Select Employee</option>
                    <option value="Teacher">Teacher</option>
                    <option value="busDriver">Bus Driver</option>
                    <option value="Maid">Maid</option>
                    <option value="Other">Other</option>
                </select>
        <div>
        <button style="background:#ff4646;" type="reset">Reset</button>
        <button type="submit">Submit</button>
        </div>
        </form>
        </div>`
    }
    else if (openedPage == 3) {
        document.getElementById('popup').innerHTML = `<div class="popup-form">
        <div class="hidePopUp" ><i onClick = "closePopup()" class="fa-solid fa-xmark"></i></div>
        <form onreset = "resetForm(this)" onSubmit="handleSubmit(event,3)" id="fileUploadForm">
        <label for="file">
        <div>
            <img id="demoImg" src="/img/upload_img.png" alt="">
        </div>
        </label>
        <input onchange = "handleFile(this)" type="file" id="file" name="file" accept=".jpg, .png, .pdf" hidden ><br><br>
        <input type="text" id="title" name="title" placeholder="Title" required><br><br>
        <div name="body" onfocus="textAreaFocus(this)" onblur="textAreaBlur(this)" contenteditable id="Announcetext">Write About this...</div>
        <br>
        <button style="background:#ff4646;" type="reset">Reset</button>
        <button type="submit">Submit</button>
        </div>
        </form>
        </div>`
    }
    else if (openedPage == 4) {
        document.getElementById('popup').innerHTML = `
        <div class="popup-form">
            <div class="hidePopUp" ><i onClick = "closePopup()" class="fa-solid fa-xmark"></i></div>
                <form onreset = "resetForm2(this)" onSubmit="handleSubmit(event,4)" id="fileUploadForm">
            <label style="overflow: auto;" for="file">
            <div id="demoImgs">
            <img id="demoImg" src="/img/upload_img.png" alt="">
            </div>
            </label>
            <input onchange = "handleFiles(this)" type="file" id="file" name="file" accept=".jpg, .png, .pdf" hidden multiple><br><br>
            <input type="text" id="title" name="title" placeholder="Title" required><br><br>
            <button style="background:#ff4646;" type="reset">Reset</button>
            <button type="submit">Submit</button>
            </div>
            </form>
        </div>`
    }
})


const handleSubmit = async (e, num) => {
    e.preventDefault();
    if (num == 0) {
        document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
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
        document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
        let data = {
            profile: '/img/teacher.jpg',
            name: e.target.className.value,
            phone: e.target.phone.value,
            dob: e.target.dob.value,
            subject: e.target.subject.value,
            doj: e.target.doj.value,
            department: e.target.department.value
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
    else if (num == 3) {
        let data = {
            icon: '/img/logo.png',
            title: e.target.title.value,
            body: document.getElementById('Announcetext').innerHTML,
        }
        data.title = data.title === 'Write About this...' ? '' : data.title;
        document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
        if (data.title.trim() == '') {
            alert("Title cant be null!");
            closePopup();
            return;
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
        console.log(data)
        let resData = await myPost('/class/announcement/add', data);
        if (resData.success) {
            location.reload();
        }
        else {
            closePopup();
            page.innerHTML = showSWrong('showClasses()');
        }
    }
    else if (num == 4) {
        document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
        let data = {
            images: [],
            title: e.target.title.value,
        }
        if (e.target.file.files.length) {
            let files = e.target.file.files;
            await Promise.all(Array.from(files).map(async (file) => {
                let resData = await uploadImage(file);
                if (resData.success) {
                    data.images.push(resData.path);
                }
                else {
                    closePopup();
                    page.innerHTML = showSWrong('showGallary()');
                    return;
                }
            }))
        }
        console.log(data);
        let resData = await myPost('/user/gallary/add', data);
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



function handleFiles(HTMLFileInput) {
    let fileList = HTMLFileInput.files;
    if (fileList.length) {
        document.getElementById('demoImgs').innerHTML = ''
        Array.from(fileList).forEach(file => {
            let fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = (event) => {
                document.getElementById('demoImgs').innerHTML += `<img  src="${event.target.result}" alt="">`;
            }
        })
    }
    else {
        document.getElementById('demoImgs').innerHTML = ' <img id="demoImg" src="/img/upload_img.png" alt="">'
    }
}



const resetForm = (HTMLFormInput) => {
    setTimeout(() => {
        handleFile(HTMLFormInput.file);
    }, 200);
}
const resetForm2 = (HTMLFormInput) => {
    setTimeout(() => {
        handleFiles(HTMLFormInput.file);
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

const toggleImages = (e) => {
    let imageValue = e.getAttribute('value');
    let frameNo = imageValue.split('-').pop();
    document.getElementById(`f-${frameNo}`).src = e.src;
}


const showGallary = async () => {
    page.innerHTML = ` 
            <i class="fas fa-spinner rotateMe"></i> 
        `
    let data = await myGET('/user/gallary/all');
    if (data.success) {
        data = data.data;
        page.innerHTML = ``
        data.forEach((frame, index) => {
            page.innerHTML += genrateFrame(frame, index);
        });
    }
    else {
        page.innerHTML = showSWrong('showClasses()');
    }
}

const genrateFrame = (data, index) => {
    // console.log(data);
    let value = `<div class="gallaryFrame">
                    <div class="text">${data.title}</div>
                    <div class="mainPhoto">
                        <img id='f-${index}' src="${data.images[0]}" alt="">
                    </div>
                    <div class="imagesScroller">
                        `
    data.images.map(val => {
        value += `<div>
                            <img onclick="toggleImages(this)" value='i-${index}' src="${val}" alt="">
                        </div>`
    })
    value += `
                    </div>
                    <button class="normalButton" onclick="deleteFrame('${data._id}')" style="background:red;    position: absolute;
    margin-top: 5px;">Delete</button>
                    <span class="timePost">At ${formatTime(data.createdAt)}</span>
                </div>`
    return value;
}

const deleteFrame = async (id) => {
    try {
        let val = confirm("This step cant be Undo!!");
        console.log(val);
        if (val) {
            await myGET(`/user/gallary/remove/${id}`);
            showGallary();
        }
    } catch (err) {
        showGallary();
    }
}



const showAnnouncement = async () => {
    page.innerHTML = ` 
            <i class="fas fa-spinner rotateMe"></i> 
        `
    let data = await myGET('/class/announcement/all');
    if (data.success) {
        data = data.data;
        page.innerHTML = ``
        data.forEach(data => {
            console.log(data);
            page.innerHTML += `
            <div class="post">
                    <div class="postWrapper">
                        <div class="postTop">
                            <div class="postTopLeft">
                                <img class="postProfileImg" src= '/img/logo.png' alt='user'>
                                <div class="div_post_left">
                                    <span class="postUsername">Principle</span>
                                    <div class="time">${formatTime(data.createdAt)}</div>

                                </div>
                            </div>
                        </div>
                        <hr>
                        <div class="postCenter">
                            <h3>${data.title}</h3>
                            <span class="postText">${data.body}</span> 
                            <img class='postImg' src='${data.icon}' alt='Error While Loading...'></img>
                        </div>
                        <div class="postBottom"> 
                            <button onclick="deleteAnnouncement('${data._id}')" class="normalButton" style="background:red">Delete</button>
                        </div>
                    </div>
                </div>
            `
        });
    }
    else {
        page.innerHTML = showSWrong('showClasses()');
    }
}


const deleteAnnouncement = async (id) => {
    try {
        let val = confirm("This step cant be Undo!!");
        console.log(val);
        if (val) {
            await myGET(`/class/announcement/remove/${id}`);
            showAnnouncement();
        }
    } catch (err) {
        showAnnouncement();
    }
}



//customize textArea

const textAreaFocus = (e) => {
    console.log(e.innerHTML);
    if (e.innerHTML === 'Write About this...') {
        e.innerHTML = '';
    }
}
const textAreaBlur = (e) => {

    if (e.innerHTML.split('&nbsp;').join('').trim() === '') {
        e.innerHTML = 'Write About this...';
    }
} 