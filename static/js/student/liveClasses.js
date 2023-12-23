let classId = null;
const loadRooms = async () => {
    try {
        let pdiv = document.getElementById('selectResult');
        pdiv.innerHTML = `
            <div style="padding-top:30px">
                <i class="fas fa-spinner rotateMe"></i>
                </div>
                ` 
        let data = await myGET(`/RTC/liveClasses/all/${classId}`);
        console.log(data);
        if (data.success) {
            pdiv.innerHTML = '';
            data.data.map(room => {
                pdiv.innerHTML += `
                        <div class="student" style="position:relative;">
                            <div class="Info">
                                <h2  onclick="location.href='/rtcServer/join/${room.roomId}'" style="font-size:18px">${room.title}</h2>
                                <span style="font-size:12px;color:gray;">Created By: <a href="/user/profile/${room.user._id}">${room.user.username}</a></span>
                                <br/>
                                <small style="font-size:10px;color:gray;">${formatTime(room.createdAt)}</small>
                            </div>
                        </div>`
            })
        }
        else { 
            pdiv.innerHTML = showSWrong('loadRooms()');
        }
    } catch (err) { 
        pdiv.innerHTML = showSWrong('loadRooms()');

    }
}
window.onload = () => { classId = document.getElementById('classID').value; loadRooms(); }