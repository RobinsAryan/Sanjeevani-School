let resultId = null;

window.onload = () => {
    resultId = document.getElementById('resultId').value;
    if (!resultId) {
        alert("Class Not Exist!!");
        location.replace('/');
    }
    loadStudents();
}

const loadStudents = async () => {
    let pdiv = document.getElementsByClassName('classes')[0];
    pdiv.innerHTML = `
        <div style="padding-top:30px">
            <i class="fas fa-spinner rotateMe"></i>
            </div>
        `
    let data = await myGET(`/class/result/students/all/${resultId}`);
    if (data.success) {
        data = data.data[0];
        console.log(data);
        pdiv.innerHTML = '';  
        data.result.map(student => {
            pdiv.innerHTML += `<div class="student" onclick="location.href='/class/result/students/single/${student._id}/${resultId}'">
            <div class="profile">
                        <img src="${student.profile ? student.profile : '/img/nouser.png'}" alt="">
                    </div>
                    <div class="Info">
                        <p>${student.username}</p>
                        <p style="font-size: 12px; color: gray;">Roll No. ${student.rollno}</p>
                        </div> 
                        </div>`
        })
    }
    else {
        pdiv.innerHTML = showSWrong('loadStudents()');
    }
}