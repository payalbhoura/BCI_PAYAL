const email = document.getElementById("email")
const error =  document.getElementById("err")
const password = document.getElementById("password")

function setError(element, message){
element.style.outline="1px solid red";
error.innerText=message
}

function clearError(element){
    element.style.outline="none";
    error.innerText=""
}

function validateEmail(e) {
    let regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!regex.test(e.target.value.trim())) {
        setError(e.target, "Email is invalid!");
        return false;
    } else {
        clearError(e.target);
    }
}

function validatePass(e) {
    let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/;
    if (!regex.test(e.target.value.trim())) {
        setError(e.target, "Password must be 8-15 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
        return false;
    } else {
        clearError(e.target);
    }
}

email.addEventListener('input', validateEmail);
password.addEventListener('input', validatePass);

document.getElementById("loginBtn").addEventListener('click',e=>{
    if(error.innerText!=""){
        return false; 
    } else if(email.value.trim()=="" || password.value.trim()==""){
        error.innerText = "Enter Email and Password !"
        return false
    }
    fetch("/login",{
        method:"POST",
        headers:{
            'content-type':'application/json'
        },
        body:JSON.stringify({
            email: email.value,
            password: (password.value)
        })
    })
    .then((result) => {
        console.log('status', result.status);
        if(result.ok){
            location.href = "home"
        } else if(result.status===404){
            error.innerText = "Invalid Email or Password !"
        } else if(result.status==403){
            error.innerText = "Your signup request is not approved yet!"
        }
        setTimeout(()=>{
            error.innerText = ""
        },3000) 
    }).catch((err) => {
        error.innerText = err
    });
})

document.getElementById("hideShowPass").addEventListener('click',e=>{
    if(e.target.classList.contains("fa-eye")){
        e.target.classList.remove("fa-eye")
        e.target.classList.add("fa-eye-slash")
        password.type = "text"
    } else {
        e.target.classList.add("fa-eye")
        e.target.classList.remove("fa-eye-slash")
        password.type = "password"
    }
})