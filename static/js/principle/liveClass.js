let classId = null;
const loadRooms = async () => {
    try {
        let pdiv = document.getElementsByClassName('classes')[0];
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
function getUUID4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (
            c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16),
    );
}
function joinRoom() {
    const roomName = getUUID4();
    if (roomName) {
        window.location.href = '/rtcServer/join/' + roomName + `/${classId}`;
    } else {
        alert('Error is Creating Room!');
        location.reload();
    }
}