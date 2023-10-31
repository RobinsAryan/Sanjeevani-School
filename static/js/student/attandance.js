let userId = null, calThemeNo = -1;
const loadAttandance = async () => {
    try {
        document.getElementsByClassName('chart')[0].innerHTML = ' <i class="fas fa-spinner rotateMe"></i> '
        document.getElementById('caleandar').innerHTML = ''
        document.getElementById('btn1').style.display = 'none';
        document.getElementById('btn2').style.display = 'none';
        document.getElementById('popup').style.display = 'none';
        let resData = await myGET(`/student/attandanceJson/${userId}`)
        console.log(resData)
        if (resData.success) {
            let totalPresent = 0, totalAbsent = 0, total = resData.data.length;
            resData.data.forEach(date => {
                if (date.status) totalPresent++;
                else totalAbsent++;
            });
            document.getElementById('tp').innerHTML = totalPresent;
            document.getElementById('ta').innerHTML = totalAbsent;
            document.getElementsByClassName('chart')[0].innerHTML = ` <span>Attandance</span><canvas id="myChart"></canvas>`
            const ctx = document.getElementById('myChart');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        label: 'Attandance %',
                        data: [(totalPresent / total).toFixed(2) * 100, (totalAbsent / total).toFixed(2) * 100],
                        backgroundColor: [
                            '#16FF00',
                            'rgb(224 59 59)'
                        ],
                        hoverOffset: 20
                    }]
                }
            });
            var events = [];
            for (let i = 0; i < resData.data.length; i++) {
                let tdate = new Date(resData.data[i].date);
                events.push({
                    'Date': new Date(`${tdate.getFullYear()}, ${tdate.getMonth() + 1}, ${tdate.getDate()}`),
                    Title: resData.data[i].status ? "Present" : "Absent"
                })
            }
            var settings = {};
            var element = document.getElementById('caleandar');
            caleandar(element, events, settings);
            document.getElementById('btn1').style.display = 'initial';
            document.getElementById('btn2').style.display = 'initial';
            loadCalBtns();

        } else {
            document.getElementById('popup').style.display = 'block';
            document.getElementById('popup').innerHTML = `
                <div class="popup-form"> 
                ${showSWrong('loadAttandance()')}
                </div>
            `
            document.getElementsByClassName('chart')[0].innerHTML=''
        }
    } catch (err) {
        console.log(err);
        document.getElementById('popup').style.display = 'block';
        document.getElementById('popup').innerHTML = `
                <div class="popup-form"> 
                ${showSWrong('loadAttandance()')}
                </div>
            `
        document.getElementsByClassName('chart')[0].innerHTML=''
    }
}
window.onload = () => {
    userId = document.getElementById('userId').value;
    if (!userId) {
        alert("Class Not Exist!!");
        location.replace('/');
    }
    loadAttandance();
}


let caleandarBGJson = [
    {
        bg: '/img/cal_bg.jpg',
        btn1: '#fcfcfc',
        btn2: '#fafafa'
    },
    {
        bg: '/img/cal_bg2.jpg',
        btn1: '#fafbfd',
        btn2: '#f3f5f7'
    },
    {
        bg: '/img/cal_bg3.jpg',
        btn1: '#f7f7f7',
        btn2: '#fdfdfd'
    },
    {
        bg: '/img/cal_bg4.jpg',
        btn1: '#92c5df',
        btn2: '#8cc0de'
    },
    {
        bg: '/img/cal_bg5.jpg',
        btn1: '#fafafa',
        btn2: '#afa8a6'
    },
    {
        bg: '/img/cal_bg6.jpg',
        btn1: '#dfdfa7',
        btn2: '#afc4e3'
    },
]

const setCalBG = (data) => {
    document.getElementById('caleandar').style.background = `url(${data.bg})`;
    document.getElementById('btn1').style.background = data.btn1;
    document.getElementById('btn2').style.background = data.btn2;
}

const loadCalBtns = () => {
    let data = localStorage.getItem('calThemeNo');
    if (data) {
        calThemeNo = JSON.parse(data);
    }
    else {
        calThemeNo = Math.floor(Math.random() * 6);
    }
    setCalBG(caleandarBGJson[calThemeNo]);
}

const fixCalTheme = () => {
    localStorage.removeItem('calThemeNo');
    localStorage.setItem('calThemeNo', calThemeNo.toString());
}

const changeCalTheme = () => {
    localStorage.removeItem('calThemeNo');
    loadCalBtns();
}

const openUserProfile = () => {
    location.href = `/user/profile/${userId}`;
}