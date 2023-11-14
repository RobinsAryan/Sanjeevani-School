let userId = null, classId = null;
window.onload = () => {
    userId = document.getElementById('userId').value;
    if (!userId) {
        alert("User Not Exist!!");
        location.replace('/');
    }
    classId = document.getElementById('classId').value;
    if (!classId) {
        alert("Class Not Exist!!");
        location.replace('/');
    }
    loadStudents();
}

const loadStudents = async () => {
    let pdiv = document.getElementById('ebooks');
    pdiv.innerHTML = `
        <div style="padding-top:30px">
            <i class="fas fa-spinner rotateMe"></i>
            </div>
        `
    let data = await myGET(`/class/students/all/${classId}`);
    if (data.success) {
        pdiv.innerHTML = '';
        data.data.map(student => {
            pdiv.innerHTML += `<div class="student" onclick="location.href='/user/profile/${student.student._id}'">
            <div class="profile">
                        <img src="${student.student.profile ? student.student.profile : '/img/nouser.png'}" alt="">
                    </div>
                    <div class="Info">
                        <p>${student.student.username}</p>
                        <p style="font-size: 12px; color: gray;">Roll No. ${student.student.rollno}</p>
                        </div>
                        </div>`
        })
    }
    else {
        pdiv.innerHTML = showSWrong('loadStudents()');
    }
}

const openUserProfile = () => {
    location.href = `/user/profile/${userId}`;
}
