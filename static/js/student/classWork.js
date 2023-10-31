let userId = null, classId = null;
window.onload = () => {
    userId = document.getElementById('userId').value;
    if (!userId) {
        alert("User Not Exist!!");
        location.replace('/');
    }
    classId = document.getElementById('classId').value;
    if (!classId) {
        alert("Class Not Exist!!");
        location.replace('/');
    }
    loadWork();
}



const loadWork = async () => {
    let pdiv = document.getElementById('ebooks');
    pdiv.innerHTML = `
        <div style="padding-top:30px">
            <i class="fas fa-spinner rotateMe"></i>
            </div>
        `
    let data = await myGET(`/class/classWork/all/${classId}`); 
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
                        </div>
                    </div>
                </div>`
        })
    }
    else {
        pdiv.innerHTML = showSWrong('loadWork()');
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