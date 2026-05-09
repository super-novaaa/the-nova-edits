// Favourites Page Logic

document.addEventListener('DOMContentLoaded', function () {
    let favourites = [];
    let userId = null;

    async function initSupabaseFav() {
        if (!window.supabaseClient) return;
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (session && session.user) {
            userId = session.user.id;
            
            // Fetch favourites
            const favRes = await window.supabaseClient.from('favorites').select('product_name').eq('user_id', userId);
            if (favRes.data) {
                favourites = favRes.data.map(f => f.product_name);
                renderFavs();
            }
        } else {
            // Not logged in, redirect
            window.location.href = 'auth.html';
        }
    }

    initSupabaseFav();

    function getFavProducts() {
        return window.allProducts.filter(p => favourites.includes(p.name));
    }

    function renderFavs() {
        const favItemsDiv = document.getElementById('fav-items');
        const favProducts = getFavProducts();
        
        if (favProducts.length === 0) {
            favItemsDiv.innerHTML = '<div style="text-align: center; color: #64748b; padding: 40px;">You haven\'t favourited any items yet.</div>';
            return;
        }
        
        let itemsHTML = '';
        favProducts.forEach(product => {
            itemsHTML += `<div class="cart-item" style="display: flex; align-items: center; justify-content: space-between; padding: 16px; border-bottom: 1px solid #e2e8f0;">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <img src="${product.img}" alt="${product.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                    <div>
                        <div style="font-weight: 600; font-size: 1.1rem; color: #0f172a;">${product.name}</div>
                        <div style="color: #64748b; margin-top: 4px;">$${product.price.toFixed(2)}</div>
                    </div>
                </div>
                <button class="fav-item-remove" data-name="${product.name}" title="Remove from Favourites"><i class="fa-solid fa-heart-crack"></i></button>
            </div>`;
        });
        favItemsDiv.innerHTML = itemsHTML;
    }

    // Event Delegation for dynamically created buttons
    document.body.addEventListener('click', async function(e) {
        // Remove item
        const removeBtn = e.target.closest('.fav-item-remove');
        if (removeBtn) {
            const name = removeBtn.getAttribute('data-name');
            favourites = favourites.filter(n => n !== name);
            
            if (userId && window.supabaseClient) {
                await window.supabaseClient.from('favorites').delete().match({ user_id: userId, product_name: name });
            }
            
            renderFavs();
        }
    });
});
