let classId = null;
let shareForm = document.getElementById('shareForm');
let textArea = document.getElementById('text');
let title = document.getElementById('title');

 
shareForm.onsubmit = async (e) => {
    e.preventDefault();
    document.getElementById('sharePostBtn').innerHTML = '<i class="fas fa-spinner rotateMe"></i>'
    let data = {
        title: title.value,
        body: textArea.innerHTML,
    }
    console.log(data);
    if (data.title == '' || data.body === 'Write Announcement' || data.body.trim() === '') {
        alert('Cannot Resolve Empty Requests!');
        document.getElementById('sharePostBtn').innerHTML = 'Post'
        return;
    }
    let resData = await myPost(`/class/announcement/add/${classId}`, data);
    if (resData.success) {
        location.reload();
    }
    else {
        document.getElementById('sharePostBtn').innerHTML = 'Post'
        document.getElementById('popup').style.display = 'block';
        document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('location.reload()')}
                </div>
            `
        return;
    }
}

shareForm.onreset = (e) => {
    title.value = '',
        textArea.innerHTML = 'Write Announcement'
}


window.onload = () => {
    classId = document.getElementById('classID').value;
    if (!classId) {
        alert("Class Not Exist!!");
        location.replace('/');
    }
    loadNotifications();
}

const loadNotifications = async () => {
    let pdiv = document.getElementsByClassName('classes')[0];
    pdiv.innerHTML = `
        <div style="padding-top:30px">
            <i class="fas fa-spinner rotateMe"></i>
            </div>
        `
    let data = await myGET(`/class/announcement/all/${classId}`);
    console.log(data);
    if (data.success) {
        pdiv.innerHTML = '';
        data.data.map(notification => {
            pdiv.innerHTML += `<div class="post">
                    <div class="postWrapper">
                        <div class="postTop">
                            <div class="postTopLeft" onclick="location.href='/user/profile/${notification.author._id}'">
                                <img class="postProfileImg" src='${notification.author.profile ? notification.author.profile : '/img/nouser.png'}' alt='user'>
                                <div class="div_post_left">
                                    <span class="postUsername">${notification.author.username}</span>
                                    <div class="time">${formatTime(notification.createdAt)}</div>
                                </div>
                            </div>
                        </div>
                        <hr>
                        <div class="postCenter">
                            <h3>${notification.title}</h3>
                            <span class="postText">${notification.body}</span>
                        </div>
                        <div class="postBottom"> 
                            <button onclick="removeNotification('${notification._id}')" class="normalButton" style="background:red">Delete</button>
                        </div>
                    </div>
                </div>`
        })
    }
    else {
        pdiv.innerHTML = showSWrong('loadNotifications()');
    }
}
 
 
 
 
const removeNotification = async (id) => {
    try {
        let val = confirm("This step cant be Undo!!");
        if (val) {
            await myGET(`/class/announcement/remove/${id}`);
            loadNotifications();
        }
    } catch (err) {
        loadNotifications();
    }
}


//customize textArea

textArea.addEventListener('focus', (e) => {
    if (e.target.innerHTML === 'Write Announcement') {
        e.target.innerHTML = '';
    }
})
textArea.addEventListener('blur', (e) => {
    if (e.target.innerText.trim() === '') {
        e.target.innerHTML = 'Write Announcement';
    }
})