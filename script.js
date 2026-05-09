// Simple JavaScript for interactive elements
document.addEventListener('DOMContentLoaded', function() {
    // --- Mobile Navigation Overlay ---
    const navElement = document.querySelector('nav ul');
    let mobileNav = null;
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (navElement && menuToggle) {
        const navLinksHTML = navElement.innerHTML;
        mobileNav = document.createElement('div');
        mobileNav.className = 'mobile-nav-overlay';
        mobileNav.innerHTML = `<ul>${navLinksHTML}</ul>`;
        document.body.appendChild(mobileNav);

        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            mobileNav.classList.toggle('active');
            const icon = this.querySelector('i');
            if (mobileNav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
                document.body.style.overflow = '';
            }
        });
    }

    // --- Favourites and Cart State Management ---
    let favourites = [];
    let cart = [];
    let userId = null;

    function updateBadges() {
        const favBadge = document.querySelector('.favourite-badge');
        const cartBadge = document.querySelector('.cart-badge');
        if (favBadge) favBadge.textContent = favourites.length;
        if (cartBadge) cartBadge.textContent = cart.length;
    }

    function updateUIStates() {
        const favSet = new Set(favourites);
        const cartSet = new Set(cart);

        document.querySelectorAll('.favourite-icon').forEach(function(icon) {
            const productCard = icon.closest('.product-card');
            if (!productCard) return;
            const productName = productCard.querySelector('h3').textContent;
            let i = icon.querySelector('i');
            
            if (favSet.has(productName)) {
                i.classList.remove('fa-regular');
                i.classList.add('fa-solid');
                icon.classList.add('active');
                icon.title = 'Remove from favourites';
            } else {
                i.classList.remove('fa-solid');
                i.classList.add('fa-regular');
                icon.classList.remove('active');
                icon.title = 'Add to favourites';
            }
        });

        document.querySelectorAll('.add-to-cart').forEach(function(button) {
            const productCard = button.closest('.product-card');
            if (!productCard) return;
            const productName = productCard.querySelector('h3').textContent;
            
            if (cartSet.has(productName)) {
                button.textContent = 'Added';
                button.disabled = true;
            } else {
                button.textContent = 'Add to Cart';
                button.disabled = false;
            }
        });
    }

    async function saveToSupabase(table, productName, isAdding) {
        if (!userId || !window.supabaseClient) return;
        if (isAdding) {
            await window.supabaseClient.from(table).insert([{ user_id: userId, product_name: productName }]);
        } else {
            await window.supabaseClient.from(table).delete().match({ user_id: userId, product_name: productName });
        }
    }

    async function initSupabaseState() {
        if (!window.supabaseClient) return;
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (session && session.user) {
            userId = session.user.id;
            
            // Fetch favourites
            const favRes = await window.supabaseClient.from('favorites').select('product_name').eq('user_id', userId);
            if (favRes.data) favourites = favRes.data.map(f => f.product_name);
            
            // Fetch cart
            const cartRes = await window.supabaseClient.from('cart').select('product_name').eq('user_id', userId);
            if (cartRes.data) cart = cartRes.data.map(c => c.product_name);
            
            updateBadges();
            updateUIStates();
        }
    }

    // Call init
    initSupabaseState();

    // --- Favourites Functionality ---
    document.querySelectorAll('.favourite-icon').forEach(function(icon) {
        icon.addEventListener('click', async function() {
            if (!userId) {
                alert('Please log in to add items to your favourites.');
                window.location.href = 'auth.html';
                return;
            }

            const productCard = icon.closest('.product-card');
            if (!productCard) return;
            const productName = productCard.querySelector('h3').textContent;

            if (favourites.includes(productName)) {
                // Remove from favourites
                favourites = favourites.filter(fav => fav !== productName);
                await saveToSupabase('favorites', productName, false);
            } else {
                // Add to favourites
                favourites.push(productName);
                await saveToSupabase('favorites', productName, true);
            }
            updateBadges();
            updateUIStates();
        });
    });

    // --- Cart Functionality ---
    document.querySelectorAll('.add-to-cart').forEach(function(button) {
        button.addEventListener('click', async function() {
            if (!userId) {
                alert('Please log in to add items to your cart.');
                window.location.href = 'auth.html';
                return;
            }

            const productCard = button.closest('.product-card');
            if (!productCard) return;
            const productName = productCard.querySelector('h3').textContent;
            
            if (!cart.includes(productName)) {
                cart.push(productName);
                await saveToSupabase('cart', productName, true);
                updateBadges();
                updateUIStates();
            }
        });
    });

    // Set initial states
    updateUIStates();

    // --- Icon Clicks in Header ---
    const favBtn = document.querySelector('.favourite');
    if (favBtn) {
        favBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'favourites.html';
        });
    }
    
    // Initial badge update
    updateBadges();



    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') {
                e.preventDefault();
                return;
            }
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (mobileNav && mobileNav.classList.contains('active') && menuToggle) {
                    menuToggle.click();
                }
            }
        });
    });

    // Persistent Countdown timer for sale
    function updateCountdown() {
        let saleEndStr = localStorage.getItem('saleEnd');
        let saleEnd;
        
        if (!saleEndStr) {
            saleEnd = new Date();
            saleEnd.setDate(saleEnd.getDate() + 7);
            localStorage.setItem('saleEnd', saleEnd.toISOString());
        } else {
            saleEnd = new Date(saleEndStr);
        }
        
        const now = new Date();
        const diff = saleEnd - now;
        
        // Reset if passed
        if (diff <= 0) {
            saleEnd = new Date();
            saleEnd.setDate(saleEnd.getDate() + 7);
            localStorage.setItem('saleEnd', saleEnd.toISOString());
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const countdownElement = document.querySelector('.sale-off .countdown');
        if (countdownElement && days >= 0) {
            countdownElement.innerHTML = `Sale ends in: ${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
    }
    
    const saleOffElement = document.querySelector('.sale-off');
    if (saleOffElement) {
        if (!saleOffElement.querySelector('.countdown')) {
            const countdownElement = document.createElement('span');
            countdownElement.className = 'countdown';
            saleOffElement.appendChild(countdownElement);
        }
        setInterval(updateCountdown, 1000);
        updateCountdown(); 
    }

    // Scroll Reveal Animations
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.feature-card, .product-card, .section-title, .newsletter').forEach(el => {
            el.classList.add('fade-in-section');
            observer.observe(el);
        });
    }

    // --- Newsletter Subscription ---
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const emailInput = document.getElementById('newsletter-email');
            const messageDiv = document.getElementById('newsletter-message');
            const submitBtn = document.getElementById('newsletter-submit');
            
            const email = emailInput.value.trim();
            if (!email) return;

            // Optional regex for client-side validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                messageDiv.textContent = 'Please enter a valid email address.';
                messageDiv.style.color = '#ef4444';
                return;
            }

            submitBtn.textContent = 'Subscribing...';
            submitBtn.disabled = true;
            messageDiv.textContent = '';
            messageDiv.style.color = 'var(--text-primary)';

            try {
                if (!window.supabaseClient) {
                    throw new Error("Supabase client not initialized.");
                }

                const { error } = await window.supabaseClient
                    .from('newsletter_subscribers')
                    .insert([{ email: email }]);

                if (error) {
                    if (error.code === '23505') { // Postgres unique constraint violation
                        messageDiv.textContent = "You're already subscribed to our newsletter!";
                    } else {
                        throw error;
                    }
                } else {
                    messageDiv.textContent = 'Thanks for subscribing to our newsletter!';
                    emailInput.value = '';
                }
            } catch (error) {
                console.error("Newsletter error:", error);
                messageDiv.textContent = 'An error occurred. Please try again later.';
                messageDiv.style.color = '#ef4444'; // Error red
            } finally {
                submitBtn.textContent = 'Subscribe';
                submitBtn.disabled = false;
            }
        });
    }
});