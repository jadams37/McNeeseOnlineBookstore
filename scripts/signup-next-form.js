function nextForm() {
    const newFormInput=`<label for="name" class="name-label">Full Name</label><br>
                    <input class="name-input" id="name" type="text"><br>
                    <label for="address" class="address-label">Address</label><br>
                    <input class="address-input" id="address" type="text"><br>
                    <label for="phone" class="phone-label">Phone Number</label><br>
                    <input class="phone-input" id="password" type="text"><br>`;

    const form = document.getElementById('signup');
    const button = document.getElementById('next');

    form.innerHTML = newFormInput;
    button.textContent = "Register"
    button.type = "submit"
    button.onclick = ""
    
}