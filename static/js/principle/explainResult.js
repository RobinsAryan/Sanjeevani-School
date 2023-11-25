let classId = null, resultId = null;


let selectResult = document.getElementById('selectResult');
const loadResult = async () => {
    try {
        let resData = await myGET(`/class/result/single/${resultId}`);
        if (resData.success) {
            if (resData.data.length) {
                let data = resData.data[0];
                document.getElementById('resultInfo').innerHTML = `
                <p>Exam: ${data.title}</p>
                <span>Uploaded On: ${formatTime(data.createdAt)}</span>
                <span> (Maximum Marks: ${data.MM})</span>
                <i onclick="openEditName()" style="position: absolute;color: gray;" class="fas fa-edit"></i>
                `
                let data2 = {};
                data.result.map(item => {
                    let result = item.desc;
                    result = JSON.parse(result);
                    for (let key in result) {
                        if (key in data2) {
                            data2[key].push(result[key]);
                        } else data2[key] = [result[key]]
                    }
                })
                let marksData = {}, absentStudent = {}, standardDeviation = {};
                for (let key in data2) {
                    let total = 0, ct = 0, ab = 0, maxM = 0, minM = 100, finalMarks = [];
                    data2[key].forEach(mark => {
                        if (typeof (mark) === "number") {
                            total += mark; ct++;
                            maxM = Math.max(maxM, parseFloat(mark));
                            minM = Math.min(minM, parseFloat(mark));
                            finalMarks.push(parseFloat(mark));
                        }
                        else ab++;
                    });
                    if (ct) {
                        marksData[key] = { avg: parseFloat((total / ct).toFixed(2)), max: parseFloat(maxM), min: parseFloat(minM) };
                        standardDeviation[key] = calculateStandardDeviation(finalMarks);
                    } absentStudent[key] = ab;
                }
                plotLineGraph(marksData);
                plotPieGraph(standardDeviation);
                selectResult.innerHTML = `
                    <div class="perStudent" onclick="location.href='/class/result/students/${resultId}'">
                        <p>See Student Wise Result</p>
                        <span><i class="fas fa-chevron-right"></i></span>
                    </div>
                `
            } else {
                selectResult.innerHTML = 'Nothing to show Here!';
            }
        } else {
            selectResult.innerHTML = `
                ${showSWrong('loadSelectResult()')} 
            `
        }
    } catch (err) {
        console.log(err)
        selectResult.innerHTML = ` 
                ${showSWrong('loadSelectResult()')} 
            `
    }
}


const plotLineGraph = (data) => {
    let lineData = {
        labels: [],
        datasets: [
            {
                label: 'Minimum',
                fill: false,
                data: [],
            }, {
                label: 'Average',
                fill: false,
                borderDash: [2, 2],
                data: [],
                fill: true,
            }, {
                label: 'Maximum',
                data: [],
                fill: false
            }
        ]
    }
    for (let subject in data) {
        lineData.labels.push(subject);
        lineData.datasets[0].data.push(data[subject].min);
        lineData.datasets[1].data.push(data[subject].avg);
        lineData.datasets[2].data.push(data[subject].max);
    }
    document.getElementsByClassName('chart')[0].innerHTML = `<canvas id="myChart1"></canvas>`
    const ctx = document.getElementById('myChart1');
    new Chart(ctx, {
        type: 'line',
        data: lineData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: true
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Subjects'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Marks'
                    }
                }
            }
        },
    });
}


const plotPieGraph = (data) => {
    let lineData = {
        labels: [],
        datasets: [
            {
                label: 'Deviation',
                data: [],
            }
        ]
    }
    for (let subject in data) {
        lineData.labels.push(subject);
        lineData.datasets[0].data.push(data[subject]);
    }
    document.getElementsByClassName('chart')[1].innerHTML = `<canvas id="myChart2"></canvas>`
    const ctx = document.getElementById('myChart2');
    new Chart(ctx, {
        type: 'pie',
        data: lineData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        },
    });
}



function calculateStandardDeviation(marks) {
    const mean = marks.reduce((sum, mark) => sum + mark, 0) / marks.length;
    const squaredDifferences = marks.map(mark => Math.pow(mark - mean, 2));
    const meanSquaredDifferences = squaredDifferences.reduce((sum, squaredDiff) => sum + squaredDiff, 0) / marks.length;
    const standardDeviation = Math.sqrt(meanSquaredDifferences);
    return standardDeviation;
}





window.onload = () => {
    classId = document.getElementById('classID').value;
    resultId = document.getElementById('resultID').value;
    if (!classId) {
        alert("Class Not Exist!!");
        location.replace('/');
    }
    if (!resultId) {
        alert("Result Not Exist!!");
        location.replace('/');
    }
    setTimeout(() => {
        loadResult();
    }, 1000);
}


const openMeanGuide = () => {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML =
        `
            <div class="popup-form">
                <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
                <h3 style="color:#f85100;padding-bottom: 20px;">Mean of Marks</h3>
                <p>How we process Mean Data?</p>
                <p>The sum of the marks divided by the number of strudents</p>
                <img style="width:100%" src="/img/mean.png">
                <a href="https://en.wikipedia.org/wiki/Mean" target="__blank" class="normalButton" style="background:#0088aa">Know More</a>
                <button onclick='closePopup()'>Got it</button>
            </div>
        `
}
const openDeviationGuide = () => {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML =
        `
            <div class="popup-form">
                <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
                <h3 style="color:#f85100;padding-bottom: 20px;">Standard Deviation</h3>
                <p>How we process Deviation?</p>
                <p>Calculationing the Deviation from mean marks and square rooting</p>
                <img style="width:100%" src="/img/sd.png">
                <a href="https://en.wikipedia.org/wiki/Standard_deviation"  target="__blank" class="normalButton" style="background:#0088aa">Know More</a>
                <button onclick='closePopup()'>Got it</button>
            </div>
        `
}


const openEditName = () => {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML = `<div class="popup-form">
        <div class="hidePopUp" ><i onClick = "closePopup()" class="fa-solid fa-xmark"></i></div> 
            <form onSubmit="handleSubmitResult(event)" id="fileUploadForm">
                <input type="text" id="className" name="title" placeholder="New Result Name" required><br><br>
                <div>
                    <button style="background:#ff4646;" type="reset">Reset</button>
                    <button type="submit">Submit</button>
                </div>
            </form>
        </div>`
}

const handleSubmitResult = async (e) => {
    e.preventDefault();
    let newTitle = e.target.title.value;
    if (newTitle.length) {
        try {
            document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
            let resData = await myPost(`/class/result/update/resultName/${resultId}`, { title: newTitle })
            if (resData.success) {
                location.reload();
            } else {
                document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                    <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
                    ${showSWrong('openEditName()')}
                </div>`
            }
        } catch (err) {
            document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                    <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
                    ${showSWrong('openEditName()')}
                </div>`
        }
    }
    else closePopup();
}


const showDeleteResult = () => {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML = `
        <div class="popup-form">
        <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
            <h2 style="font-size:15px;margin-bottom:20px">This Step cant be Undo</h2>
            <p style="font-size:12px">Deleting this Result lead to remove all instance of this result from each student it contain.</p>
            <button onclick="removeResult()" style="background:#f07979">Remove</button>
        </div>
    `
}

const removeResult = async () => {
    document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
    let data = await myGET(`/class/result/remove/${resultId}`)
    if (data.success) {
        location.replace('/')
    } else {
        document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                    <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
                    ${showSWrong('showDeleteResult()')}
                </div>`
    }
}