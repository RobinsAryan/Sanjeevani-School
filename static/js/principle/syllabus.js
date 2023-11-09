let classId = null; 
window.onload = () => {
    classId = document.getElementById('classID').value;
    if (!classId) {
        alert("Class Not Exist!!");
        location.replace('/');
    } 
}


const uploadSyllabus = () => {
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
                <input onchange = "handleFile(this)" type="file" id="file" name="file" required hidden > 
                <br>
                <div style="    display: flex;
    text-align: center;
    justify-content: center;
    margin-bottom: 15px;
    align-items: center;">
                <input style="height: 20px;
    width: 20px;
    margin-right: 5px;" type="checkbox" required name="confirm" id="confirm"><span style="    font-size: 12px;
    color: gray;">I Know it will Replace old File</span>
                </div>
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



const handleSubmit = async (e) => {
    e.preventDefault();
    if (e.target.file.files.length == 0) {
        alert('Please Select a File');
        return;
    } 
    document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
    let data = { 
        size: e.target.file.files[0].size,
        url: 'nothing',
    }
    if (e.target.file.files.length) {
        let resData = await uploadFile(e.target.file.files[0], `/saveFile`);
        if (resData.success) {
            data.url = resData.file.filename
        }
        else {
            document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('uploadSyllabus()')}
                </div>
    `
            return;
        }
    }
    let resData = await myPost(`/class/syllabus/add/${classId}`, data);
    if (resData.success) {
        location.reload();
    }
    else {
        document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('uploadSyllabus()')}
                </div>
    `
    }
}