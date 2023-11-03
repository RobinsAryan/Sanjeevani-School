let gallary = document.getElementById('mainGallary');
let userId = null;

window.onload = () => {
    userId = document.getElementById('userId').value;
    if (!userId) {
        alert("User Not Exist!!");
        location.replace('/');
    }
    loadGallary();
}

const openUserProfile = () => {
    location.href = `/user/profile/${userId}`;
}

const loadGallary = async () => {
    let resData = await myGET('/user/gallary/all')
    if (resData.success) {
        resData.data.map((item, index) => {
            gallary.innerHTML += genrateFrame(item, index);
        })
        console.log(resData)
    } else {

    }
}

const genrateFrame = (data, index) => {
    console.log(data);
    let value = `<div class="gallaryFrame">
                    <div class="text">${data.title}</div>
                    <div class="mainPhoto">
                        <img id='f-${index}' src="${data.images[0]}" alt="">
                    </div>
                    <div class="imagesScroller">
                        `
    data.images.map(val => {
        value += `<div>
                            <img onclick="toggleImages(this)" value='i-${index}' src="${val}" alt="">
                        </div>`
    })
    value += `
                    </div>
                    <span class="timePost">At ${formatTime(data.createdAt)}</span>
                </div>`
    return value;
}


const toggleImages = (e) => {
    let imageValue = e.getAttribute('value');
    let frameNo = imageValue.split('-').pop();
    document.getElementById(`f-${frameNo}`).src = e.src;
}