let fencyDiv = document.getElementById('fancyDiv');
let birthdayUser = document.getElementById('birthdayUser');
let moreBirthday = document.getElementById('moreBirthday');
let menu = document.getElementsByClassName('menu')[0];
let userId = null, userBirthday = false;
let loadingPost = document.getElementById('loadingPost')
setInterval(() => {
    fencyDiv.style.borderRadius = `${10 + Math.random() * 30}px ${10 + Math.random() * 30}px ${10 + Math.random() * 30}px ${10 + Math.random() * 30}px `
}, 400)

const openUserProfile = () => {
    menu.classList.toggle('hide');
    vibrate.touch();
}

const redirectProfile = () => {
    location.href = `/user/profile/${userId}`;
}


const loadBirthDays = async () => {
    closePopup();
    try {
        birthdayUser.innerHTML = `<div style="height: 70px;">
                            <div class="loading_div">
                                <i class="fas fa-spinner rotateMe"></i>
                            </div>
                        </div>`
        let resData = await myGET('/birthdays');
        birthdayUser.innerHTML = '';
        if (resData.success) {
            if (resData.data.length) {
                resData.data.map(user => {
                    birthdayUser.innerHTML += `<div class="user">
                            <small><i class="fas fa-fire"></i></small>
                            <div class="userProfile">
                                <img src="${user.profile ? user.profile : '/img/nouser.png'}" alt="">
                            </div>
                            <p>${user.username}</p>
                            <span>${user.class.className}</span>
                            <button onclick="location.href='/user/profile/${user._id}'" class="normalButton">Visit</button>
                        </div>`
                })
            } else {
                birthdayUser.innerHTML = `<div class="noBirthday">
                            <p>No BirthDay Today</p>
                            <img src="/img/noData.gif" alt="">
                        </div>`
            }
        } else {
            document.getElementById('popup').style.display = 'block';
            document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
                ${showSWrong('loadBirthDays()')}
                </div>
            `
            birthdayUser.innerHTML = `<div class="noBirthday"> 
                            <img src="/img/noData.gif" alt="">
                        </div>`
        }
        if (birthdayUser.scrollWidth - 50 < birthdayUser.clientWidth) moreBirthday.style.display = 'none';
    } catch (err) {
        document.getElementById('popup').style.display = 'block';
        document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
                ${showSWrong('loadBirthDays()')}
                </div>
            `
        birthdayUser.innerHTML = `<div class="noBirthday"> 
                            <img src="/img/noData.gif" alt="">
                        </div>`
    }
}

const wishBirthday = () => {
    localStorage.removeItem('wished');
    localStorage.setItem('wished', JSON.stringify({ date: Date.now() }))
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML = `
    <div class="popup-form"> 
             
           <div>
           <p>Sanjeevani School Wishes You</p>
           <p>Happy BirthDay<p>
           </div> 
        </div>
    `
    Draw();
    setTimeout(() => {
        closePopup();
        document.getElementById('canvas').remove();
        loadBirthDays();
    }, 8000);
}


window.onload = () => {
    userId = document.getElementById('userId').value;
    if (document.getElementById('userBirthday')) userBirthday = 1;
    if (!userId) {
        alert("Class Not Exist!!");
        location.replace('/');
    }
    if (userBirthday) {
        let wished = localStorage.getItem('wished');
        if (wished) {
            wished = JSON.parse(wished);
            if (new Date(wished.date + 48 * 60 * 60 * 1000) < new Date()) {
                wishBirthday();
                loadBirthDays();
            }
            else {
                document.getElementById('canvas').remove();
                loadBirthDays();
            }
        } else {
            wishBirthday();
        }
    }
    else {
        document.getElementById('canvas').remove();
        loadBirthDays();
    }
    setTimeout(() => {
        loadAnnouncements(0);
    }, 2000);
}


const buttonLinks = (id) => {
    switch (id) {
        case 1:
            location.href = `/user/attandance/${userId}`
            break;

        default:
            break;
    }
}


//scroll Settings

birthdayUser.addEventListener('scroll', () => {
    if (birthdayUser.scrollLeft + birthdayUser.clientWidth > (birthdayUser.scrollWidth - 60)) {
        moreBirthday.style.display = 'none'
    }
    else {
        moreBirthday.style.display = 'initial'
    }
})




let announcement = document.getElementById('announcements');
let needLoadMore = false, pageCount = 0;

const loadAnnouncements = async (page) => {
    needLoadMore = false;
    try {
        let resData = await myGET(`/class/announcement/all?page=${page}`);
        if (resData.success) {
            if (resData.data.length) {
                resData.data.map(announce => {
                    console.log(announce)
                    announcement.innerHTML += `<div class="post">
                                <div class="postWrapper">
                                    <div class="postTop">
                                        <div class="postTopLeft">
                                            <img class="postProfileImg" src='/img/logo.png' alt='user'>
                                            <div class="div_post_left">
                                                <span class="postUsername">Principle</span>
                                                <div class="time">${formatTime(announce.createdAt)}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <hr>
                                    <div class="postCenter">
                                        <h3 class="postText">${announce.title}</h3>
                                        <span class="postText">${announce.body}</span>
                                        <img class='postImg' src='${announce.icon}' alt='Error While Loading...'></img>
                                    </div> 
                                </div>
                            </div>`
                    needLoadMore = true;
                })
            } else {
                loadingPost.style.display = 'none'
                announcement.innerHTML += `<div class="noBirthday">
                            <p>No Announcements to Show</p>
                            <img src="/img/noData.gif" alt="">
                        </div>`
            }
        } else {
            loadingPost.style.display = 'none'
            document.getElementById('popup').style.display = 'block';
            document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
                ${showSWrong('loadAnnouncements()')}
                </div>
            `
            announcement.innerHTML += `<div class="noBirthday"> 
                            <img src="/img/noData.gif" alt="">
                        </div>`
        }
    } catch (err) {
        console.log(err);
        loadingPost.style.display = 'none'
        console.log(err);
        document.getElementById('popup').style.display = 'block';
        document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
                ${showSWrong('loadAnnouncements()')}
                </div>
            `
        announcement.innerHTML += `<div class="noBirthday"> 
                            <img src="/img/noData.gif" alt="">
                        </div>`
    }
}

window.addEventListener('scroll', () => {
    handleScroll();
})


const isElementInView = () => {
    const rect = loadingPost.getBoundingClientRect();
    return (
        (rect.bottom - 300) <= (window.innerHeight || document.documentElement.clientHeight)
    );
};

const handleScroll = () => {
    if (needLoadMore && isElementInView()) {
        pageCount++;
        loadAnnouncements(pageCount);
    }
};





const PublicKey = 'BMTUJwXpovugSRpuXdZjlS0XhNclQFIER9LcXVemxQSi8hLX3US6-2Eg0Sow74qtHnH_x3FS8yUl3NmCsdlosx8'


async function subscribeToPush() {
    try {
        document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            console.log("granted!");
            const registration = await navigator.serviceWorker.ready;

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(PublicKey)
            });

            await myPost('/subscribe', subscription);
            vibrate.success();
            alert("All set to go with Notifications!");
            closePopup();
        }
        else {
            vibrate.failure();
            alert("Failed To Register with notifications")
        }
    } catch (error) {
        console.log(error);
        vibrate.failure();
        alert("Failed To Register with notifications")
    }
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

const PolicyAggrement = () => {
    vibrate.warning();
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML = `
        <div class="popup-form"> 
        <h2 style="font-size:15px;margin-bottom:20px">Notifications to Use App!</h2>
        <p style="font-size:12px">Allow Notifications to stay update with App!</p>
        <button onclick="closePopup()" class="normalButton" style="background:red;margin-top:10px">Deny</button>
        <button onclick="subscribeToPush()" class="normalButton" style="margin-top:10px">Allow</button>
        </div>
        `
}