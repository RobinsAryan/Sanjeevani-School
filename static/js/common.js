function closePopup() {
    document.getElementById('popup').style.display = 'none';
    document.getElementById('popup').innerHTML = ``;
}


const myGET = (url) => {
    return new Promise(async (Resolve, Reject) => {
        try {
            var request = {
                "url": url,
                "method": "GET",
                timeout: 15000
            }
            $.ajax(request).done(function (response) {
                Resolve(response);
            }).fail(() => {
                Resolve({ success: false });
            })
        } catch (err) {
            Resolve({ success: false });
        }
    })
}

const myPost = (url, data) => {
    return new Promise(async (Resolve, Reject) => {
        try {
            var request = {
                "url": url,
                "method": "POST",
                "data": JSON.stringify(data),
                contentType: "application/json",
                timeout: 60000
            }
            $.ajax(request).done(function (response) {
                Resolve(response);
            }).fail(() => {
                Resolve({ success: false });
            })
        } catch (err) {
            Resolve({ success: false });
        }
    })
}


const uploadImage = (image) => {
    return new Promise(async (resolve, reject) => {
        try {
            let formData = new FormData();
            formData.append('image', image);
            var request = {
                "url": '/uploadImage',
                "method": "POST",
                "data": formData,
                "processData": false,
                "contentType": false,
            }
            $.ajax(request).done(function (response) {
                resolve(response);
            }).fail(() => {
                resolve({ success: false });
            })
        } catch (err) {
            resolve({ success: false });
        }
    })
}


const uploadFile = (file, url) => {
    return new Promise(async (resolve, reject) => {
        try {
            let formData = new FormData();
            formData.append('file', file);
            var request = {
                "url": url,
                "method": "POST",
                "data": formData,
                "processData": false,
                "contentType": false,
            }
            $.ajax(request).done(function (response) {
                resolve(response);
            }).fail(() => {
                resolve({ success: false });
            })
        } catch (err) {
            resolve({ success: false });
        }
    })
}


let mainToggleUpload;
const uploadFileChunk = async (file, functions) => {
    return new Promise(async (resolve, reject) => {
        try {
            let loader = new LoadStream();
            let info = await loader.upload(file);
            loader.onprogress = functions[0]
            mainToggleUpload = (paused) => {
                if (paused) {
                    return loader.resume();
                }
                else return loader.stop();
            }
            loader.onload = () => {
                resolve(info);
            }
        } catch (err) {
            resolve({ success: false });
        }
    })
}




const showSWrong = (f) => {
    return `<div>
            <div class='sWrongImg'>
                <img src="/img/swrong.png" alt="somthing went wrong" />
                <p>Something Wrong</p>
            </div>
            <div class="sWrongRefresh">
                <button onClick="${f}">Try Again</button>
            </div>
            <ul class="sWrongInfo"> 
                <span>Possible Diagnosis</span> 
                <li>Check Your Internet Connection</li>
                <li>Config Your Proxy Settings</li>
                <li>Try Later</li>
            </ul>
        </div>
        `
}


function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + " bytes";
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + " KB";
    } else if (bytes < 1024 * 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    } else if (bytes < 1024 * 1024 * 1024 * 1024) {
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    } else {
        return (bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2) + " TB";
    }
}


function uploadTimeFormat(seconds) {
    if (seconds < 60) {
        return seconds.toFixed(2) + " s";
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = (seconds % 60).toFixed(2);
        return `${minutes}:${remainingSeconds} m`;
    } else if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        const remainingMinutes = Math.floor((seconds % 3600) / 60);
        return `${hours}:${remainingMinutes} h`;
    } else {
        const days = Math.floor(seconds / 86400);
        const remainingHours = Math.floor((seconds % 86400) / 3600);
        return `${days}:${remainingHours} d`;
    }
}


function getFileTypeByExtension(fileName) {
    const fileExtension = fileName.split('.').pop().toLowerCase();
    const fileTypeMapping = {
        pdf: 'PDF',
        jpg: 'Image',
        jpeg: 'Image',
        png: 'Image',
        gif: 'Image',
        webp: 'Image',
        xls: 'Excel',
        xlsx: 'Excel',
        ppt: 'PowerPoint',
        pptx: 'PowerPoint',
        doc: 'Word',
        docx: 'Word',
    };
    if (fileTypeMapping[fileExtension]) {
        return fileTypeMapping[fileExtension];
    } else {
        return 'Unknown';
    }
}


const formatTime = (time) => {
    if (time === '' || !time) return 'A long Time Ago.'
    const istDate = new Date(time);
    // const istDate = new Date(utcDate.getTime() + (5 * 60 + 30) * 60000); 
    const istYear = istDate.getFullYear();
    const istMonth = istDate.toLocaleString('default', { month: 'short' });
    const istDay = istDate.getDate();
    const istHours = istDate.getHours();
    const istMinutes = istDate.getMinutes();
    const formattedTime = `${istHours.toString().padStart(2, '0')}:${istMinutes.toString().padStart(2, '0')}`;

    const formattedDateString = `${formattedTime} of ${istDay} ${istMonth} ${istYear}`;

    return formattedDateString;
}

let isVibrationAvalible = ('vibrate' in navigator);
const vibrate = {
    warning: () => {
        if (isVibrationAvalible) {
            const pattern = [200, 100, 200];
            navigator.vibrate(pattern);
        }
    },
    success: () => {
        if (isVibrationAvalible) {
            const pattern = [100, 100, 100];
            navigator.vibrate(pattern);
        }
    },
    failure: () => {
        if (isVibrationAvalible) {
            const pattern = [400, 200, 400];
            navigator.vibrate(pattern);
        }
    },
    confirm: () => {
        if (isVibrationAvalible) {
            const pattern = [100, 300, 100, 300];
            navigator.vibrate(pattern);
        }
    },
    info: () => {
        if (isVibrationAvalible) {
            const pattern = [100, 200, 100, 200];
            navigator.vibrate(pattern);
        }
    },
    touch: () => {
        if (isVibrationAvalible) {
            const pattern = [100];
            navigator.vibrate(pattern);
        }
    },
    custom: (pattern) => {
        if (isVibrationAvalible) {
            navigator.vibrate(pattern);
        }
    }
};