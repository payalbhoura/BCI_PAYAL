const userName = document.getElementById("name")
const userEmail = document.getElementById("email")
const userPass = document.getElementById("password")
const userGst = document.getElementById("gst")
const userPan = document.getElementById("pan")
const userMobile = document.getElementById("mobile")
const userStore = document.getElementById("store")
const userAddress = document.getElementById("address")
const usercity = document.getElementById("city")
const userstate = document.getElementById("state")
const userpincode = document.getElementById("pincode")
const userimg = document.getElementById("img")


const error = document.getElementById("err")

function validate(e) {
    if (e.target.value.trim().length < 5) {
        e.target.style.outline = "1px solid red";
    } else {
        e.target.style.outline = "none";
    }
}
function validatename(e) {
    console.log("target", e.target.value, "length", e.target.value.length);
    if (e.target.value.length < 5) {
        e.target.style.outline = "1px solid red";

        error.value = "Name minimum length 5 !"
        return false
    } else {
        e.target.style.outline = "none";
        error.value = ""
    }
}

function validateEmail(e) {
    let regex = /^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/
    if (!regex.test(e.target.value.trim())) {
        e.target.style.outline = "1px solid red";
        error.value = "Email is invalid !"
        return false
    } else {
        e.target.style.outline = "none";
        error.value = ""
    }
}

function validatePass(e) {
    let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/;
    if (!regex.test(e.target.value.trim())) {
        document.getElementById("password").style.outline = "1px solid red";
        error.value = "Password must begin with a capital and contain lower, number and alphanumeric character"
        return false
    } else {
        document.getElementById("password").style.outline = "none";
        error.value = ""
    }
}
function validategst(e) {
}

userName.addEventListener('input', validatename)
userEmail.addEventListener('input', validateEmail)
userPass.addEventListener('input', validatePass)
userGst.addEventListener('input', validate)
userPan.addEventListener('input', validate)
userMobile.addEventListener('input', validate)
userStore.addEventListener('input', validate)
usercity.addEventListener('input', validate)
userstate.addEventListener('input', validate)
userpincode.addEventListener('input', validate)
userAddress.addEventListener('input', validate)
userimg.addEventListener('input', validate)
const form=document.getElementById("signupform")


form.addEventListener('submit', e => {
    e.preventDefault();
    if (error.value != "") {
        error.value = "All fields are required !"
        return false
    } else if (userName == "" || userEmail == "" || userPass == "" || userGst == "" || userMobile == "" || userMobile == "" || userStore == "" || userAddress == "") {
        error.value = "All fields are required !"
        return false
    }

    const formData = new FormData(form);
    console.log("formData entries:", Array.from(formData.entries())); // Debugging statement
    fetch("/signup", {
        method: "POST",
        body:formData
    })
        .then((result) => {
            console.log('status', result.status);
            if (result.status == 302) {

                Swal.fire({
                    title: 'Request submitted',
                    text: 'Your signup application has been received. Please wait for approvel from our admin.',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                })
                userName.value="",
                document.getElementById("name").value="",
                document.getElementById("email").value="",
                document.getElementById("password").value="",
                document.getElementById("gst").value="",
                document.getElementById("pan").value="",
                document.getElementById("store").value="",
                document.getElementById("mobile").value=""
                document.getElementById("storeAddress").value=""
                document.getElementById("city").value=""
                document.getElementById("state").value=""
                document.getElementById("pincode").value=""
                  

            } else if (result.status === 403) {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Email already exist",
                });
            }
        })
        .catch((err) => {
            document.getElementById("err").value = err
        });
})

document.getElementById("hideShowPass").addEventListener('click', e => {
    if (e.target.classList.contains("fa-eye")) {
        e.target.classList.remove("fa-eye")
        e.target.classList.add("fa-eye-slash")
        userPass.type = "text"
    } else {
        e.target.classList.add("fa-eye")
        e.target.classList.remove("fa-eye-slash")
        userPass.type = "password"
    }
})

