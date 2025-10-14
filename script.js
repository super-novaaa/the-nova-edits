// Simple JavaScript for interactive elements
document.addEventListener('DOMContentLoaded', function() {
    // --- Favourites and Cart State Management ---
    let favourites = JSON.parse(localStorage.getItem('favourites') || '[]');
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    function updateBadges() {
        document.querySelector('.favourite-badge').textContent = favourites.length;
        document.querySelector('.cart-badge').textContent = cart.length;
    }

    // --- Favourites Functionality ---
    document.querySelectorAll('.favourite-icon').forEach(function(icon, idx) {
        const productCard = icon.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        // Set initial state
        if (favourites.includes(productName)) {
            let i = icon.querySelector('i');
            i.classList.remove('fa-regular');
            i.classList.add('fa-solid');
            i.style.color = '#e74c3c';
            icon.title = 'Remove from favourites';
        }
        icon.addEventListener('click', function() {
            let i = this.querySelector('i');
            if (favourites.includes(productName)) {
                // Remove from favourites
                favourites = favourites.filter(fav => fav !== productName);
                i.classList.remove('fa-solid');
                i.classList.add('fa-regular');
                i.style.color = '';
                this.title = 'Add to favourites';
            } else {
                // Add to favourites
                favourites.push(productName);
                i.classList.remove('fa-regular');
                i.classList.add('fa-solid');
                i.style.color = '#e74c3c';
                this.title = 'Remove from favourites';
            }
            localStorage.setItem('favourites', JSON.stringify(favourites));
            updateBadges();
        });
    });

    // --- Cart Functionality ---
    document.querySelectorAll('.add-to-cart').forEach(function(button) {
        const productCard = button.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        // Set initial state (disable if already in cart)
        if (cart.includes(productName)) {
            button.textContent = 'Added';
            button.disabled = true;
        }
        button.addEventListener('click', function() {
            if (!cart.includes(productName)) {
                cart.push(productName);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateBadges();
                button.textContent = 'Added';
                button.disabled = true;
            }
        });
    });

    // --- Icon Clicks in Header ---
    document.querySelector('.favourite').addEventListener('click', function(e) {
        e.preventDefault();
        alert('Favourites: ' + (favourites.length ? favourites.join(', ') : 'None'));
    });
    document.querySelector('.shopping-cart').addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'shopping-cart.html';
    });

    // Initial badge update
    updateBadges();

    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input').value;
        if (email) {
            alert(`Thank you for subscribing with ${email}!`);
            this.reset();
        } else {
            alert('Please enter a valid email address.');
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Countdown timer for sale
    function updateCountdown() {
        const saleEnd = new Date();
        saleEnd.setDate(saleEnd.getDate() + 7); // Sale ends in 7 days
        
        const now = new Date();
        const diff = saleEnd - now;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const countdownElement = document.querySelector('.sale-off');
        if (countdownElement && days >= 0) {
            countdownElement.innerHTML = `Min. 35-70% Off<br><small>Sale ends in: ${days}d ${hours}h ${minutes}m ${seconds}s</small>`;
        }
    }
    
    // Create and add countdown element if it doesn't exist
    const saleOffElement = document.querySelector('.sale-off');
    if (saleOffElement) {
        const countdownElement = document.createElement('div');
        countdownElement.className = 'countdown';
        saleOffElement.appendChild(countdownElement);
        
        // Update countdown every second
        setInterval(updateCountdown, 1000);
        updateCountdown(); // Initial call
    }

    // Product image zoom effect
    const productImages = document.querySelectorAll('.product-img img');
    productImages.forEach(img => {
        img.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.transition = 'transform 0.5s ease';
        });
        
        img.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
});