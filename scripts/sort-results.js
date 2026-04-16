/* Adds an EventListener to prevent Sort form from potentially submitting. */
document.querySelector('#sort').addEventListener('submit', e => {
    e.preventDefault();
})

const sort = document.getElementById('sort-by');

const productContainer = document.querySelector('.products-container');

const params = new URLSearchParams(window.location.search);
const search = params.get('search');

/* Adds an EventListener to check the value of the sort button to update results based on
   sort method */
sort.addEventListener('change', function() {
    const sortValue = sort.value;

    fetch(`resultssorted.php?&search=${encodeURIComponent(search)}&sort=${sortValue}`)
        .then(response => response.text())
        .then(data => {
            productContainer.innerHTML = data;
        })
})