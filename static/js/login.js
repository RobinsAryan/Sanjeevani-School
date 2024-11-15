let showOffWord = document.getElementsByClassName('show-off-word')[0];
let words = ['Education', 'School', 'Assignments', 'Classes', 'Result', '🥺🥺🥺🥺']
let wordCt = 0;
setInterval(() => {
    showOffWord.innerHTML = words[wordCt++];
    if (wordCt >= words.length) wordCt = 0;
}, 1000)


document.getElementById('loginImage').onload = () => {
    document.getElementsByClassName('page_load_slider')[0].style.right = '100%';
}

window.onload = () => {
    setTimeout(() => {
        if (document.getElementsByClassName('page_load_slider')[0].style.right == 0)
            document.getElementsByClassName('page_load_slider')[0].style.right = '100%';
        setTimeout(() => {
            moveCar();
        }, 1000);
    }, 1500);
}


let myform = document.getElementById('form-1');
let submitBtn = document.getElementById('btn1');
myform.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementsByClassName('error')[0].style.display = 'none';
    submitBtn.setAttribute('disabled', true)
    submitBtn.innerHTML = '<i class="fas fa-spinner rotateMe"></i>'
    let data = {
        email: e.target.email.value,
        password: e.target.password.value,
    }
    let result = await myPost('/login', data);
    if (result.success) {
        showSuccess("Login Successfull, Redirecting...");
        location.replace('/');
    } else {
        submitBtn.removeAttribute('disabled')
        submitBtn.innerHTML = 'Login'
        showError(result.msz);
    }
})

const showError = (err) => {
    vibrate.failure();
    document.getElementsByClassName('error')[0].style.display = 'block';
    document.getElementsByClassName('error')[0].style.backgroundColor = 'rgb(222, 101, 77)';
    document.getElementById('statusMsz').innerText = err;
}
const showSuccess = (msz) => {
    vibrate.success();
    document.getElementsByClassName('error')[0].style.display = 'block';
    document.getElementsByClassName('error')[0].style.backgroundColor = 'rgb(75, 204, 70)';
    document.getElementById('statusMsz').innerText = msz;
}


let passwordVisiblity = document.getElementById('passwordVisiblity')
passwordVisiblity.addEventListener('click', (e) => {
    if (passwordVisiblity.children[0].classList.contains('fa-eye')) {
        passwordVisiblity.children[0].classList.remove('fa-eye');
        passwordVisiblity.children[0].classList.add('fa-eye-slash');
        document.getElementById('password').type = "text"
    }
    else {
        passwordVisiblity.children[0].classList.add('fa-eye');
        passwordVisiblity.children[0].classList.remove('fa-eye-slash');
        document.getElementById('password').type = "password"
    }
})


const forgotPassword = () => {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML = `
        <div class="popup-form">
        <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
            <h2 style="font-size:15px;margin-bottom:20px">Forgot Password?</h2>
            <p style="font-size:12px">Don't worry contact your Principle and tell tham to change it.</p>
            <button class="normalButton" onclick="document.location.href='tel:7027513016'" style="margin-top:20px">Contact</button>
        </div>
    `
}



// let installPrompt = null;
// window.addEventListener("beforeinstallprompt", (event) => {
//     event.preventDefault();
//     installPrompt = event;
//     document.getElementsByClassName('main')[0].innerHTML = ` <div class="app-container">
//         <div class="app-logo">
//             <img src="img/logo.png" alt="App Logo">
//         </div>
//         <div class="app-name">Sanjeevani School</div>
//         <button id="install" onClick = "InstallApp()" class="install-button" onclick="promptUserToInstall()">Install</button>
//     </div>`;
// });

// const InstallApp = async () => {
//     if (!installPrompt) {
//         return;
//     }
//     const result = await installPrompt.prompt();
//     console.log(`Install prompt was: ${result.outcome}`);
//     installPrompt = null;
//     location.reload();
// };


let car = document.getElementById('car');
const moveCar = () => {
    let ct = 0, speed = 1;
    setInterval(() => {
        ct += speed;
        car.style.left = ` ${ct}%`;
        if (ct == 80 && speed > 0) { car.style.transform = 'rotateZ(15deg)'; speed /= 2; }
        if (ct == 10 && speed < 0) { car.style.transform = 'rotateY(180deg) rotateZ(15deg)'; speed /= 2; }
        if (ct == 95 && speed > 0) {
            car.style.transform = 'rotateY(180deg)';
            speed = -1;
        }
        if (ct == 0 && speed < 0) {
            car.style.transform = 'rotateY(0deg)';
            speed = 1;
        }
    }, 50);
}