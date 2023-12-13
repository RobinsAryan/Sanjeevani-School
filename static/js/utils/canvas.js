let cardData = null, studentData = null;


let previewImage = document.getElementById('pImage');
let canvas1 = document.getElementById('p1');
let canvas2 = document.getElementById('p2');
let ctx1 = canvas1.getContext('2d');
let ctx2 = canvas2.getContext('2d');
let ImageElement = new Image();
let sampleInfo = document.getElementsByClassName('sampleInfo')[0];
let mapdata = {};
window.onload = () => {
    cardData = document.getElementById('cardData').value;
    cardData = JSON.parse(cardData);
    ImageElement.src = cardData.baseImg;


    studentData = document.getElementById('studentData').value;
    studentData = JSON.parse(studentData);
    for (let key in studentData) {
        if (key == 'profile') {
            sampleInfo.innerHTML += `<li value="profile">${mapInfo[key]} <span><img src="/${studentData[key]}" alt=""></span> </li>`;
            mapdata[key] = {
                type: 'img',
                val: studentData[key]
            }
        } else {
            sampleInfo.innerHTML += `<li value="${key}">${mapInfo[key]} <span>${studentData[key]}</span></li>`
            mapdata[key] = {
                type: 'text',
                val: studentData[key]
            }
        }
    }


    if (!('profile' in studentData)) {
        sampleInfo.innerHTML += `<li value="profile">Profile <span><img src="/img/me.jpg" alt=""></span> </li>`;
        mapdata['profile'] = {
            type: 'img',
            val: '/img/me.jpg'
        }
    }


    Array.from(sampleInfo.children).forEach(child => {
        child.addEventListener('click', (e) => {
            Array.from(sampleInfo.children).forEach(item => item.classList.remove('active'))
            child.classList.add('active');
            data.info = child.getAttribute('value');
        });
    })
}
let ref, isInsideP1 = false;
ImageElement.onload = () => {
    canvas1.height = ImageElement.height;
    canvas1.width = ImageElement.width;
    ctx1.drawImage(ImageElement, 0, 0, canvas1.width, canvas1.height);
    ref = canvas1.getBoundingClientRect();

    canvas2.height = canvas1.height
    canvas2.width = canvas1.width; 
    ctx2.drawImage(ImageElement, 0, 0, canvas1.width, canvas1.height);
}

let isSelect = false;
let coordinates = { x1: 0, x2: 0, y1: 0, y2: 0 };
let mouseCoordinate = { x: 0, y: 0 };
p1.addEventListener('mousemove', e => {
    mouseCoordinate.x = e.clientX;
    mouseCoordinate.y = e.clientY;
    if (isSelect) {
        coordinates.x2 = mouseCoordinate.x - ref.x + window.scrollX;
        coordinates.y2 = mouseCoordinate.y - ref.y + window.scrollY;
        drawArea();
    }
})
document.addEventListener('keydown', (e) => {
    if (e.keyCode == 17 && data.info != 'none') {
        if (isInsideP1) {
            if (!isSelect) {
                coordinates.x1 = mouseCoordinate.x - ref.x + window.scrollX;
                coordinates.y1 = mouseCoordinate.y - ref.y + window.scrollY;
            }
            isSelect = true;
        }
    }
    if (e.keyCode == 90) {
        finalPaints.pop();
        putObjects();
        loadPreview();
    }
})
document.addEventListener('keyup', (e) => {
    if (e.keyCode == 17) {
        if (isInsideP1) {
            if (data.shpae == 'r') {
                if (dis(coordinates) > 10)
                    finalPaints.push({ shape: 'Rectangle', ...coordinates, fillStyle: 'green', property: data.info, ...fontStyle });
            }
            else if (data.shpae == 'c') {
                if (dis(coordinates) > 5)
                    finalPaints.push({ shape: 'Circle', ...coordinates, fillStyle: 'green', property: data.info });
            }
        }
        isSelect = false;
        loadPreview();
    }
})
let finalPaints = [];

const drawArea = () => {
    ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
    putObjects();
    if (data.shpae == 'r') {
        drawRect({ ...coordinates, fillStyle: 'red' });
    }
    else if (data.shpae == 'c')
        drawCircle({ ...coordinates, fillStyle: 'red' });
}

const putObjects = () => {
    ctx1.drawImage(ImageElement, 0, 0, canvas1.width, canvas1.height);
    finalPaints.forEach((object) => {
        if (object.shape == 'Rectangle') {
            drawRect(object);
        }
        else if (object.shape == 'Circle') {
            drawCircle(object);
        }
    })
}

const drawRect = (prop) => {
    ctx1.beginPath();
    ctx1.rect(Math.min(prop.x1, prop.x2), Math.min(prop.y1, prop.y2), Math.abs(prop.x1 - prop.x2), Math.abs(prop.y1 - prop.y2));
    ctx1.fillStyle = prop.fillStyle;
    ctx1.fill();
}

const drawCircle = (prop) => {
    ctx1.beginPath();
    ctx1.arc(prop.x2, prop.y2, dis(prop), 0, 2 * Math.PI, false);
    ctx1.fillStyle = prop.fillStyle;
    ctx1.fill();
}

function dis(prop) {
    return Math.floor(Math.sqrt(Math.pow(Math.abs(prop.x1 - prop.x2), 2) + Math.pow(Math.abs(prop.y1 - prop.y2), 2)));
}

const loadPreview = () => {
    ctx2.clearRect(0, 0, canvas1.width, canvas1.height);
    ctx2.drawImage(ImageElement, 0, 0, canvas1.width, canvas1.height);
    finalPaints.forEach((object) => {
        let val = mapdata[object.property];
        if (val.type == 'img') {
            let image = new Image();
            image.src = val.val;
            image.onload = () => {
                let height = Math.abs(object.y1 - object.y2);
                let width = Math.abs(object.x1 - object.x2);
                ctx2.drawImage(image, Math.min(object.x1, object.x2), Math.min(object.y1, object.y2), width, height)
            }
        } else if (val.type == 'text') {
            if (object.fontSize == 'auto')
                ctx2.font = `${Math.abs(object.y1 - object.y2)}px ${object.fontFamily}`;
            else
                ctx2.font = `${object.fontSize}px ${object.fontFamily}`;
            ctx2.fillText(val.val, Math.min(object.x1, object.x2), Math.max(object.y1, object.y2));
        }
    })
}

let fontStyle = {
    fontSize: 'auto',
    fontFamily: 'none',
}
let textSample = document.getElementById('textSample');
handleFontSizeChange = (ele) => {
    textSample.style.fontSize = `${ele.value}px`;
    fontStyle.fontSize = ele.value;
}
handleFontTypeChange = (ele) => {
    textSample.style.fontFamily = ele.value;
    fontStyle.fontFamily = ele.value;
}

const submit = async () => {
    console.log({ finalPaints });
    let resData = await myPost(`/cards/finalAdd/${cardData._id}`, { finalPaints });
    if (resData.success) {
        location.href = '/cards';
    }
    else {
        alert('something Wrong!!');
        location.reload();
    }
}


canvas1.addEventListener('mouseenter', (e) => isInsideP1 = true)
canvas1.addEventListener('mouseleave', (e) => isInsideP1 = false)