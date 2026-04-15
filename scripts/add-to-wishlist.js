document.addEventListener('click', function(e) {
    if(e.target.classList.contains('wishlist-button')) {
        const isActive = e.target.dataset.active === "true";

        if(!isActive) {
            e.target.dataset.active = "true";
            e.target.style.backgroundImage = "url(./icons/wishlistactive.svg)";
        }
        else {
            e.target.dataset.active = "false";
            e.target.style.backgroundImage = "url(./icons/wishlist.svg)";
        }
    }
})
