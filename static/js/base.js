let slide = document.getElementsByClassName('slides')[0];
let paperPrev = document.getElementsByClassName('paperPrev')[0];
let paperNext = document.getElementsByClassName('paperNext')[0];
let sliderDots = document.getElementsByClassName('mainSlider')[0];
let slideNumber = 0;
const slideData = [
    {
        img: "img/hero.jpg",
        h1: "Welcome To School",
        color1: '#fca8fa',
        color2: '#d47fd1',
        button_text: "Get Started",
    },
    {
        img: "img/hero2.jpg",
        h1: "Some Text Page 2",
        color1: 'rgb(180 229 244)',
        color2: 'rgb(122 212 239)',
        button_text: "Next",
    },
    {
        img: "img/hero3.jpg",
        h1: "Some Text Page 3",
        color1: 'rgb(190 216 255)',
        color2: 'rgb(0 125 254)',
        button_text: "Next",
    },
    {
        img: "img/hero4.jpg",
        h1: "Login to Continue",
        color1: 'rgb(253 199 203)',
        color2: 'rgb(255 79 90)',
        button_text: "Login",
    },
]
const nextSlide = () => {
    if (slideNumber == 3) {
        document.getElementsByClassName('page_load_slider')[0].style.right = '0';
        setTimeout(() => {
            location.replace('/login');
        }, 500);
    }
    loadSlide(++slideNumber, 1);
}
const backSlide = () => {
    loadSlide(--slideNumber, -1);
}

const skipToFinal = () => {
    slideNumber = 3;
    loadSlide(3, 1);
}

const loadSlide = (num, dir) => {
    if (num >= 4) {
        num = 0;
        slideNumber = 0;
    }
    if (slideNumber < 0) {
        num = 3;
        slideNumber = 3;
    }
    if (dir == 0) {
        paperPrev.style.left = '-100%';
        paperNext.style.left = '100%';
    }
    else if (dir == 1) {
        paperNext.style.left = 0;
    }
    else {
        paperPrev.style.left = 0;
    }
    setTimeout(() => {
        Array.from(sliderDots.children).forEach(dot => { dot.style.background = 'transparent'; dot.classList.remove('active') });
        sliderDots.children[num].classList.add('active');
        sliderDots.children[num].style.background = slideData[num].color2;
        slide.children[0].children[0].src = slideData[num].img;
        slide.children[1].children[0].innerHTML = slideData[num].h1;
        document.getElementsByClassName('NextBtn')[0].style.background = `linear-gradient(90deg, ${slideData[num].color1}, ${slideData[num].color2})`
        document.getElementsByClassName('NextBtn')[0].innerHTML = slideData[num].button_text;
        document.getElementsByClassName('skip')[0].children[0].style.background = slideData[num].color2;
        if (num == 3) {
            document.getElementsByClassName('skip')[0].children[0].style.visibility = 'hidden'
        }
        slide.children[0].children[0].onload = () => {
            if (dir == 1) {
                paperNext.style.left = '-100%';
                setTimeout(() => {
                    paperNext.style.display = 'none';
                    paperNext.style.left = '100%';
                    setTimeout(() => {
                        paperNext.style.display = 'block';
                    }, 500);
                }, 500);
            }
            else if (dir == -1) {
                paperPrev.style.left = '100%';
                setTimeout(() => {
                    paperPrev.style.display = 'none';
                    paperPrev.style.left = '-100%';
                    setTimeout(() => {
                        paperPrev.style.display = 'block';
                    }, 500);
                }, 500);
            }
        }
    }, 500);
}

window.onload = () => {
    loadSlide(slideNumber, 0);
}


let flag = 1;

let startX = null;
slide.addEventListener('touchstart', (event) => {
    startX = event.touches[0].clientX;
});

slide.addEventListener('touchmove', (event) => {
    if (startX) {
        let currentX = event.touches[0].clientX;
        let deltaX = currentX - startX;
        if (flag && deltaX < -80) {
            nextSlide();
            flag = 0;
            setTimeout(() => {
                flag = 1;
            }, 1000);
        }

        if (flag && deltaX > 80) {
            backSlide();
            flag = 0;
            setTimeout(() => {
                flag = 1;
            }, 1000);
        }
    }
});





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



// const registerServiceWorker = async () => {
//     if ('serviceWorker' in navigator) {
//         try {
//             const registration = await navigator.serviceWorker.register(
//                 '/sw.js',
//             );
//             if (registration.installing) {
//                 console.log('Service worker installing');
//             } else if (registration.waiting) {
//                 console.log('Service worker installed');
//             } else if (registration.active) {
//                 console.log('Service worker active');
//             }
//         } catch (error) {
//             console.error(`Registration failed with ${error}`);
//         }
//     }
// };
// registerServiceWorker();






// if ('serviceWorker' in navigator && 'Notification' in window) {

//     navigator.serviceWorker.register('/sw.js')
//         .then((registration) => {
//             // console.log('Service Worker registered with scope:', registration.scope);

//             // Notification.requestPermission()
//             //     .then((permission) => {
//             //         if (permission === 'granted') { 
//             //             console.log('Notification permission granted');
//             //         } else if (permission === 'denied') {
//             //             console.log('Notification permission denied');
//             //         } else if (permission === 'default') {
//             //             console.log('Notification permission dismissed');
//             //         }
//             //     });
//             document.getElementById('subscribeButton').addEventListener('click', subscribeToPush);
//         })
//         .catch((error) => {
//             console.error('Service Worker registration failed:', error);
//         });
// }


// const PublicKey = 'BMTUJwXpovugSRpuXdZjlS0XhNclQFIER9LcXVemxQSi8hLX3US6-2Eg0Sow74qtHnH_x3FS8yUl3NmCsdlosx8'


 

// async function subscribeToPush() {
//     try {
//         // Request permission to show push notifications
//         const permission = await Notification.requestPermission();

//         if (permission === 'granted') {
//             // Get the service worker registration
//             const registration = await navigator.serviceWorker.ready;

//             // Subscribe to push notifications
//             const subscription = await registration.pushManager.subscribe({
//                 userVisibleOnly: true,
//                 applicationServerKey: urlBase64ToUint8Array(PublicKey)
//             });
            

//             // Send the subscription to the server
//             await fetch('/subscribe', {
//                 method: 'POST',
//                 body: JSON.stringify(subscription),
//                 headers: {
//                     'Content-Type': 'application/json'
//                 }
//             });

//             console.log('Subscribed to push notifications');
//         }
//     } catch (error) {
//         console.error('Error subscribing to push notifications:', error);
//     }
// }

// function urlBase64ToUint8Array(base64String) {
//     const padding = '='.repeat((4 - base64String.length % 4) % 4);
//     const base64 = (base64String + padding)
//         .replace(/-/g, '+')
//         .replace(/_/g, '/');
//     const rawData = window.atob(base64);
//     const outputArray = new Uint8Array(rawData.length);

//     for (let i = 0; i < rawData.length; i++) {
//         outputArray[i] = rawData.charCodeAt(i);
//     }
//     return outputArray;
// }

 