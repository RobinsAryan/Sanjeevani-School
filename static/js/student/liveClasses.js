let classId = null;
const loadRooms = async () => {
    try {
        let pdiv = document.getElementById('selectResult');
        pdiv.innerHTML = `
            <div style="padding-top:30px">
                <i class="fas fa-spinner rotateMe"></i>
                </div>
                `
        console.log(classId);
        let data = await myGET(`/RTC/liveClasses/all/${classId}`);
        console.log(data);
        if (data.success) {
            pdiv.innerHTML = '';
            data.data.map(student => {
                pdiv.innerHTML += `<div class="student" onclick="location.href='/rtcServer/join/${student.roomId}/${student.class}'">
                            <div class="Info">
                                <h2>${student.title}<h2>
                                    </div> 
                                    </div>`
            })
        }
        else {
            console.log(data);
            pdiv.innerHTML = showSWrong('loadRooms()');
        }
    } catch (err) {
        console.log(err);
        pdiv.innerHTML = showSWrong('loadRooms()');

    }
}
window.onload = () => { classId = document.getElementById('classID').value; loadRooms(); }