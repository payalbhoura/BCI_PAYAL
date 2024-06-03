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

function validatename(value) {
    if (value.length < 5) {
        setError(userName, "Name must be at least 5 characters long!");
        return false;
    } else {
        clearError(userName);
        return true;
    }
}

function validateEmail(value) {
    let regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!regex.test(value.trim())) {
        setError(userEmail, "Email is invalid!");
        return false;
    } else {
        clearError(userEmail);
        return true;
    }
}

function validatePass(value) {
    let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/;
    if (!regex.test(value.trim())) {
        setError(userPass, "Password must be 8-15 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
        return false;
    } else {
        clearError(userPass);
        return true;
    }
}

function validateGst(value) {
    let regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!regex.test(value.trim())) {
        setError(userGst, "GST number format is invalid! Example: 22AAAAA0000A1Z5");
        return false;
    } else {
        clearError(userGst);
        return true;
    }
}

function validatePan(value) {
    let regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!regex.test(value.trim())) {
        setError(userPan, "PAN number format is invalid! Example: AAAAA0000A");
        return false;
    } else {
        clearError(userPan);
        return true;
    }
}

function validateMobile(value) {
    let regex = /^[6-9][0-9]{9}$/;
    if (!regex.test(value.trim())) {
        setError(userMobile, "Mobile number is invalid! Must be 10 digits starting with 6-9.");
        return false;
    } else {
        clearError(userMobile);
        return true;
    }
}

function validateGeneric(value, element) {
    if (value.trim().length < 3) {
        setError(element, `This field must be at least 3 characters long!`);
        return false;
    } else {
        clearError(element);
        return true;
    }
}

function validatePincode(value) {
    let regex = /^[1-9][0-9]{5}$/;
    if (!regex.test(value.trim())) {
        setError(userPincode, "Pincode is invalid! Must be 6 digits starting with a non-zero.");
        return false;
    } else {
        clearError(userPincode);
        return true;
    }
}

function validateImg(file) {
    if (file) {
        const validTypes = ['image/png', 'image/jpg', 'image/jpeg'];
        if (!validTypes.includes(file.type)) {
            setError(userImg, "Image must be of type PNG, JPG, or JPEG!");
            return false;
        } else {
            clearError(userImg);
            return true;
        }
    } else {
        // setError(userImg, "Please upload an image!");
        // return false;
        clearError(userImg);
        return true;
    }
}

userName.addEventListener('input', e => {
    validatename(e.target.value);
});
userEmail.addEventListener('input', e => {
    validateEmail(e.target.value);
});
userPass.addEventListener('input', e => {
    validatePass(e.target.value);
});
userGst.addEventListener('input', e => {
    validateGst(e.target.value);
});
userPan.addEventListener('input', e => {
    validatePan(e.target.value);
});
userMobile.addEventListener('input', e => {
    validateMobile(e.target.value);
});
userStore.addEventListener('input', e => {
    validateGeneric(e.target.value, userStore);
});
userCity.addEventListener('input', e => {
    validateGeneric(e.target.value, userCity);
});
userState.addEventListener('input', e => {
    validateGeneric(e.target.value, userState);
});
userPincode.addEventListener('input', e => {
    validatePincode(e.target.value);
});
userAddress.addEventListener('input', e => {
    validateGeneric(e.target.value, userAddress);
});
userImg.addEventListener('change', e => {
    validateImg(e.target.files[0]);
});

const form = document.getElementById("signupform");

form.addEventListener('submit', e => {
    e.preventDefault();

    const formData = new FormData(form);

    // Validate all fields before submitting
    if (
        validatename(userName.value) &&
        validateEmail(userEmail.value) &&
        validatePass(userPass.value) &&
        validateGst(userGst.value) &&
        validatePan(userPan.value) &&
        validateMobile(userMobile.value) &&
        validateGeneric(userStore.value, userStore) &&
        validateGeneric(userCity.value, userCity) &&
        validateGeneric(userState.value, userState) &&
        validatePincode(userPincode.value) &&
        validateGeneric(userAddress.value, userAddress) &&
        validateImg(userImg.files[0])
    ) {
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
    } else {
        // Form has validation errors, do nothing or show an error message
        error.innerText = "Please fill in all fields correctly.";
    }
});

document.getElementById("hideShowPass").addEventListener('click', e => {
    const userPass = document.getElementById("password");
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
