document.querySelector('#sort').addEventListener('submit', e => {
    e.preventDefault();
})

const sort = document.getElementById('sort-by');

const productContainer = document.querySelector('.products-container');

const params = new URLSearchParams(window.location.search);
const search = params.get('search');

sort.addEventListener('change', () => {
    const sortValue = sort.value;

    fetch(`resultsorted.php?&search=${encodeURIComponent(search)}&sort=${sortValue}`)
        .then(response => response.text())
        .then(data => {
            productContainer.innerHTML = data;
        })
})