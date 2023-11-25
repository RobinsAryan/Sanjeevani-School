let classId = null;
const showUploadResult = () => {
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
                <input type="text" id="title" name="title" placeholder="Exam Name" required><br>
                <br>
                <input type="number" min="1" max="100" id="password" name="MM" placeholder="Maximum Marks" required><br>
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
        tempImg.src = '/img/fileIcons/excel.png';
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
        title: e.target.title.value,
        MM: e.target.MM.value,
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
                ${showSWrong('showUploadResult()')}
                </div>
    `
            return;
        }
    }
    let resData = await myPost(`/class/result/upload/${classId}`, data);
    if (resData.success) {
        if (resData.uploaded) {
            location.reload();
        } else {
            document.getElementById('popup').innerHTML =
                `
            <div class="popup-form">
                <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
                <h3 style="color:#f85100;padding-bottom: 20px;">Expected Error!!!</h3>
                ${formatError(resData.data)}
                <button onclick='showUploadResult();loadStudents()'>Retry</button>
            </div>
        `
        }
    }
    else {
        document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
                ${showSWrong('showUploadResult()')}
                </div>
    `
    }
}

const formatError = (data) => {
    console.log(data);
    let subComp = (id, reasone) => {
        console.log(id)
        console.log(reasone)
        return `<div style="text-align: left;
    margin: 5px 0;
    border: 1px solid #b1b1b1;
    border-radius: 5px;
    padding: 2px 5px;">
                        <p style="font-size: 15px;">Reg. Id: ${id}</p>
                        <span style="font-size: 12px;
    color: gray;">Reasone: ${reasone}</span>
                   </div>`}
    let response = `<div class="uploadErrors">`;
    data.map(item => {
        response +=
            subComp(item.rid, item.reasone)
    })
    response += '</div>'
    return response;
}

window.onload = () => {
    classId = document.getElementById('classID').value;
    if (!classId) {
        alert("Class Not Exist!!");
        location.replace('/');
    }
}

let selectResult = document.getElementById('selectResult');
const loadSelectResult = async () => {
    selectResult.innerHTML = ' <i class="fas fa-spinner rotateMe"></i>  '
    try {
        let resData = await myGET(`/class/result/all/${classId}`);
        if (resData.success) {
            if (resData.data.length) {
                selectResult.innerHTML = ''
                resData.data.map(item => {
                    selectResult.innerHTML += `
                    <div class="resultItem" onclick="location.href='/class/explainResult/${item._id}/${classId}'">
                        <p>${item.title}</p>
                        <span>Uploaded On: ${formatTime(item.createdAt)}</span>
                        <div><i class="fas fa-chevron-right"></i></div>
                    </div>
                   `
                })
            } else {
                selectResult.innerHTML = 'Nothing to show Here!';
            }
        } else {
            selectResult.innerHTML = ` 
                ${showSWrong('loadSelectResult()')} 
            `
        }
    } catch (err) {
        selectResult.innerHTML = ` 
                ${showSWrong('loadSelectResult()')} 
            `
    }
}