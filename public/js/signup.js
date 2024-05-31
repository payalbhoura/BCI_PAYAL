const userName = document.getElementById("name");
const userEmail = document.getElementById("email");
const userPass = document.getElementById("password");
const userGst = document.getElementById("gst");
const userPan = document.getElementById("pan");
const userMobile = document.getElementById("mobile");
const userStore = document.getElementById("store");
const userAddress = document.getElementById("address");
const userCity = document.getElementById("city");
const userState = document.getElementById("state");
const userPincode = document.getElementById("pincode");
const userImg = document.getElementById("img");

const error = document.getElementById("err");

function setError(element, message) {
    element.style.outline = "1px solid red";
    error.innerText = message;
}

function clearError(element) {
    element.style.outline = "none";
    error.innerText = "";
}

function validatename(e) {
    if (e.target.value.length < 5) {
        setError(e.target, "Name must be at least 5 characters long!");
        return false;
    } else {
        clearError(e.target);
    }
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

function validateGst(e) {
    let regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!regex.test(e.target.value.trim())) {
        setError(e.target, "GST number format is invalid! Example: 22AAAAA0000A1Z5");
        return false;
    } else {
        clearError(e.target);
    }
}

function validatePan(e) {
    let regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!regex.test(e.target.value.trim())) {
        setError(e.target, "PAN number format is invalid! Example: AAAAA0000A");
        return false;
    } else {
        clearError(e.target);
    }
}

function validateMobile(e) {
    let regex = /^[6-9][0-9]{9}$/;
    if (!regex.test(e.target.value.trim())) {
        setError(e.target, "Mobile number is invalid! Must be 10 digits starting with 6-9.");
        return false;
    } else {
        clearError(e.target);
    }
}

function validateGeneric(e) {
    if (e.target.value.trim().length < 3) {
        setError(e.target, `This field must be at least 3 characters long!`);
        return false;
    } else {
        clearError(e.target);
    }
}

function validatePincode(e) {
    let regex = /^[1-9][0-9]{5}$/;
    if (!regex.test(e.target.value.trim())) {
        setError(e.target, "Pincode is invalid! Must be 6 digits starting with a non-zero.");
        return false;
    } else {
        clearError(e.target);
    }
}

function validateImg(e) {
    const file = e.target.files[0];
    if (file) {
        const validTypes = ['image/png', 'image/jpg', 'image/jpeg'];
        if (!validTypes.includes(file.type)) {
            setError(e.target, "Image must be of type PNG, JPG, or JPEG!");
            return false;
        } else {
            clearError(e.target);
        }
    } else {
        setError(e.target, "Please upload an image!");
        return false;
    }
}

userName.addEventListener('input', validatename);
userEmail.addEventListener('input', validateEmail);
userPass.addEventListener('input', validatePass);
userGst.addEventListener('input', validateGst);
userPan.addEventListener('input', validatePan);
userMobile.addEventListener('input', validateMobile);
userStore.addEventListener('input', validateGeneric);
userCity.addEventListener('input', validateGeneric);
userState.addEventListener('input', validateGeneric);
userPincode.addEventListener('input', validatePincode);
userAddress.addEventListener('input', validateGeneric);
userImg.addEventListener('change', validateImg);

const form = document.getElementById("signupform");

form.addEventListener('submit', e => {
    e.preventDefault();

    const userName = document.getElementById("name").value.trim();
    const userEmail = document.getElementById("email").value.trim();
    const userPass = document.getElementById("password").value.trim();
    const userGst = document.getElementById("gst").value.trim();
    const userPan = document.getElementById("pan").value.trim();
    const userMobile = document.getElementById("mobile").value.trim();
    const userStore = document.getElementById("store").value.trim();
    const userAddress = document.getElementById("address").value.trim();
    const userCity = document.getElementById("city").value.trim();
    const userState = document.getElementById("state").value.trim();
    const userPincode = document.getElementById("pincode").value.trim();
    const userImg = document.getElementById("img").files[0];

    // Clear previous error message
    error.innerText = "";

    // Validate fields
    if (!userName || !userEmail || !userPass || !userGst || !userPan || !userMobile || !userStore || !userAddress || !userCity || !userState || !userPincode || !userImg) {
        error.innerText = "All fields are required!";
        return;
    }

    const formData = new FormData(form);

    fetch("/signup", {
        method: "POST",
        body: formData
    })
    .then((result) => {
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
        e.target.classList.remove("fa-eye");
        e.target.classList.add("fa-eye-slash");
        userPass.type = "text";
    } else {
        e.target.classList.add("fa-eye");
        e.target.classList.remove("fa-eye-slash");
        userPass.type = "password";
    }
});
