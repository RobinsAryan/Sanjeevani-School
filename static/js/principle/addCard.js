const showAddCard = () => {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML = `
    <div class="popup-form">
        <div class="hidePopUp" ><i onClick = "closePopup()" class="fa-solid fa-xmark"></i></div>
        <p style="margin-bottom:10px">Add a well croped Empty card Image</p>
        <form onreset = "resetForm(this)" onSubmit="handleSubmit(event)" id="fileUploadForm">
        <label for="file">
        <div>
        <img id="demoImg" src="/img/upload_img.png" alt="">
        </div>
        </label>
        <input onchange = "handleFile(this)" type="file" id="file" name="file" accept=".jpg, .png, .pdf" hidden ><br><br>
        <input type="text" id="className" name="title" placeholder="Card Title" required><br><br>
        <div>
        <button style="background:#ff4646;" type="reset">Reset</button>
        <button type="submit">Submit</button>
        </div>
        </form>
        </div>`
}
function handleFile(HTMLFileInput) {
    let fileList = HTMLFileInput.files;
    if (fileList.length) {
        let file = fileList[0];
        let fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = (event) => {
            document.getElementById('demoImg').src = event.target.result;
        }
    }
    else {
        document.getElementById('demoImg').src = '/img/upload_img.png';
    }
}

const resetForm = (HTMLFormInput) => {
    setTimeout(() => {
        handleFile(HTMLFormInput.file);
    }, 200);
}


const handleSubmit = async (e) => {
    e.preventDefault();
    document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
    let data = {
        card: null,
        title: e.target.title.value
    }
    if (e.target.file.files.length) {
        let image = new Image();
        let fileReader = new FileReader();
        fileReader.readAsDataURL(e.target.file.files[0]);
        fileReader.onload = (e2) => {
            image.src = e2.target.result;
            image.onload = async () => {
                console.log("hello");
                let resData = await uploadImage(e.target.file.files[0]);
                console.log(resData);

                if (resData.success) {
                    let res2 = await myGET(`/resizeCards?url=${resData.path}&height=${image.height}&width=${image.width}`);
                    if (res2.success) {
                        data.card = res2.url;
                    }
                    else {
                        closePopup();
                        page.innerHTML = showSWrong("showClasses()");
                        return;
                    }
                    resData = await myPost('/cards/preAdd', data);
                    if (resData.success) {
                        location.href = `/cards/create/${resData.cardId}`;
                    }
                    else {
                        closePopup();
                        page.innerHTML = showSWrong('showClasses()');
                    }
                }
                else {
                    closePopup();
                    page.innerHTML = showSWrong("showClasses()");
                    return;
                }
            }
        }
    }
    else {
        alert("select an Image");
        closePopup();
        return;
    }
}

window.onload = () => {
    loadCards();
}
let page = document.getElementsByClassName('classes')[0];
const loadCards = async () => {
    page.innerHTML = ` 
            <i class="fas fa-spinner rotateMe"></i> 
        `
    let data = await myGET('/cards/all');
    if (data.success) {
        data = data.data;
        console.log(data);
        page.innerHTML = ``
        data.forEach(card => {
            page.innerHTML += `<div class="card">
            <div class="cardImg">
            <div>
            <img src="${card.baseImg}" alt="">
            </div>
            </div>
            <p>${card.title}</p>
            <div class="cardBtn">
            <button onclick="showPrint('${card._id}')" class="normalButton">Print</button>
            <button onclick="deleteCard('${card._id}')" class="normalButton" style="background:red">Delete</button>
            </div>
            </div>
            `
        });
    }
    else {
        page.innerHTML = showSWrong('showClasses()');
    }
}

const deleteCard = async (id) => {
    try {
        let val = confirm("This step can't be UNDO!");
        if (val) {
            let resData = await myGET(`/cards/remove/${id}`);
            if (resData.success) {
                location.reload();
            }
            else {
                alert("Something Wrong!");
                location.reload();
            }
        }
    } catch (err) {
        alert("Something Wrong!");
        location.reload();
    }
}

const showPrint = async (id) => {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML =
        `<div class="loading_div">
        <div>Preparing File....</div>
        <i class="fas fa-spinner rotateMe" ></i> 
        </div >
    `
    try {
        let resData = await myGET(`/cards/print/all/${id}`)
        if (resData.success) {
            document.getElementById('popup').innerHTML = `
    <div class="popup-form"> 
            <p style="margin-bottom: 15px;">File Created!!</p>
           <div>
           <p style="font-size:12px;padding-bottom: 10px;">File Will be deleted in 5 mins</p>
           </div>
           <div>
           <button class="normalButton" style="background-color: red;" onclick="closePopup()" >Cancel</button>
            <a class="normalButton" href='/download/${resData.fileName}' target='__blank' >Download</a>
           </div>
        </div>
    `
        } else {
            document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('downloadIdcard()')}
                </div>
            `
        }
    } catch (err) {
        document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('downloadIdcard()')}
                </div>
            `
    }

}