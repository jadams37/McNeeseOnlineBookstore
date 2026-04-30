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

    // Initialize wishlist hearts with current state
    const initializeWishlistHearts = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            return; // User not logged in, hearts stay empty
        }

        try {
            const response = await fetch('/wishlist', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                return;
            }

            const { wishlist } = await response.json();
            const wishlistProductIds = new Set(wishlist.map(item => item.product_id));

            document.querySelectorAll('.wishlist-heart').forEach(heart => {
                const productId = heart.getAttribute('data-product-id');
                if (wishlistProductIds.has(productId)) {
                    heart.classList.add('in-wishlist');
                    heart.textContent = '♥';
                }

                heart.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await toggleWishlist(productId, heart);
                });
            });
        } catch (error) {
            console.error('Failed to initialize wishlist hearts:', error);
        }
    };

    const toggleWishlist = async (productId, heartElement) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Please log in to add items to your wishlist');
            return;
        }

        try {
            const isInWishlist = heartElement.classList.contains('in-wishlist');

            if (isInWishlist) {
                const response = await fetch(`/wishlist/items/${productId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Failed to remove from wishlist');
                }

                heartElement.classList.remove('in-wishlist');
                heartElement.textContent = '♡';
            } else {
                const response = await fetch('/wishlist/items', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ productId })
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Failed to add to wishlist');
                }

                heartElement.classList.add('in-wishlist');
                heartElement.textContent = '♥';
            }
        } catch (error) {
            alert(error.message || 'Unable to update wishlist');
        }
    };

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

            const imagePath = product.image_path || 'images/placeholder.jpg';
            return `
                <div class="product">
                    <img src="${imagePath}" alt="${product.title}" class="product-image">
                    <p class="product-title">${product.title || 'Untitled Product'}</p>
                    <p class="product-detail">${details || 'No additional details'}</p>
                    <div class="product-footer">
                        <p class="product-price">$${price}</p>
                        <button class="wishlist-heart" data-product-id="${product.product_id}" title="Add to wishlist">♡</button>
                    </div>
                    <a class="product-link" href="Product.html?id=${product.product_id}">View Product</a>
                </div>
            `;
        });

        productsContainer.innerHTML = cards.join('');

        // Initialize wishlist hearts
        initializeWishlistHearts();
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
