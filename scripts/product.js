window.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    const pageTitle = document.getElementById('product-page-title');
    const pageSubtitle = document.getElementById('product-page-subtitle');
    const primaryGrid = document.getElementById('primary-product-grid');
    const relatedGrid = document.getElementById('related-product-grid');

    if (!primaryGrid) {
        return;
    }

    if (!productId) {
        primaryGrid.innerHTML = '<p>No product selected. Go back to the results page and choose an item.</p>';
        return;
    }

    try {
        const detailResponse = await fetch(`/products/${productId}`);
        const detailData = await detailResponse.json();

        if (!detailResponse.ok) {
            throw new Error(detailData.message || 'Unable to load product details.');
        }

        const product = detailData.product;
        const price = Number(product.price || 0).toFixed(2);
        const stockText = Number(product.quantity_in_stock || 0) > 0 ? 'In Stock' : 'Out of Stock';

        if (pageTitle) {
            pageTitle.textContent = product.title || 'Product Details';
        }

        if (pageSubtitle) {
            pageSubtitle.textContent = `${product.author || 'Unknown Author'} | ${product.condition || 'N/A'} | ${product.category_name || 'General'}`;
        }

        const imagePath = product.image_path || 'images/placeholder.jpg';
        primaryGrid.innerHTML = `
            <div class="product-card">
                <img src="${imagePath}" alt="${product.title}" class="product-image">
                <h3>${product.title || 'Untitled Product'}</h3>
                <p class="price">$${price}</p>
                <p class="description">Author: ${product.author || 'N/A'}</p>
                <p class="description">Edition: ${product.edition || 'N/A'}</p>
                <p class="description">ISBN: ${product.isbn || 'N/A'}</p>
                <p class="description">Status: ${stockText}</p>
                <button id="add-to-cart-btn" ${Number(product.quantity_in_stock) > 0 ? '' : 'disabled'}>Add to Cart</button>
            </div>
        `;

        // Add event listener for add to cart
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        if (addToCartBtn && !addToCartBtn.disabled) {
            addToCartBtn.addEventListener('click', async () => {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    alert('Please log in to add items to cart.');
                    window.location.href = 'login.html';
                    return;
                }

                try {
                    const response = await fetch('/cart/items', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            productId: product.product_id,
                            quantity: 1
                        })
                    });
                    const responseText = await response.text();
                    let responseData = {};
                    if (responseText) {
                        try {
                            responseData = JSON.parse(responseText);
                        } catch (_parseError) {
                            responseData = {};
                        }
                    }

                    if (!response.ok) {
                        const fallbackMessage = responseText ? responseText.substring(0, 200) : response.statusText;
                        throw new Error(responseData.message || `Server error (${response.status}): ${fallbackMessage}`);
                    }

                    alert('Item added to cart!');
                } catch (error) {
                    console.error('Add to cart error:', error);
                    alert(error.message || 'Unable to add to cart right now.');
                }
            });
        }

        const relatedParams = new URLSearchParams();
        if (product.category_name) {
            relatedParams.set('category', product.category_name.toLowerCase());
        }
        relatedParams.set('sort', 'title_asc');

        const relatedResponse = await fetch(`/products?${relatedParams.toString()}`);
        const relatedData = await relatedResponse.json();

        if (!relatedResponse.ok) {
            throw new Error(relatedData.message || 'Unable to load related products.');
        }

        const relatedProducts = (relatedData.products || [])
            .filter((item) => Number(item.product_id) !== Number(productId))
            .slice(0, 4);

        if (!relatedGrid) {
            return;
        }

        if (!relatedProducts.length) {
            relatedGrid.innerHTML = '<p>No related products available yet.</p>';
            return;
        }

        relatedGrid.innerHTML = relatedProducts.map((item) => {
            const itemPrice = Number(item.price || 0).toFixed(2);
            const itemImagePath = item.image_path || 'images/placeholder.jpg';
            return `
                <div class="product-card">
                    <img src="${itemImagePath}" alt="${item.title}" class="product-image">
                    <h3>${item.title || 'Untitled Product'}</h3>
                    <p class="price">$${itemPrice}</p>
                    <p class="description">${item.author || 'Unknown Author'}</p>
                    <a href="Product.html?id=${item.product_id}"><button>View</button></a>
                </div>
            `;
        }).join('');
    } catch (error) {
        primaryGrid.innerHTML = `<p>${error.message || 'Unable to load product right now.'}</p>`;
    }
});
