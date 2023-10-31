let fencyDiv = document.getElementById('fancyDiv');
let birthdayUser = document.getElementById('birthdayUser');
let moreBirthday = document.getElementById('moreBirthday')
let userId = null, userBirthday = false;
setInterval(() => {
    fencyDiv.style.borderRadius = `${10 + Math.random() * 30}px ${10 + Math.random() * 30}px ${10 + Math.random() * 30}px ${10 + Math.random() * 30}px `
}, 400)

const openUserProfile = () => {
    location.href = `/user/profile/${userId}`;
}



const loadBirthDays = async () => {
    closePopup();
    try {
        birthdayUser.innerHTML = `<div style="height: 70px;">
                            <div class="loading_div">
                                <i class="fas fa-spinner rotateMe"></i>
                            </div>
                        </div>`
        let resData = await myGET('/birthdays');
        birthdayUser.innerHTML = '';
        if (resData.success) {
            if (resData.data.length) {
                resData.data.map(user => {
                    birthdayUser.innerHTML += `<div class="user">
                            <small><i class="fas fa-fire"></i></small>
                            <div class="userProfile">
                                <img src="${user.profile ? user.profile : '/img/nouser.png'}" alt="">
                            </div>
                            <p>${user.username}</p>
                            <span>${user.class.className}</span>
                            <button onclick="location.href='/user/profile/${user._id}'" class="normalButton">Visit</button>
                        </div>`
                })
                if (birthdayUser.scrollWidth - 50 < birthdayUser.clientWidth) moreBirthday.style.display = 'none';
            } else {
                birthdayUser.innerHTML = `<div class="noBirthday">
                            <p>No BirthDay Today</p>
                            <img src="/img/noData.gif" alt="">
                        </div>`
            }
        } else {
            document.getElementById('popup').style.display = 'block';
            document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
                ${showSWrong('loadBirthDays()')}
                </div>
            `
            birthdayUser.innerHTML = `<div class="noBirthday"> 
                            <img src="/img/noData.gif" alt="">
                        </div>`
        }
    } catch (err) {
        document.getElementById('popup').style.display = 'block';
        document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
                ${showSWrong('loadBirthDays()')}
                </div>
            `
        birthdayUser.innerHTML = `<div class="noBirthday"> 
                            <img src="/img/noData.gif" alt="">
                        </div>`
    }
}

const wishBirthday = () => {
    localStorage.removeItem('wished');
    localStorage.setItem('wished', JSON.stringify({ date: Date.now() }))
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML = `
    <div class="popup-form"> 
             
           <div>
           <p>Sanjeevani School Wishes You</p>
           <p>Happy BirthDay<p>
           </div> 
        </div>
    `
    Draw();
    setTimeout(() => {
        closePopup();
        document.getElementById('canvas').remove();
        loadBirthDays();
    }, 8000);
}


window.onload = () => {
    userId = document.getElementById('userId').value;
    if (document.getElementById('userBirthday')) userBirthday = 1;
    if (!userId) {
        alert("Class Not Exist!!");
        location.replace('/');
    }
    if (userBirthday) {
        let wished = localStorage.getItem('wished');
        if (wished) {
            wished = JSON.parse(wished);
            console.log
            if (new Date(wished.date + 48 * 60 * 60 * 1000) < new Date()) {
                wishBirthday();
            }
            else {
                document.getElementById('canvas').remove();
                loadBirthDays();
            }
        } else {
            wishBirthday();
        }
    }
    else {
        document.getElementById('canvas').remove();
        loadBirthDays();
    }
}


const buttonLinks = (id) => {
    switch (id) {
        case 1:
            location.href = `/user/attandance/${userId}`
            break;

        default:
            break;
    }
}


//scroll Settings

birthdayUser.addEventListener('scroll', () => {
    if (birthdayUser.scrollLeft + birthdayUser.clientWidth > (birthdayUser.scrollWidth - 60)) {
        moreBirthday.style.display = 'none'
    }
    else {
        moreBirthday.style.display = 'initial'
    }
})