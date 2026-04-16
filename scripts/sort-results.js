/* Adds an EventListener to prevent Sort form from potentially submitting. */
document.querySelector('#sort').addEventListener('submit', e => {
    e.preventDefault();
})

/* Grab sort and all filter HTML elements */
const sort = document.getElementById('sort-by');
const booksCheckbox = document.getElementById('books');
const suppliesCheckbox = document.getElementById('supplies');
const newCheckbox = document.getElementById('new');
const usedCheckbox = document.getElementById('used');

const productContainer = document.querySelector('.products-container');

const params = new URLSearchParams(window.location.search);
const search = params.get('search');

/* Adds EventListeners to filters to update the results based on the checked filters */
booksCheckbox.addEventListener('change', updateResults);
suppliesCheckbox.addEventListener('change', updateResults);
newCheckbox.addEventListener('change', updateResults);
usedCheckbox.addEventListener('change', updateResults);

/* Adds an EventListener to check the value of the sort button to update results based on
   sort method */
sort.addEventListener('change', updateResults);

/* Helper function to update products container with current sort and filters */
function updateResults() {
    const sortValue = sort.value;

    const typeFilters = [];
    if(booksCheckbox.checked) { typeFilters.push("book"); }
    if(suppliesCheckbox.checked) { typeFilters.push("supply"); }

    const conditionFilters = [];
    if(newCheckbox.checked) { conditionFilters.push("new"); }
    if(usedCheckbox.checked) { conditionFilters.push("used"); }

    const typeParams = typeFilters.join(",");
    const conditionParams = conditionFilters.join(",");

    fetch(`resultssorted.php?&search=${encodeURIComponent(search)}&sort=${sortValue}&type=${typeParams}&condition=${conditionParams}`)
        .then(response => response.text())
        .then(data => { productContainer.innerHTML = data; })
}