let gallary = document.getElementById('mainGallary');
let userId = null, curruntPage = 0, morePage = false;
let refrenceDiv = document.getElementById('refrence');

window.onload = () => {
    userId = document.getElementById('userId').value;
    if (!userId) {
        alert("User Not Exist!!");
        location.replace('/');
    }
    loadGallary(0);
}

const openUserProfile = () => {
    location.href = `/user/profile/${userId}`;
}

const loadGallary = async (pageNum) => {
    morePage = false;
    let resData = await myGET(`/user/gallary/all?page=${pageNum}`)
    if (resData.success) {
        if (resData.data.length == 0) {
            refrenceDiv.innerHTML = '';
            gallary.innerHTML += `<div class="noBirthday"> 
                            <img src="/img/noData.gif" alt="">
                        </div>`
            return;
        }
        resData.data.map((item, index) => {
            gallary.innerHTML += genrateFrame(item, index);
        })
        morePage = true; 
    } else { 
        refrenceDiv.innerHTML = showSWrong(`loadGallary(${pageNum})`);
    }
}


window.addEventListener('scroll', () => {
    handleScroll();
})


const isElementInView = () => {
    const rect = refrenceDiv.getBoundingClientRect();
    return (
        (rect.bottom - 300) <= (window.innerHeight || document.documentElement.clientHeight)
    );
};

const handleScroll = () => {
    if (morePage && isElementInView()) {
        curruntPage++;
        loadGallary(curruntPage);
    }
};


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