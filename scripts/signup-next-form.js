let onNextPage = false;
let isInputValid = false;

/* Grabs the Signup form and the button used to proceed/submit the form */
const form = document.getElementById('signup');
const button = document.getElementById('next');

/* Listener for input text fields for validation */
form.addEventListener('input', function(e) {
    validateForm();
})

function nextForm() {
    validateForm();

    /* New form input and labels to shown on the next page of the Signup */
    const newFormInput=
                   `<div class="name-container">
                        <label for="name" class="name-label">Full Name</label><br>
                        <input class="name-input" id="name" type="text"><br>
                        <p class="errorMsg" id="errorName" hidden>Name must be of length 2 to 50.</p>
                    </div>
                    <div class="address-container">
                        <label for="address" class="address-label">Address</label><br>
                        <input class="address-input" id="address" type="text"><br>
                        <p class="errorMsg" id="errorAddress" hidden>Address must be of length 5 to 100.</p>
                    </div>
                    <div class="phone-container">
                        <label for="phone" class="phone-label">Phone Number</label><br>
                        <input class="phone-input" id="phone" type="tel"><br>
                        <p class="errorMsg" id="errorPhone" hidden>Phone must be of format 111-111-1111.</p>
                    </div>`;

    if(!onNextPage && isInputValid)
    {
        onNextPage = true;

        /* Iterates through each element contained in the signup form and 
        sets their hidden attribute to true */
        document.querySelectorAll('#signup > *').forEach(element => {
            element.hidden = true;
        })

        /* Append the new form inputs after hiding the previous */
        form.insertAdjacentHTML('beforeend', newFormInput);

        /* Update the 'Next' button to become a submit button */
        button.textContent = "Register";
        button.type = "submit";
    }
}

function validateForm() {
    /* Regex for input fields */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[A-Za-z][A-Za-z0-9]{3,11}$/;
    const passwordRegex = /^\S{6,}$/;
    const nameRegex = /^[A-Za-z\s'-]{2,50}$/;
    const addressRegex = /^[A-Za-z0-9\s.,'-]{5,100}$/;
    const phoneRegex = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;

    isInputValid = true;

    /* Validate all inputs for the first part of the Signup page */
    if(!onNextPage)
    {
        const email = document.getElementById('email').value.trim();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        /* Check if inputs meet their respective regex criteria */
        if(!emailRegex.test(email))
        {

            document.getElementById('errorEmail').hidden = false;
            isInputValid = false;

        }

        else
        {

            document.getElementById('errorEmail').hidden = true;

        }

        if(!usernameRegex.test(username))
        {

            document.getElementById('errorUsername').hidden = false;
            isInputValid = false;

        }

        else
        {

            document.getElementById('errorUsername').hidden = true;

        }

        if(!passwordRegex.test(password))
        {

            document.getElementById('errorPassword').hidden = false;
            isInputValid = false;

        }

        else
        {

            document.getElementById('errorPassword').hidden = true;

        }

    }

    /* Validate all inputs for the second part of the Signup page */
    else
    {
        const name = document.getElementById('name').value.trim();
        const address = document.getElementById('address').value.trim();
        const phone = document.getElementById('phone').value.trim();

        /* Check if inputs meet their respective regex criteria */
        if(!nameRegex.test(name))
        {

            document.getElementById('errorName').hidden = false;
            isInputValid = false;

        }

        else
        {

            document.getElementById('errorName').hidden = true;

        }

        if(!addressRegex.test(address))
        {

            document.getElementById('errorAddress').hidden = false;
            isInputValid = false;

        }

        else
        {

            document.getElementById('errorAddress').hidden = true;

        }

        if(!phoneRegex.test(phone))
        {

            document.getElementById('errorPhone').hidden = false;
            isInputValid = false;

        }

        else
        {

            document.getElementById('errorPhone').hidden = true;

        } 
    }
}