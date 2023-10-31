let classId = null;
let tempShow = document.getElementById('temp');
let tempImg = document.getElementById('tempImg');
let shareForm = document.getElementById('shareForm');
let textArea = document.getElementById('text');

function handleFile(HTMLFileInput) {
    let fileList = HTMLFileInput.files;
    let shareFileSmall = document.getElementById('shareFileSmall');
    if (fileList.length) {
        shareFileSmall.innerHTML = 'Change File ';
        let file = fileList[0];
        document.getElementById('tempFileName').innerHTML = file.name;
        let fileType = getFileTypeByExtension(file.name);
        tempShow.style.display = 'block'
        if (fileType === 'Image') {
            let fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = (res) => {
                tempImg.src = res.target.result;
            }
        }
        else {
            switch (fileType) {
                case 'PDF':
                    tempImg.src = '/img/fileIcons/pdf.png';
                    break;
                case 'Excel':
                    tempImg.src = '/img/fileIcons/excel.png';
                    break;
                case 'PowerPoint':
                    tempImg.src = '/img/fileIcons/powerPoint.png';
                    break;
                case 'Word':
                    tempImg.src = '/img/fileIcons/word.png';
                    break;
                default:
                    tempImg.src = '/img/fileIcons/unknown.png';
                    break;
            }
        }
    }
    else {
        shareFileSmall.innerHTML = 'Select File ';
        tempShow.style.display = 'none';
    }
}


const cancelPreview = () => {
    shareForm.file.value = '';
    setTimeout(() => {
        handleFile(shareForm.file);
    }, 200);
}


shareForm.onsubmit = async (e) => {
    e.preventDefault();
    document.getElementById('sharePostBtn').innerHTML = '<i class="fas fa-spinner rotateMe"></i>'
    let data = {
        file: '',
        size: 0,
        text: textArea.innerHTML
    }
    if (e.target.file.files.length) {
        data.size = e.target.file.files[0].size;
        let resData = await uploadFile(e.target.file.files[0], '/saveFile');
        if (resData.success) {
            data.file = resData.file.filename
        }
        else {
            document.getElementById('popup').style.display = 'block';
            document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('location.reload()')}
                </div>
            `
            return;
        }
    }
    if (data.file === '' && (data.text === 'Write About Work Here...' || data.text === '')) {
        alert('Cannot Resolve Empty Requests!');
        document.getElementById('sharePostBtn').innerHTML = 'Post'
        return;
    }
    let resData = await myPost(`/class/classWork/add/${classId}`, data);
    if (resData.success) {
        location.reload();
    }
    else {
        document.getElementById('sharePostBtn').innerHTML = 'Post'
        document.getElementById('popup').style.display = 'block';
        document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('location.reload()')}
                </div>
            `
        return;
    }
}



window.onload = () => {
    classId = document.getElementById('classID').value;
    if (!classId) {
        alert("Class Not Exist!!");
        location.replace('/');
    }
    loadWork();
}

const loadWork = async () => {
    let pdiv = document.getElementsByClassName('classes')[0];
    pdiv.innerHTML = `
        <div style="padding-top:30px">
            <i class="fas fa-spinner rotateMe"></i>
            </div>
        `
    let data = await myGET(`/class/classWork/all/${classId}`);
    console.log(data);
    if (data.success) {
        pdiv.innerHTML = '';
        data.data.map(work => {
            pdiv.innerHTML += `<div class="post">
                    <div class="postWrapper">
                        <div class="postTop">
                            <div class="postTopLeft" onclick="location.href='/user/profile/${work.user._id}'">
                                <img class="postProfileImg" src='${work.user.profile ? work.user.profile : '/img/nouser.png'}' alt='user'>
                                <div class="div_post_left">
                                    <span class="postUsername">${work.user.username}</span>
                                    <div class="time">${formatTime(work.createdAt)}</div>
                                </div>
                            </div>
                        </div>
                        <hr>
                        <div class="postCenter">
                            <span class="postText">${work.text}</span>
                            ${loadFileURL(work.file)}
                        </div>
                        <div class="postBottom">
                            ${renderPostBottom(work.file, work.size)}
                            <button onclick="removeWork('${work._id}')" class="normalButton" style="background:red">Delete</button>
                        </div>
                    </div>
                </div>`
        })
    }
    else {
        pdiv.innerHTML = showSWrong('loadWork()');
    }
}

const removeWork = async(id) => {
    try {
        let val = confirm("This step cant be Undo!!");
        if (val) {
            await myGET(`/class/classWork/remove/${id}`);
            loadEbooks();
        }
    } catch (err) {
        loadWork();
    }
}

const fileTypeUrl = (file) => {
    let fileType = getFileTypeByExtension(file);
    if (fileType === 'Image') {
        return `/download/${file}`;
    }
    else {
        let fileUrl = '';
        switch (fileType) {
            case 'PDF':
                fileUrl = '/img/fileIcons/pdf.png';
                break;
            case 'Excel':
                fileUrl = '/img/fileIcons/excel.png';
                break;
            case 'PowerPoint':
                fileUrl = '/img/fileIcons/powerPoint.png';
                break;
            case 'Word':
                fileUrl = '/img/fileIcons/word.png';
                break;
            default:
                fileUrl = '/img/fileIcons/unknown.png';
                break;
        }
        return fileUrl;
    }
}

const loadFileURL = (file) => {
    if (file === '') return '';
    return `<img class='postImg' src='${fileTypeUrl(file)}' alt='Error While Loading...'></img>`
}

const renderPostBottom = (file, size) => {
    if (file === '') return '';
    else {
        return `<a class="normalButton" href='/download/${file}' target='__blank'>Download</a>
                <span class="post_size">Size: ${formatFileSize(size)}</span>`
    }
}

const removeEbook = async (id) => {
    try {
        let val = confirm("This step cant be Undo!!");
        if (val) {
            await myGET(`/class/ebook/remove/${id}`);
            loadEbooks();
        }
    } catch (err) {
        loadEbooks();
    }
}


//customize textArea

textArea.addEventListener('focus', (e) => {
    if (e.target.innerHTML === 'Write About Work Here...') {
        e.target.innerHTML = '';
    }
})
textArea.addEventListener('blur', (e) => {
    if (e.target.innerText.trim() === '') {
        e.target.innerHTML = 'Write About Work Here...';
    }
})