// Initialize globally so other scripts can access it before DOMContentLoaded
if (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url) {
    window.supabaseClient = window.supabase.createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.publishableKey || window.SUPABASE_CONFIG.anonKey
    );
} else {
    console.warn('Supabase is not configured properly in config.js');
}

// session.js
document.addEventListener('DOMContentLoaded', async () => {
    if (!window.supabaseClient) return;
    const supabase = window.supabaseClient;

    // Clean up the messy URL if it contains the access token hash
    if (window.location.hash && window.location.hash.includes('access_token')) {
        // Wait a brief moment to ensure Supabase's internal code reads the token first
        setTimeout(() => {
            history.replaceState(null, null, window.location.pathname + window.location.search);
        }, 500);
    }

    // Find the user navigation link in the header
    const userNavLink = document.getElementById('user-nav-link');
    
    // Function to update the User Icon in the header based on login status
    const updateUIForUser = (user) => {
        if (!userNavLink) return; // Only update if the header icon exists on this page

        if (user) {
            // Get Google profile picture or fallback to initials
            const avatarUrl = user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.user_metadata?.full_name || 'User') + '&background=random';
            
            // User IS logged in: Change icon to profile picture with dropdown
            const profileMenu = document.createElement('div');
            profileMenu.className = 'profile-menu-container';

            const img = document.createElement('img');
            img.src = avatarUrl;
            img.className = 'profile-pic';
            img.alt = 'Profile';

            const dropdown = document.createElement('div');
            dropdown.className = 'profile-dropdown';

            const header = document.createElement('div');
            header.className = 'dropdown-header';
            const strongName = document.createElement('strong');
            strongName.textContent = user.user_metadata?.full_name || 'User'; // SAFE
            header.appendChild(strongName);

            const accountLink = document.createElement('a');
            accountLink.href = 'account.html';
            accountLink.innerHTML = '<i class="fa-solid fa-gear"></i> Account Settings';

            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.id = 'logout-btn';
            logoutLink.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i> Sign Out';

            dropdown.append(header, accountLink, logoutLink);
            profileMenu.append(img, dropdown);

            userNavLink.innerHTML = '';
            userNavLink.appendChild(profileMenu);
            userNavLink.title = '';
            userNavLink.href = '#'; 
            userNavLink.classList.add('logged-in');
            
            // Attach Logout functionality
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.onclick = async (e) => {
                    e.preventDefault();
                    e.stopPropagation(); // prevent triggering the userNavLink
                    await supabase.auth.signOut();
                    
                    // Clear the local storage cache so another user doesn't see these items
                    localStorage.removeItem('cart');
                    localStorage.removeItem('favourites');
                    
                    window.location.reload(); 
                };
            }
        } else {
            // User is NOT logged in: Reset to default state
            userNavLink.innerHTML = '<i class="fa-regular fa-user"></i>';
            userNavLink.title = 'Login / Sign Up';
            userNavLink.href = 'auth.html';
            userNavLink.onclick = null;
            userNavLink.classList.remove('logged-in');
        }
    };

    // 1. Check if the user is already logged in on initial page load
    const { data: { session } } = await supabase.auth.getSession();
    updateUIForUser(session?.user);

    // 2. Listen for any authentication state changes (e.g., successful login, logout)
    supabase.auth.onAuthStateChange((event, session) => {
        updateUIForUser(session?.user);
        
        if (event === 'SIGNED_OUT') {
            localStorage.removeItem('cart');
            localStorage.removeItem('favourites');
        }
        
        // If we detect a login while currently sitting on the auth.html page, redirect to home!
        if (event === 'SIGNED_IN' && window.location.pathname.includes('auth.html')) {
            window.location.href = 'index.html';
        }
    });
});
