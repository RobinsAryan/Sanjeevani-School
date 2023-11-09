const lineContainer = document.querySelector(".line-container");
let page = document.getElementsByClassName('classes')[0];
let createBtn = document.getElementById('createBtn');
const menu = document.querySelector(".menu");
let refrenceLoad = document.getElementById('refrence');


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
    {
        title: 'Home',
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
    createBtn.style.display = 'initial';
    createBtn.innerText = pages[openedPage].btnText;
    page.innerHTML = ''
    refrenceLoad.innerHTML = ''
    if (openedPage == 0) {
        showClasses();
    }
    else if (openedPage == 1) {
        showTeachers();
    }
    else if (openedPage == 3) {
        showAnnouncement(0);
    }
    else if (openedPage == 4) {
        showGallary(0);
    }
    else if (openedPage == 5) {
        createBtn.style.display = 'none';
        page.innerHTML = ` <div class="mainHome">
                    <div class="searchData">
                        <input type="text" name="search" id="search" placeholder="Search">
                        <button>Search</button>
                    </div>
                    <div class="homeHead">
                        <i class="fas fa-graduation-cap"></i>
                        <h3>Student Strength</h3>
                    </div>
                    <div class="studentCount">
                        <p>Total Students: <span id="totalStudents">...</span></p>
                    </div>
                    <div class="studentsDetails">
                        <div class="sdRow">
                            <div class="sdItem" style="border-right: 1px solid #b7b7b7;">
                                <div class="sdicon">
                                    <img src="/img/male.png" alt="">
                                </div>
                                <div class="sdData">
                                    <small>Male <span id="maleCount">...</span></small>
                                    <p id="maleNo">...</p>
                                </div>
                            </div>
                            <div class="sdItem">
                                <div class="sdicon">
                                    <img src="/img/female.png" alt="">
                                </div>
                                <div class="sdData">
                                    <small>Female <span id="femaleCount">...</span></small>
                                    <p id="femaleNo">...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="studentsDetails">
                         <div class="studentGraph">
                            <p1>Distrubution of Students<small>(Standard Wise)</small></p1>
                            
                            <div class="studentMainGraph">
                                <canvas id="studentChart1"></canvas> 
                            </div>
                         </div>
                    </div> 
                </div>`
        loadHome();
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
    let pageNum = 5;
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


let gallaryPage = 0, showMoreGallaryPage = false;

const showGallary = async (pageNum) => {
    showMoreGallaryPage = false;
    refrenceLoad.innerHTML = '<i class="fas fa-spinner rotateMe"></i>';
    let data = await myGET(`/user/gallary/all?page=${pageNum}`);
    if (data.success) {
        data = data.data;
        if (data.length == 0) {
            refrenceLoad.innerHTML = 'Page End!';
            return;
        }
        data.forEach((frame, index) => {
            page.innerHTML += genrateFrame(frame, index);
        });
        showMoreGallaryPage = true;
    }
    else {
        refrenceLoad.innerHTML = showSWrong(`showGallary(${pageNum})`);
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
            showGallary(0);
        }
    } catch (err) {
        showGallary(0);
    }
}


let announcementPage = 0, showMoreAnnouncementPage = false;

const showAnnouncement = async (pageNum) => {
    showMoreAnnouncementPage = false;
    refrenceLoad.innerHTML = '<i class="fas fa-spinner rotateMe"></i>';
    let data = await myGET(`/class/announcement/all?page=${pageNum}`);
    if (data.success) {
        data = data.data;
        if (data.length == 0) {
            refrenceLoad.innerHTML = 'You Reached At End!'
            return;
        }
        data.forEach(data => {
            page.innerHTML += `
            <div class="post lastPost">
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
        showMoreAnnouncementPage = true;
    }
    else {
        refrenceLoad.innerHTML = showSWrong(`showAnnouncement(${pageNum})`);
    }
}


window.addEventListener('scroll', () => {
    handleScroll();
})

const isElementInView = () => {
    const rect = refrenceLoad.getBoundingClientRect();
    return (
        (rect.bottom - 300) <= (window.innerHeight || document.documentElement.clientHeight)
    );
};

const handleScroll = () => {
    if (openedPage == 3 && showMoreAnnouncementPage && isElementInView()) {
        announcementPage++;
        showAnnouncement(announcementPage);
    }
    else if (openedPage == 4 && showMoreGallaryPage && isElementInView()) {
        gallaryPage++;
        showGallary(gallaryPage);
    }
};





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







const createGraph = (data) => {
    const ctx = document.getElementById("studentChart1").getContext("2d");
    const labels = ["janfsdf", 'sfsafasf', 'afdsafasf', 'sffasfdfafsd', 'wresdfsaf', 'xcfaefwer', 'fsafsafsf', "janfsdf", 'sfsafasf', 'afdsafasf', 'sffasfdfafsd',]
    new Chart(ctx, {
        type: "bar",
        data: data,
        options: {
            maintainAspectRatio: false,
        }
    });
}
let totalBGColors = [
    ['rgba(255, 99, 132, 0.2)', 'rgb(255, 99, 132)'],
    ['rgba(255, 159, 64, 0.2)', 'rgb(255, 159, 64)'],
    ['rgba(255, 205, 86, 0.2)', 'rgb(255, 205, 86)'],
    ['rgba(75, 192, 192, 0.2)', 'rgb(75, 192, 192)'],
    ['rgba(54, 162, 235, 0.2)', 'rgb(54, 162, 235)'],
    ['rgba(153, 102, 255, 0.2)', 'rgb(153, 102, 255)'],
    ['rgba(201, 203, 207, 0.2)', 'rgb(201, 203, 207)']
]

const loadHome = async () => {
    try {
        let resData = await myGET('/studentsInfo');
        if (resData.success) {
            document.getElementById('totalStudents').innerHTML = resData.male + resData.female;
            document.getElementById('maleCount').innerHTML = `${((resData.male / (resData.male + resData.female)) * 100).toFixed(2)}%`;
            document.getElementById('femaleCount').innerHTML = `${((resData.female / (resData.male + resData.female)) * 100).toFixed(2)}%`;
            document.getElementById('maleNo').innerHTML = resData.male;
            document.getElementById('femaleNo').innerHTML = resData.female;
            let lebals = [], dataset = [], backgroundColor = [], borderColor = [];
            let rno = 0;
            resData.perClass.map(item => {
                lebals.push(item.className);
                dataset.push(item.count);
                backgroundColor.push(totalBGColors[rno][0])
                borderColor.push(totalBGColors[rno][1])
                rno++;
                if (rno >= 7) rno = 0;
            })
            const data = {
                labels: lebals,
                datasets: [{
                    label: 'Students',
                    data: dataset,
                    backgroundColor,
                    borderColor,
                    borderWidth: 1
                }]
            };
            console.log(data);
            createGraph(data);
        } else {

        }
    } catch (err) {
        console.log(err)
    }
}