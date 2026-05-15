import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiMapPin, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-[#0078ad] sticky top-0 z-50">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 gap-4">
          {/* Mobile menu button */}
          <button
            className="lg:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-[#0078ad] font-bold text-lg">J</span>
              </div>
              <span className="text-white font-bold text-xl hidden sm:block">JioMart</span>
            </div>
          </Link>

          {/* Location */}
          <div className="hidden md:flex items-center text-white text-sm gap-1 cursor-pointer hover:opacity-80">
            <FiMapPin size={16} />
            <div>
              <div className="text-xs opacity-80">Deliver to</div>
              <div className="font-semibold">Mumbai 400001</div>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for groceries, electronics, fashion..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-3 sm:gap-5">
            <Link to="/wishlist" className="text-white hover:opacity-80 hidden sm:block" title="Wishlist">
              <FiHeart size={22} />
            </Link>

            <Link to="/cart" className="text-white hover:opacity-80 relative" title="Cart">
              <FiShoppingCart size={22} />
              {cart.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-[#0078ad] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.itemCount}
                </span>
              )}
            </Link>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="text-white hover:opacity-80 flex items-center gap-1"
              >
                <FiUser size={22} />
                {user && <span className="hidden sm:block text-sm">{user.name.split(' ')[0]}</span>}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b">
                        <div className="font-semibold text-sm">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                      <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>My Orders</Link>
                      <Link to="/wishlist" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Wishlist</Link>
                      <button onClick={() => { logout(); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Logout</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Login</Link>
                      <Link to="/register" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Register</Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="category-scroll py-2">
            {[
              { name: 'Groceries', slug: 'fruits-vegetables', icon: '🥬' },
              { name: 'Dairy', slug: 'dairy-bakery', icon: '🥛' },
              { name: 'Staples', slug: 'staples', icon: '🌾' },
              { name: 'Snacks', slug: 'snacks-beverages', icon: '🍿' },
              { name: 'Personal Care', slug: 'personal-care', icon: '🧴' },
              { name: 'Home Care', slug: 'home-care', icon: '🏠' },
              { name: 'Electronics', slug: 'electronics', icon: '📱' },
              { name: 'Fashion', slug: 'fashion', icon: '👕' },
              { name: 'Beauty', slug: 'beauty', icon: '💄' },
              { name: 'Home & Kitchen', slug: 'home-kitchen', icon: '🍳' },
              { name: 'Baby Care', slug: 'baby-care', icon: '👶' },
            ].map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:text-[#0078ad] hover:bg-blue-50 rounded-full whitespace-nowrap transition-colors"
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t absolute w-full shadow-lg z-50">
          <div className="p-4 space-y-2">
            {user ? (
              <>
                <div className="p-3 bg-gray-50 rounded-lg mb-3">
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                <Link to="/orders" className="block p-2 hover:bg-gray-50 rounded" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
                <Link to="/wishlist" className="block p-2 hover:bg-gray-50 rounded" onClick={() => setMobileMenuOpen(false)}>Wishlist</Link>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full text-left p-2 text-red-600 hover:bg-gray-50 rounded">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block p-2 hover:bg-gray-50 rounded" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block p-2 hover:bg-gray-50 rounded" onClick={() => setMobileMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
