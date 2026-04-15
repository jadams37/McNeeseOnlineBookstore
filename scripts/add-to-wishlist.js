let isWishlisted = false;

const buttons = document.querySelectorAll('#wishlist')

buttons.forEach(button => {
    button.addEventListener('click', function(e) {
        toggleWishlist();

        if(!isWishlisted) { button.style.backgroundImage = "url(./icons/wishlist.svg)"; }

        else { button.style.backgroundImage = "url(./icons/wishlistactive.svg)"; }
    })
})

function toggleWishlist() {
    if(!isWishlisted) { isWishlisted = true }
    else { isWishlisted = false }
}