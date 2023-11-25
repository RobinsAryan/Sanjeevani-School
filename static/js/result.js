let userId = null, resultId = null, MM = 0, originalMarks = {};

window.onload = () => {
    userId = document.getElementById('userId').value;
    resultId = document.getElementById('resultId').value;
    MM = document.getElementById('MM').value;
    if (!userId) {
        alert("User Not Exist!!");
        location.replace('/');
    }
    if (!resultId) {
        alert("Result Not Exist!!");
        location.replace('/');
    }
    loadResult();
}

const openUserProfile = () => {
    location.href = `/user/profile/${userId}`;
}


const loadResult = async () => {
    let mainResult = document.getElementById('mainResult');
    try {
        let resData = await myGET(`/class/result/single/${resultId}/${userId}`)
        if (resData.success) {
            originalMarks = resData.data;
            mainResult.innerHTML = createTable(originalMarks);
            plotPieGraph(originalMarks);
        } else {
            mainResult.innerHTML = ` ${showSWrong('loadResult()')}`;
        }
    } catch (err) {
        console.log(err)
        mainResult.innerHTML = ` ${showSWrong('loadResult()')}`;
    }
}

const createTable = (data) => {
    let val = `<table>
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Marks</th> 
                            <th>M.M.</th> 
                        </tr>
                    </thead>
                    <tbody id="tableContent">`
    let total = 0;
    for (let subject in data) {
        if (typeof (data[subject]) == "number") { total += data[subject] }
        val += `<tr>
                            <td>${subject}</td>
                            <td ${marksColor(data[subject])}>${data[subject]}</td> 
                            <td>${MM}</td> 
                        </tr>`
    }
    val += `<tr style="font-weight:bold">
                                        <td>Total</td>
                                        <td>${total}</td>
                                        <td>${MM * Object.keys(data).length}</td>
                                    </tr>`
    val += `
                    </tbody>
                </table>`

    return val;
}

const marksColor = (val) => { return typeof (val) == "number" ? '' : 'style="color:red"' }

const plotPieGraph = (data) => {
    let lineData = {
        labels: [],
        datasets: [
            {
                label: 'Marks',
                data: [],
            }
        ]
    }
    for (let subject in data) {
        if (typeof (data[subject]) == "number") {
            lineData.labels.push(subject);
            lineData.datasets[0].data.push(data[subject]);
        }
    }
    document.getElementsByClassName('chart1')[0].innerHTML = `<canvas id="myChart1"></canvas>`
    const ctx = document.getElementById('myChart1');
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