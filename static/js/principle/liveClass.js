let classId = null;
let pdiv = document.getElementsByClassName('classes')[0];
const loadRooms = async () => {
    try {
        pdiv.innerHTML = `
            <div style="padding-top:30px">
                <i class="fas fa-spinner rotateMe"></i>
                </div>
                `
        let data = await myGET(`/RTC/liveClasses/all/${classId}`);
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
                                <div style="width: max-content; position: absolute; top: 20px;right: 0px;">
                                    <button onclick="removeRoom('${room._id}')" class="normalButton" style="visibility:${room.isAdmin ? 'visible' : 'hidden'};background:red; margin-bottom: 10px;">Remove</button>
                                    <p style="font-size: 10px; color: gray; text-align: center;">Report Issue</p>
                                </div>
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
function createRoomId() {
    const roomName = getUUID4();
    if (roomName) {
        // window.location.href = '/rtcServer/join/' + roomName + `/${classId}`;
        return roomName;
    } else {
        alert('Error is Creating Room!');
        location.reload();
    }
}

const openTitle = () => {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML = `<div class="popup-form">
        <div class="hidePopUp" ><i onClick = "closePopup()" class="fa-solid fa-xmark"></i></div> 
            <form onSubmit="handleSubmitTitle(event)" id="fileUploadForm">
                <input type="text" id="title" name="title" placeholder="Title" required><br><br>
                <div>
                    <button style="background:#ff4646;" type="reset">Reset</button>
                    <button type="submit">Submit</button>
                </div>
            </form>
        </div>`
}


const handleSubmitTitle = async (e) => {
    e.preventDefault();
    let title = e.target.title.value;
    if (title.length) {
        try {
            document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
            let roomId = createRoomId();
            let resData = await myPost(`/RTC/create/${classId}/${roomId}`, { title })
            if (resData.success) {
                document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                    <div class="hidePopUp"><i onclick='location.reload()' class="fa-solid fa-xmark"></i></div>
                    <p>Room Created Successfully!</p>
                    <div><button class="normalButton" style="background:#ff4646;" onclick='location.reload()'>Back</button>
                    <button class="normalButton" type="submit" onclick="location.href='/rtcServer/join/${resData.data.roomId}'">Join</button></div>
                </div>`
            } else {
                document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                    <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
                    ${showSWrong('openTitle()')}
                </div>`
            }
        } catch (err) {
            document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                    <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
                    ${showSWrong('openTitle()')}
                </div>`
        }
    }
    else closePopup();
}

const removeRoom = async (id) => {
    try {
        let resData = await myGET(`/RTC/room/remove/${id}`);
        if (resData.success) {
            location.reload();
        }
        else {
            alert("Something Wrong!!");
        }
    } catch (err) {
        alert("Something Wrong!!");
    }
}