# The Nova Edits

A premium, luxury editorial e-commerce platform built with vanilla web technologies and powered by Supabase. The Nova Edits blends high-fashion aesthetics with modern web performance, featuring a fully responsive design, seamless user authentication, and interactive shopping features.

## ✨ Features

*   **Luxury Editorial Design:** A cohesive, warm-toned design system utilizing premium typography (Cormorant Garamond, Outfit, Barlow Condensed) and fluid, responsive layouts.
*   **User Authentication:** Secure email/password and Google OAuth login powered by Supabase.
*   **Shopping Cart & Favourites:** Persistent, user-specific cart and favourites management, synced in real-time with the database.
*   **Newsletter Integration:** Built-in newsletter subscription system with client-side validation and duplicate-entry handling.
*   **Dynamic UI State:** Intelligent DOM updates utilizing `Set` data structures for lightning-fast `O(1)` state lookups.
*   **DevSecOps Hardened:** Protected against DOM-based XSS, optimized for memory efficiency (event delegation), and structured using DRY principles.

## 🛠️ Tech Stack

*   **Frontend:** HTML5, CSS3 (Variables, Grid, Flexbox), Vanilla JavaScript (ES6+).
*   **Backend / BaaS:** [Supabase](https://supabase.com/) (PostgreSQL Database, Authentication).
*   **Icons:** FontAwesome.
*   **Fonts:** Google Fonts.

## 🚀 Getting Started

### Prerequisites

To run this project, you will need a Supabase account and a local web server (like the VS Code Live Server extension).

### 1. Database Setup

Create the following tables in your Supabase SQL Editor:

```sql
-- Newsletter Subscribers
CREATE TABLE public.newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Favourites (Wishlist)
CREATE TABLE public.favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  product_name text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Shopping Cart
CREATE TABLE public.cart (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  product_name text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

**Crucial Security Step:** Ensure you enable Row Level Security (RLS) on the `cart` and `favorites` tables so users can only access their own data:

```sql
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own cart" ON public.cart FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Newsletter can be open for inserts
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous inserts" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
```

### 2. Project Configuration

Update the `config.js` file in the root directory with your Supabase credentials:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_PUBLISHABLE_KEY = 'YOUR_SUPABASE_ANON_KEY';

window.SUPABASE_CONFIG = {
    url: SUPABASE_URL,
    publishableKey: SUPABASE_PUBLISHABLE_KEY
};
```

### 3. Run Locally

Serve the project folder using a local web server. 
*   If using VS Code, install the **Live Server** extension, right-click `index.html`, and select "Open with Live Server".

## 📂 Project Structure

*   `index.html`: The main storefront and hero page.
*   `auth.html`: User login and registration portal.
*   `shopping-cart.html` & `favourites.html`: User-specific dashboard pages.
*   `style.css`: The central design system and responsive style rules.
*   `script.js`: Global UI interactions, animations, and newsletter logic.
*   `session.js`: Global Supabase authentication listener and profile UI renderer.
*   `products.js`: The shared product catalog data.

## 🛡️ Security & Performance

This project has undergone rigorous DevSecOps auditing:
*   **XSS Prevention:** Strict use of `document.createElement()` and `textContent` over `innerHTML` when handling user-provided data.
*   **Memory Management:** Heavy use of DOM Event Delegation to prevent memory leaks during UI re-renders.
*   **Time Complexity:** Usage of JavaScript `Sets` guarantees UI rendering loops scale efficiently as the catalog grows.