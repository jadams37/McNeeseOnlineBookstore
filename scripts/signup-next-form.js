let onNextPage = false;
let isFormValid = false;

/* Dictionary for regexs to check input values with */
const regexDictionary = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    username: /^[A-Za-z][A-Za-z0-9]{3,11}$/,
    password: /^\S{6,}$/,
    name: /^[A-Za-z\s'-]{2,50}$/,
    address: /^[A-Za-z0-9\s.,'-]{5,100}$/,
    phone: /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/
};

/* Grabs the Signup form and the button used to proceed/submit the form */
const form = document.getElementById('signup');
const button = document.getElementById('next');

/* EventListener to validate the currently selected input */
form.addEventListener('input', function(e) {
    validateInput(e.target);
})

function validateInput(input) {
    let inputId = input.id;
    let inputValue = input.value;
    let errorMsg = document.getElementById('error-' + inputId);

    /* Searches regexDictionary to find an id that matches the inputId
       and store its associated value */
    let regex = regexDictionary[inputId];

    /* Display error message if input is invalid */
    if(!regex.test(inputValue)) {
        errorMsg.hidden = false;
        return false;
    }

    else {
        errorMsg.hidden = true;
        return true;
    }

}

function nextForm() {
    isFormValid = true;
    /* Grab all inputs in the current form and validate them
       if the user tries to move to the next page or submit */
    const inputs = form.querySelectorAll('input:not([hidden])');

    inputs.forEach(input => {
        if(!validateInput(input)) {
            isFormValid = false;
        }
    })

    /* New form input and labels to show on the next page of the Signup */
    const newFormInput =
                   `<div class="name-container">
                        <label for="name" class="name-label">Full Name</label><br>
                        <input class="name-input" id="name" type="text" name="name"><br>
                        <p class="error-msg" id="error-name" hidden>Name must be of length 2 to 50.</p>
                    </div>
                    <div class="address-container">
                        <label for="address" class="address-label">Address</label><br>
                        <input class="address-input" id="address" type="text" name="address"><br>
                        <p class="error-msg" id="error-address" hidden>Address must be of length 5 to 100.</p>
                    </div>
                    <div class="phone-container">
                        <label for="phone" class="phone-label">Phone Number</label><br>
                        <input class="phone-input" id="phone" type="tel" name="phone"><br>
                        <p class="error-msg" id="error-phone" hidden>Phone must be of format 111-111-1111.</p>
                    </div>`;

    if(!onNextPage && isFormValid) {
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
    }

    else if(onNextPage && isFormValid) {
        /* Submit form if on second part of form and inputs are valid */
        form.requestSubmit();
    }
}