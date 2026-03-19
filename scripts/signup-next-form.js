function nextForm() {
    /* New form input and labels to shown on the next page of the Signup */
    const newFormInput=`<label for="name" class="name-label">Full Name</label><br>
                    <input class="name-input" id="name" type="text"><br>
                    <label for="address" class="address-label">Address</label><br>
                    <input class="address-input" id="address" type="text"><br>
                    <label for="phone" class="phone-label">Phone Number</label><br>
                    <input class="phone-input" id="password" type="text"><br>`;

    /* Grabs the Signup form and the button used to proceed/submit the form */
    const form = document.getElementById('signup');
    const button = document.getElementById('next');

    /* Iterates through each element contained in the signup form and 
       sets their hidden attribute to true */
    document.querySelectorAll('#signup > *').forEach(element => {
        element.hidden = true;
    })

    /* Append the new form inputs after hiding the previous */
    form.innerHTML += newFormInput;

    /* Update the 'Next' button to become a submit button */
    button.textContent = "Register";
    button.type = "submit";
    button.onclick = "";
    
}