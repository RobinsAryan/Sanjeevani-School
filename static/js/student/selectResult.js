let classId = null, userId = null;

window.onload = () => {
    classId = document.getElementById('classID').value;
    if (!classId) {
        alert("Class Not Exist!!");
        location.replace('/');
    }
    userId = document.getElementById('userId').value;
    if (!userId) {
        alert("User Not Exist!!");
        location.replace('/');
    }
    loadSelectResult();
}

let selectResult = document.getElementById('selectResult');
const loadSelectResult = async () => {
    selectResult.innerHTML = ' <i class="fas fa-spinner rotateMe"></i>  '
    try {
        let resData = await myGET(`/class/result/all/student/${classId}`);
        console.log(resData)
        if (resData.success) {
            if (resData.data.length) {
                selectResult.innerHTML = ''
                resData.data.map(item => {
                    selectResult.innerHTML += `
                    <div class="resultItem" onclick="location.href='/class/result/students/single/${userId}/${item._id}'">
                        <p>${item.title}</p>
                        <span>Uploaded On: ${formatTime(item.createdAt)}</span>
                        <div><i class="fas fa-chevron-right"></i></div>
                    </div>
                   `
                })
            } else {
                selectResult.innerHTML = 'Nothing to show Here!';
            }
        } else {
            selectResult.innerHTML = ` 
                ${showSWrong('loadSelectResult()')} 
            `
        }
    } catch (err) {
        selectResult.innerHTML = ` 
                ${showSWrong('loadSelectResult()')} 
            `
    }
}

const openUserProfile = () => {
    location.href = `/user/profile/${userId}`;
}
