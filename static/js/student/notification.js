let userId = null, classId = null;
window.onload = () => {
    userId = document.getElementById('userId').value;
    classId = document.getElementById('classId').value;
    if (!userId) {
        alert("User Not Exist!!");
        location.replace('/');
    }
    if (!classId) {
        alert("Class Not Exist!!");
        location.replace('/');
    }
    loadNotifications();
}

const loadNotifications = async () => {
    let pdiv = document.getElementById('ebooks');
    pdiv.innerHTML = `
        <div style="padding-top:30px">
            <i class="fas fa-spinner rotateMe"></i>
            </div>
        `
    let data = await myGET(`/student/notifications/all/${classId}`);
    if (data.success) {
        data = data.data;
        console.log(data);
        pdiv.innerHTML = '';
        data.map(notification => {
            console.log(notification)
            pdiv.innerHTML += `<div class="student" onclick = 'location.href="${redirectingLink(notification)}"'>
                <div class="profile">
                            <img src='${notification.icon ? notification.icon : '/img/logo.png'}' alt="">
                        </div>
                        <div class="Info">
                            <p>${notification.title}</p>
                            <p style="font-size: 12px; color: gray;"> ${notification.body}</p>
                            <p style="font-size: 12px; color: gray;">On: ${formatTime(notification.createdAt)}</p>
                            </div> 
                            </div>`
        })
    }
    else {
        pdiv.innerHTML = showSWrong('loadStudents()');
    }
}

const redirectingLink = (notification) => {
    switch (notification.event) {
        case 'Genral':
            return '/';
        case 'Ebook':
            return '/student/ebooks';
        case 'Gallary':
            return '/user/gallary';
        case 'ClassWork':
            return '/student/classWork';
        default:
            return '/';
    }
}