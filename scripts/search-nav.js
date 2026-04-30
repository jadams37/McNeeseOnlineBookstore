window.addEventListener('DOMContentLoaded', () => {
    const searchContainers = document.querySelectorAll('.nav-center .search');

    const goToResults = (query) => {
        const params = new URLSearchParams();
        if (query) {
            params.set('q', query);
        }

        const queryString = params.toString();
        window.location.href = queryString ? `results.html?${queryString}` : 'results.html';
    };

    searchContainers.forEach((container) => {
        const input = container.querySelector('.search-input');
        if (!input) {
            return;
        }

        const submitSearch = () => {
            const query = input.value.trim();
            goToResults(query);
        };

        const form = input.closest('form');
        if (form) {
            if (!input.getAttribute('name')) {
                input.setAttribute('name', 'q');
            }

            form.addEventListener('submit', (event) => {
                event.preventDefault();
                submitSearch();
            });
        }

        input.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' || form) {
                return;
            }

            event.preventDefault();
            submitSearch();
        });

        const icon = container.querySelector('.search-icon');
        if (icon) {
            icon.style.cursor = 'pointer';
            icon.addEventListener('click', submitSearch);
        }
    });
});
