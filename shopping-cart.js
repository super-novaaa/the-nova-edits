// Shopping Cart Page Logic

document.addEventListener('DOMContentLoaded', function () {
    const TAX_RATE = 0.08;
    let cart = [];
    let userId = null;

    async function initSupabaseCart() {
        if (!window.supabaseClient) return;
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (session && session.user) {
            userId = session.user.id;
            
            // Fetch cart
            const cartRes = await window.supabaseClient.from('cart').select('product_name').eq('user_id', userId);
            if (cartRes.data) {
                cart = cartRes.data.map(c => c.product_name);
                renderCart(); // Re-render once data is loaded
            }
        } else {
            // Not logged in, redirect
            window.location.href = 'auth.html';
        }
    }

    initSupabaseCart();

    function getCartProducts() {
        return window.allProducts.filter(p => cart.includes(p.name));
    }

    function renderCart() {
        const cartItemsDiv = document.getElementById('cart-items');
        const cartSummaryDiv = document.getElementById('cart-summary');
        const cartProducts = getCartProducts();
        
        if (cartProducts.length === 0) {
            cartItemsDiv.innerHTML = '<div id="empty-cart">Your cart is empty.</div>';
            cartSummaryDiv.innerHTML = '';
            return;
        }
        
        let itemsHTML = '';
        cartProducts.forEach(product => {
            itemsHTML += `<div class="cart-item">
                <img class="cart-item-img" src="${product.img}" alt="${product.name}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${product.name}</div>
                    <div class="cart-item-price">$${product.price.toFixed(2)}</div>
                </div>
                <button class="cart-item-remove" data-name="${product.name}" title="Remove"><i class="fa-solid fa-trash"></i></button>
            </div>`;
        });
        cartItemsDiv.innerHTML = itemsHTML;

        // Summary
        let subtotal = cartProducts.reduce((sum, p) => sum + p.price, 0);
        let tax = subtotal * TAX_RATE;
        let total = subtotal + tax;
        cartSummaryDiv.innerHTML = `
            <h2>Order Summary</h2>
            <div class="summary-row"><span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span></div>
            <div class="summary-row"><span>Tax (${(TAX_RATE * 100)}%):</span><span>$${tax.toFixed(2)}</span></div>
            <div class="summary-total"><span>Total:</span><span>$${total.toFixed(2)}</span></div>
            <button id="order-now">Order Now</button>
        `;
    }

    // Event Delegation for dynamically created buttons
    document.body.addEventListener('click', async function(e) {
        // Remove item
        const removeBtn = e.target.closest('.cart-item-remove');
        if (removeBtn) {
            const name = removeBtn.getAttribute('data-name');
            cart = cart.filter(n => n !== name);
            if (userId && window.supabaseClient) {
                await window.supabaseClient.from('cart').delete().match({ user_id: userId, product_name: name });
            }
            renderCart();
            return;
        }

        // Order Now
        const orderBtn = e.target.closest('#order-now');
        if (orderBtn) {
            alert('Order placed successfully!');
            cart = [];
            if (userId && window.supabaseClient) {
                await window.supabaseClient.from('cart').delete().eq('user_id', userId);
            }
            renderCart();
            return;
        }
    });
});
