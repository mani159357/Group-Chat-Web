function signup(e) {
    e.preventDefault();
    const form = new FormData(e.target);

    const signupDetails = {
        name: form.get("name"),
        email: form.get("email"),
        phoneNumber: form.get('phoneNumber'),
        password: form.get("password")

    }

    console.log(signupDetails);
    axios.post('/user/signup',signupDetails).then(response => {
        console.log(response)
        if(response.status === 201){
            console.log(response.data.message)
            alert('Signup Successful')
            window.location.href = "../Login/login.html" // change the page on successful login
        } 
        else {
            throw new Error("error in user creation")
        }
    }).catch(err => {
        // if(err.response.status === 403){
        //     alert(err.response.data.message);
        // }
        // else if(err.response.status === 404){
        //     alert(err.response.data.message);
        // }
        if(err.response.status){
                alert(err.response.status+' error : '+ err.response.data.message);
        }
        else{
            document.body.innerHTML += `<div style="color:red;">${err} <div>`;
        }
        
    })
}