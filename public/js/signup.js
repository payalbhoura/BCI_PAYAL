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

        error.innerText = "Name minimum length 5 !"
        return false
    } else {
        e.target.style.outline = "none";
        error.innerText = ""
    }
}

function validateEmail(e) {
    let regex = /^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/
    if (!regex.test(e.target.value.trim())) {
        e.target.style.outline = "1px solid red";
        error.innerText = "Email is invalid !"
        return false
    } else {
        e.target.style.outline = "none";
        error.innerText = ""
    }
}

function validatePass(e) {
    let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/;
    if (!regex.test(e.target.value.trim())) {
        document.getElementById("password").style.outline = "1px solid red";
        error.innerText = "Password must begin with a capital and contain lower, number and alphanumeric character"
        return false
    } else {
        document.getElementById("password").style.outline = "none";
        error.innerText = ""
    }
}
// function validategst(e) {
// }

userName.addEventListener('input', validatename)
userEmail.addEventListener('input', validateEmail)
userPass.addEventListener('input', validatePass)
// userGst.addEventListener('input', validate)
// userPan.addEventListener('input', validate)
// userMobile.addEventListener('input', validate)
// userStore.addEventListener('input', validate)
// usercity.addEventListener('input', validate)
// userstate.addEventListener('input', validate)
// userpincode.addEventListener('input', validate)
// userAddress.addEventListener('input', validate)
// userimg.addEventListener('input', validate)
const form=document.getElementById("signupform")


form.addEventListener('submit', e => {
    e.preventDefault();

    // Assuming userName, userEmail, etc. are defined as inputs
    const userName = document.getElementById("name").value.trim();
    const userEmail = document.getElementById("email").value.trim();
    const userPass = document.getElementById("password").value.trim();
    const userGst = document.getElementById("gst").value.trim();
    const userMobile = document.getElementById("mobile").value.trim();
    const userStore = document.getElementById("store").value.trim();
    const userAddress = document.getElementById("address").value.trim();

    // Clear previous error message
    error.innerText = "";

    // Validate fields
    if (!userName || !userEmail || !userPass || !userGst || !userMobile || !userStore || !userAddress) {
        error.innerText = "All fields are required!";
        return;
    }

    const formData = new FormData(form);
    console.log("formData entries:", Array.from(formData.entries())); // Debugging statement

    fetch("/signup", {
        method: "POST",
        body: formData
    })
        .then((result) => {
            console.log('status', result.status);
            if (result.status == 302) {
                Swal.fire({
                    title: 'Request submitted',
                    text: 'Your signup application has been received. Please wait for approval from our admin.',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                });

                // Clear form fields
                form.reset();

            } else if (result.status === 403) {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Email already exists",
                });
            }
        })
        .catch((err) => {
            console.error("Error:", err);
            error.innerText = "An error occurred. Please try again later.";
        });
});


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

