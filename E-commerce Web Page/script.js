let allProducts = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    updateCartCount();
});

async function fetchProducts() {
    try {
        const response = await fetch('https://cdn.shopify.com/s/files/1/0564/3685/0790/files/multiProduct.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        console.log('Fetched data:', data); // Debugging log
        if (!data.categories) throw new Error('Invalid JSON structure');
        data.categories.forEach(category => {
            category.category_products.forEach(product => {
                product.product_type = category.category_name;
                allProducts.push(product);
            });
        });
        filteredProducts = allProducts;
        displayProducts(filteredProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('products').innerHTML = '<p>Error fetching products. Please try again later.</p>';
    }
}

function displayProducts(products) {
    const productsDiv = document.getElementById('products');
    productsDiv.innerHTML = '';
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product';
        
        const images = [product.image];
        if (product.second_image && product.second_image !== "empty") {
            images.push(product.second_image);
        }

        let imageSliderHTML = '';
        if (images.length > 1) {
            imageSliderHTML = `
                <div class="image-slider">
                    ${images.map((src, index) => `<img src="${src}" class="slide ${index === 0 ? 'active' : ''}" alt="${product.title}">`).join('')}
                    <button class="prev" onclick="changeSlide(-1, this)">&#10094;</button>
                    <button class="next" onclick="changeSlide(1, this)">&#10095;</button>
                </div>
            `;
        } else {
            imageSliderHTML = `<img src="${product.image}" alt="${product.title}" class="single-image">`;
        }
        
        productDiv.innerHTML = `
            <h2>${product.title}</h2>
            ${imageSliderHTML}
            <div class="details">
                <p class="vendor"><strong>${product.vendor}</strong></p>
                <p class="category"><strong>${product.product_type}</strong></p>
                <p class="price">Price: <strong>${product.price}</strong> <span class="compare-at-price">${product.compare_at_price}</span></p>
                ${product.badge_text ? `<p class="badge"><strong>${product.badge_text}</strong></p>` : ''}
            </div>
            <div class="actions">
                <button class="add-to-cart" onclick="addToCart('${product.title}')">Add to Cart</button>
                <button class="buy-now" onclick="buyNow('${product.title}')">Buy Now</button>
            </div>
        `;
        productsDiv.appendChild(productDiv);
    });
}

function filterProducts(category) {
    if (category === 'All') {
        filteredProducts = allProducts;
    } else {
        filteredProducts = allProducts.filter(product => product.product_type === category);
    }
    displayProducts(filteredProducts);
}

function searchProducts() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    filteredProducts = allProducts.filter(product =>
        product.title.toLowerCase().includes(searchTerm) ||
        product.vendor.toLowerCase().includes(searchTerm) ||
        product.product_type.toLowerCase().includes(searchTerm)
    );
    displayProducts(filteredProducts);
}

function addToCart(productTitle) {
    const product = allProducts.find(p => p.title === productTitle);
    const existingProduct = cart.find(item => item.title === productTitle);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        product.quantity = 1;
        cart.push(product);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Product added to cart!');
}

function updateCartCount() {
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
}

function openCart() {
    window.location.href = 'cart.html';
}

function buyNow(productTitle) {
    const product = allProducts.find(p => p.title === productTitle);
    alert(`You bought ${product.title}!`);
}

function changeSlide(n, btn) {
    const slider = btn.parentElement;
    const slides = slider.getElementsByClassName('slide');
    let currentSlide = Array.from(slides).findIndex(slide => slide.classList.contains('active'));
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + n + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
}

function toggleDropdown() {
    const dropdown = document.querySelector('.dropdown-content');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}
