
function login(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const loginDetails = {
        email: form.get("email"),
        password: form.get("password")
    }
    console.log(loginDetails)
    axios.post('/user/login',loginDetails).then(response => {
        if(response.status === 200){
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', response.data.userDetails[0].name)
            localStorage.setItem('userid', response.data.userDetails[0].id)
            alert("Logged in successfully")
            window.location.href = "../Chat/index.html" // change the page on successful login
            // window.location.href = "../new.html" 
        } else {
            throw new Error('Failed to login')
        }
    }).catch(err => {
        // console.log(err.response.data.message)
        // if(err.response.status === 401){
        //     alert(err.response.data.message)
        // }
        // else if(err.response.status === 404){
        //     alert(err.response.data.message)
        // }
        // else if(err.response.status===403){
        //     alert(err.response.data.message)
        // }
        if(err.response.status){
            alert(err.response.status+' error : '+ err.response.data.message);
     }
        else {
            document.body.innerHTML += `<div style="color:red;">${err} <div>`;
        }
    })
}

function forgotpassword() {
    window.location.href = "../ForgotPassword/index.html"
}