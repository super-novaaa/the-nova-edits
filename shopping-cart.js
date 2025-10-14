// Shopping Cart Page Logic

document.addEventListener('DOMContentLoaded', function() {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    let allProducts = [
        {
            name: "Bomber Jacket",
            price: 89.99,
            img: "https://i.ibb.co/JWvYfGNr/Gemini-Generated-Image-oyxtgoyxtgoyxtgokj.png"
        },
        {
            name: "Formal Shirt",
            price: 49.99,
            img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1036&q=80"
        },
        {
            name: "Slim Fit Jeans",
            price: 59.99,
            img: "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=0699&q=80"
        }
    ];

    function getCartProducts() {
        return allProducts.filter(p => cart.includes(p.name));
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
        let tax = subtotal * 0.08;
        let total = subtotal + tax;
        cartSummaryDiv.innerHTML = `
            <h2>Order Summary</h2>
            <div class="summary-row"><span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span></div>
            <div class="summary-row"><span>Tax (8%):</span><span>$${tax.toFixed(2)}</span></div>
            <div class="summary-total"><span>Total:</span><span>$${total.toFixed(2)}</span></div>
            <button id="order-now">Order Now</button>
        `;

        // Remove item
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const name = this.getAttribute('data-name');
                cart = cart.filter(n => n !== name);
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCart();
            });
        });

        // Order Now
        document.getElementById('order-now').onclick = function() {
            alert('Order placed successfully!');
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
        };
    }

    renderCart();
});
