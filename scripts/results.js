window.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-by');
    const productsContainer = document.getElementById('products-container');
    const resultsTitle = document.getElementById('results-title');

    if (!productsContainer) {
        return;
    }

    const url = new URL(window.location.href);

    const buildParams = () => {
        const params = new URLSearchParams();

        const query = searchInput?.value?.trim();
        if (query) {
            params.set('q', query);
        }

        if (sortSelect?.value) {
            params.set('sort', sortSelect.value);
        }

        const checkedCondition = document.querySelector('input[name="condition"]:checked');
        if (checkedCondition) {
            params.set('condition', checkedCondition.value);
        }

        const checkedCategory = document.querySelector('input[name="category"]:checked');
        if (checkedCategory) {
            params.set('category', checkedCategory.value);
        }

        return params;
    };

    const updateTitle = () => {
        const query = searchInput?.value?.trim();
        if (!resultsTitle) {
            return;
        }

        if (query) {
            resultsTitle.textContent = `Results for "${query}"`;
            return;
        }

        resultsTitle.textContent = 'All Products';
    };

    const renderProducts = (products) => {
        productsContainer.innerHTML = '';

        if (!products.length) {
            productsContainer.innerHTML = '<p>No products found for your current filters.</p>';
            return;
        }

        const cards = products.map((product) => {
            const price = Number(product.price || 0).toFixed(2);
            const details = [product.author, product.condition, product.category_name]
                .filter(Boolean)
                .join(' | ');

            return `
                <div class="product">
                    <p class="product-title">${product.title || 'Untitled Product'}</p>
                    <p class="product-detail">${details || 'No additional details'}</p>
                    <p class="product-price">$${price}</p>
                    <a class="product-link" href="Product.html?id=${product.product_id}">View Product</a>
                </div>
            `;
        });

        productsContainer.innerHTML = cards.join('');
    };

    const loadProducts = async () => {
        const params = buildParams();
        updateTitle();

        url.search = params.toString();
        window.history.replaceState({}, '', url.toString());

        try {
            const response = await fetch(`/products?${params.toString()}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to load products.');
            }

            renderProducts(data.products || []);
        } catch (error) {
            productsContainer.innerHTML = `<p>${error.message || 'Unable to load products right now.'}</p>`;
        }
    };

    const hydrateFromQuery = () => {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        const sort = params.get('sort');
        const condition = params.get('condition');
        const category = params.get('category');

        if (q && searchInput) {
            searchInput.value = q;
        }

        if (sort && sortSelect) {
            sortSelect.value = sort;
        }

        if (condition) {
            const conditionInput = document.querySelector(`input[name="condition"][value="${condition}"]`);
            if (conditionInput) {
                conditionInput.checked = true;
            }
        }

        if (category) {
            const categoryInput = document.querySelector(`input[name="category"][value="${category}"]`);
            if (categoryInput) {
                categoryInput.checked = true;
            }
        }
    };

    searchForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        loadProducts();
    });

    sortSelect?.addEventListener('change', loadProducts);

    document.querySelectorAll('input[name="condition"], input[name="category"]').forEach((input) => {
        input.addEventListener('change', (event) => {
            const target = event.target;
            const groupName = target.getAttribute('name');

            document.querySelectorAll(`input[name="${groupName}"]`).forEach((other) => {
                if (other !== target) {
                    other.checked = false;
                }
            });

            loadProducts();
        });
    });

    hydrateFromQuery();
    loadProducts();
});
