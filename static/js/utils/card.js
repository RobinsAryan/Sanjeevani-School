let data = { shpae: 'r', info: 'none' };

let shapes = document.getElementsByClassName('shapes')[0];
Array.from(shapes.children).forEach(child => {
    child.addEventListener('click', (e) => {
        Array.from(shapes.children).forEach(ele => ele.classList.remove('active'));
        e.target.classList.add('active');
        data.shpae = e.target.getAttribute('value');
    });
})

const mapInfo =   {
    'rid': "Reg. Id",
    'username': "Name",
    'fname': "Father's Name",
    'class': "Class",
    'rollno': "Roll No.",
    'phone': "Phone No.",
    'add': "Address",
    'gender': "Gender",
    'dob':"Date of Birth",
}