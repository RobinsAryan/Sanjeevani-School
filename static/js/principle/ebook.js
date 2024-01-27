let classId = null;
const addEbook = () => {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML = `
    <div class="popup-form">
           <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
            <form onreset="resetForm(this)" onSubmit="handleSubmit(event)" id="fileUploadForm">
                 <label for="file">
                    <div>
                        <img id="demoImg" src="/img/fileUpload.png" alt="">
                    </div>
                </label>
                    <p id="tempFileName"></p>
                <input onchange = "handleFile(this)" type="file" id="file" name="file" hidden ><br><br> 
                <input type="text" id="title" name="title" placeholder="Title" required><br>
                <br>
                <div>
                    <button style="background:#ff4646;" type="reset">Reset</button>
                    <button type="submit">Submit</button>
                </div>
            </form>
        </div>
    `
}


function handleFile(HTMLFileInput) {
    let fileList = HTMLFileInput.files;
    let tempImg = document.getElementById('demoImg');
    let tempFileName = document.getElementById('tempFileName');
    if (fileList.length) {
        let file = fileList[0];
        tempFileName.innerHTML = file.name;
        let fileType = getFileTypeByExtension(file.name);
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
        tempFileName.innerHTML = '';
        tempImg.src = '/img/fileUpload.png';
    }
}

const resetForm = (HTMLFormInput) => {
    setTimeout(() => {
        handleFile(HTMLFormInput.file);
    }, 200);
}
let toggleUpload;
const handleSubmit = async (e) => {
    e.preventDefault();
    if (e.target.file.files.length == 0) {
        alert('Please Select a File');
        return;
    }
    document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
    let data = {
        title: e.target.title.value,
        size: e.target.file.files[0].size,
        url: 'nothing',
    }
    if (e.target.file.files.length) {
        document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                    <progress style="width: 60%;" id="progress" max="100" value="0">32%</progress>
                     <div style="font-size: 11px; color: gray; display: flex; justify-content: space-around;">
                        <span><span id="time">20</span></span>
                        <span><span id="speed">400</span>/s</span>
                    </div>
                    <div>
                        <button onclick="toggleUpload()" id="uploadToggleButton" style="background:red" class="normalButton">Pause</button>
                    </div>
                </div>
            `
        let paused = 0;
        toggleUpload = () => {
            let isChanged = mainToggleUpload(paused);
            if (isChanged) {
                let btn = document.getElementById('uploadToggleButton');
                if (paused) {
                    btn.innerText = 'Pause';
                    btn.style.background = 'red'
                    paused = 0;
                } else {
                    btn.innerText = 'Resume';
                    btn.style.background = '#00a600'
                    paused = 1;
                }
            }
        }
        let onprogress = (e) => {
            document.getElementById('progress').value = e.progress;
            document.getElementById('time').innerText = uploadTimeFormat(e.time);
            document.getElementById('speed').innerText = formatFileSize(e.speed);
        }
        let resData = await uploadFileChunk(e.target.file.files[0], [onprogress]);
        if (resData.success) {
            data.url = resData.info.file;
        }
        else {
            document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('addEbook()')}
                </div>
    `
            return;
        }
    }
    let resData = await myPost(`/class/ebook/add/${classId}`, data);
    if (resData.success) {
        location.reload();
    }
    else {
        document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('addEbook()')}
                </div>
    `
    }
}



window.onload = () => {
    classId = document.getElementById('classID').value;
    if (!classId) {
        alert("Class Not Exist!!");
        location.replace('/');
    }
    loadEbooks();
}

const loadEbooks = async () => {
    let pdiv = document.getElementsByClassName('classes')[0];
    pdiv.innerHTML = `
        <div style="padding-top:30px">
            <i class="fas fa-spinner rotateMe"></i>
            </div>
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
                        <span style="background-color:red" onclick="removeEbook('${book._id}')">Delete</span>
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