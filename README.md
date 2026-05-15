# JioMart Clone

A full-stack e-commerce application inspired by JioMart, built with React and Node.js.

## Tech Stack

### Frontend
- **React** (with Vite)
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications
- **React Icons** for icons

### Backend
- **Node.js** with **Express**
- **SQLite** (via better-sqlite3) for database
- **JWT** for authentication
- **bcryptjs** for password hashing

## Features

- Product catalog with categories
- Product search with sorting
- Product detail pages with related products
- User authentication (register/login)
- Shopping cart with quantity management
- Wishlist
- Order placement and history
- Responsive design (mobile-first)
- Banner carousel on homepage
- Category-wise product sections

## Getting Started

### Prerequisites
- Node.js 18+

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd jiomart-clone
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Seed the database**
   ```bash
   npm run seed
   ```

4. **Start the backend server**
   ```bash
   npm start
   ```
   Backend runs on `http://localhost:5000`

5. **Install frontend dependencies** (in a new terminal)
   ```bash
   cd frontend
   npm install
   ```

6. **Start the frontend dev server**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

### Build for Production

```bash
cd frontend
npm run build
```

The backend serves the built frontend files automatically.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| GET | /api/products | List products (with filters) |
| GET | /api/products/featured | Featured products |
| GET | /api/products/by-category | Products grouped by category |
| GET | /api/products/:slug | Product detail |
| GET | /api/categories | List categories |
| GET | /api/categories/:slug | Category detail |
| GET | /api/cart | Get cart items |
| POST | /api/cart/add | Add to cart |
| PUT | /api/cart/update/:id | Update quantity |
| DELETE | /api/cart/remove/:id | Remove from cart |
| DELETE | /api/cart/clear | Clear cart |
| GET | /api/wishlist | Get wishlist |
| POST | /api/wishlist/toggle | Toggle wishlist item |
| DELETE | /api/wishlist/:id | Remove from wishlist |
| GET | /api/orders | Get orders |
| POST | /api/orders | Place order |
| GET | /api/orders/:id | Order detail |
| GET | /api/banners | Get banners |

## Project Structure

```
jiomart-clone/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express server entry
│   │   ├── database.js        # SQLite setup & schema
│   │   ├── seed.js            # Database seeder
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT auth middleware
│   │   └── routes/
│   │       ├── auth.js        # Auth routes
│   │       ├── products.js    # Product routes
│   │       ├── categories.js  # Category routes
│   │       ├── cart.js        # Cart routes
│   │       ├── wishlist.js    # Wishlist routes
│   │       ├── orders.js      # Order routes
│   │       └── banners.js     # Banner routes
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── BannerCarousel.jsx
│   │   │   └── CategorySection.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── CategoryPage.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Wishlist.jsx
│   │   │   └── Orders.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   └── utils/
│   │       └── api.js
│   ├── index.html
│   └── package.json
└── README.md
```
