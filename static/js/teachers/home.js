const lineContainer = document.querySelector(".line-container");
let page = document.getElementsByClassName('classes')[0];
const menu = document.querySelector(".menu");
let refrenceLoad = document.getElementById('refrence');


lineContainer.addEventListener("click", () => {
    lineContainer.classList.toggle("active");
    menu.classList.toggle("active");
});




const pages = [
    {
        title: 'Classes',
        url: '/'
    },
    {
        title: 'Teachers',
        url: '/'
    },
    {
        title: 'Announcements',
        url: '/'
    },
    {
        title: 'Gallary',
        url: '/'
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
    page.innerHTML = ''
    refrenceLoad.innerHTML = ''
    if (openedPage == 0) {
        showClasses();
    }
    else if (openedPage == 1) {
        showTeachers();
    }
    else if (openedPage == 2) {
        showAnnouncement(0);
    }
    else if (openedPage == 3) {
        showGallary(0);
    }
    else page.innerHTML = 'Upcoming...'
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
    document.getElementById(`f-${frameNo}`).src = e.src.split('/compressed').join('');
}

const openFrameImage = (img) => {
    location.href = img.src;
}


let gallaryPage = 0, showMoreGallaryPage = false, frameCount = 0;

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
            page.innerHTML += genrateFrame(frame, frameCount + index);
        });
        frameCount += data.length;
        showMoreGallaryPage = true;
    }
    else {
        refrenceLoad.innerHTML = showSWrong(`showGallary(${pageNum})`);
    }
}


const genrateFrame = (data, index) => {
    let value = `<div class="gallaryFrame">
                    <div class="text">${data.title}</div>
                    <div class="mainPhoto">
                        <img onclick='openFrameImage(this)' id='f-${index}' src="${data.images[0]}" alt="">
                    </div>
                    <div class="imagesScroller">
                        `
    data.images.map(val => {
        value += `<div>
                            <img onclick="toggleImages(this)" value='i-${index}' src="/compressed${val}" alt="">
                        </div>`
    })
    value += `
                    </div> 
                    <span class="timePost">At ${formatTime(data.createdAt)}</span>
                </div>`
    return value;
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

const about = () => {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML =
        `
            <div class="popup-form">
                <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
                <h3 style="color:#f85100;padding-bottom: 20px;">Sanjeevani School</h3>
                <p>Welcome to Sanjeevani School</p>
                <p>You can change your profile picture via visiting Profile Page.</p>
                <p style="color:#f85100;padding-bottom: 20px;">And Kindly change your password.</p>
                <button class="normalButton" onclick='closePopup()'>Close</button>
            </div>
        `
}