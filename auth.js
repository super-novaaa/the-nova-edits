// auth.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Supabase
    if (!window.SUPABASE_CONFIG || !window.SUPABASE_CONFIG.url) {
        showError('Supabase is not configured. Please update config.js with your project credentials.');
    }

    const supabase = window.supabase.createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.publishableKey || window.SUPABASE_CONFIG.anonKey
    );

    // 2. State Management (Login vs Signup)
    let isLogin = true;

    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const toggleBtn = document.getElementById('toggle-btn');
    const toggleText = document.getElementById('toggle-text');
    const submitBtn = document.getElementById('submit-btn');
    const googleBtnText = document.getElementById('google-btn-text');
    const signupOnlyFields = document.querySelectorAll('.signup-only');
    const authForm = document.getElementById('auth-form');
    const googleAuthBtn = document.getElementById('google-auth-btn');
    const errorContainer = document.getElementById('auth-error');

    toggleBtn.addEventListener('click', () => {
        isLogin = !isLogin;
        errorContainer.style.display = 'none'; // clear errors on toggle

        if (isLogin) {
            title.textContent = 'Welcome Back';
            subtitle.textContent = 'Log in to your account to continue';
            toggleText.textContent = "Don't have an account?";
            toggleBtn.textContent = 'Sign Up';
            submitBtn.textContent = 'Log In';
            googleBtnText.textContent = 'Continue with Google';
            signupOnlyFields.forEach(el => el.style.display = 'none');
            // Remove required attribute from signup fields
            document.getElementById('name').removeAttribute('required');
        } else {
            title.textContent = 'Create an Account';
            subtitle.textContent = 'Join us for premium fashion updates';
            toggleText.textContent = 'Already have an account?';
            toggleBtn.textContent = 'Log In';
            submitBtn.textContent = 'Sign Up';
            googleBtnText.textContent = 'Sign Up with Google';
            signupOnlyFields.forEach(el => el.style.display = 'block');
            // Add required attribute to signup fields
            document.getElementById('name').setAttribute('required', 'true');
        }
    });

    // 3. Handle Form Submission (Email/Password)
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const name = document.getElementById('name').value;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        errorContainer.style.display = 'none';

        try {
            if (isLogin) {
                // LOGIN
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) throw error;

                showSuccess('Login successful! Redirecting...');
                setTimeout(() => window.location.href = 'index.html', 1500);
            } else {
                // SIGNUP
                if (password.length < 8) {
                    showError('Password must be at least 8 characters long.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Sign Up';
                    return;
                }
                const { data, error } = await supabase.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            full_name: name
                        }
                    }
                });

                if (error) throw error;

                if (data.user && data.user.identities && data.user.identities.length === 0) {
                    showError('An account with this email already exists.');
                } else {
                    showSuccess('Signup successful! Check your email to verify your account.');
                    setTimeout(() => window.location.href = 'index.html', 2500);
                }
            }
        } catch (error) {
            showError(error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = isLogin ? 'Log In' : 'Sign Up';
        }
    });

    // 4. Handle Google Auth
    googleAuthBtn.addEventListener('click', async () => {
        try {
            googleAuthBtn.disabled = true;
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/index.html'
                }
            });
            if (error) throw error;
            // The page will redirect to Google
        } catch (error) {
            showError(error.message);
            googleAuthBtn.disabled = false;
        }
    });

    // Utility Functions
    function showError(message) {
        errorContainer.textContent = message;
        errorContainer.className = 'auth-error';
        errorContainer.style.display = 'block';
    }

    function showSuccess(message) {
        errorContainer.textContent = message;
        errorContainer.className = 'auth-success';
        errorContainer.style.display = 'block';
    }
});
