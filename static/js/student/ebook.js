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
    loadEbooks();
}


const loadEbooks = async () => {
    let pdiv = document.getElementById('ebooks');
    pdiv.innerHTML = ` 
            <i class="fas fa-spinner rotateMe"></i> 
        `
    let data = await myGET(`/class/ebooks/all/${classId}`);
    if (data.success) {
        pdiv.innerHTML = '';
        data.data.map(book => {
            pdiv.innerHTML += `<div class="class ebook">
                    <div class="ebookImg">
                        <img src='${loadFileURL(book.url)}' alt="">
                    </div>
                    <div class="ebookInfo">
                        <p>${book.title}</p>
                        <small>size: ${formatFileSize(book.size)}</small>
                        <a href='/download/${book.url}' target='__blank'>Download</a> 
                    </div>
                </div>`
        })
    }
    else {
        pdiv.innerHTML = showSWrong('loadEbooks()');
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
    if (file === '') return '/img/ebook.jpg';
    return fileTypeUrl(file);
}

const openUserProfile = () => {
    location.href = `/user/profile/${userId}`;
}