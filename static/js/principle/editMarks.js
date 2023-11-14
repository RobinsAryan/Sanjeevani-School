const openEditMarks = () => {
    document.getElementById('popup').style.display = 'block';
    let formString = `<div class="popup-form">
            <div class="hidePopUp"><i onClick="closePopup()" class="fa-solid fa-xmark"></i></div>
            <form onSubmit="handleSubmit(event)" id="fileUploadForm">`

    for (let subject in originalMarks) {
        formString += `
        <p class="editForm">${subject}:</p>
                <input class="subjectMarksInput" type="text" name="${subject}" placeholder="${subject} Marks" value="${originalMarks[subject]}" required> 
                
               `
    }

    formString += ` 
                <div>
                    <button style="background:#ff4646;" type="reset">Reset</button>
                    <button type="submit">Update</button>
                </div>
            </form>
        </div>
    `
    document.getElementById('popup').innerHTML = formString;
}


const handleSubmit = async (e) => {
    e.preventDefault();
    let newMarks = {};
    for (let subject in originalMarks) {
        let mark = parseFloat(e.target[subject].value.trim());
        newMarks[subject] = mark.toString() == "NaN" ? e.target[subject].value : mark;
        if (typeof (newMarks[subject]) == "number" && (newMarks[subject] > 100 || newMarks[subject] < 0)) {
            alert("Marks should be between 0 and 100!");
            closePopup();
            return;
        }
    }
    let changes = false;
    for (let subject in originalMarks) {
        if (newMarks[subject] != originalMarks[subject]) { changes = true; break; }
    }
    if (!changes) {
        closePopup();
        return;
    }
    document.getElementById('popup').innerHTML = '<div class="loading_div"> <i class="fas fa-spinner rotateMe"></i> </div>'
    newMarks = JSON.stringify(newMarks);
    let res = await myPost(`/class/result/updateMarks/${userId}/${resultId}`, { result: newMarks });
    if (res.success) {
        closePopup();
        location.reload();
    }
    else {
        document.getElementById('popup').innerHTML = `
                <div class="popup-form">
                ${showSWrong('openEditMarks()')}
                </div>
    `
    }
}