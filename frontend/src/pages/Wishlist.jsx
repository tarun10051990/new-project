import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchWishlist = async () => {
      try {
        const { data } = await api.get('/wishlist');
        setItems(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user]);

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/wishlist/${itemId}`);
      setItems(items.filter((i) => i.id !== itemId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const moveToCart = async (item) => {
    const success = await addToCart(item.product_id);
    if (success) {
      await removeItem(item.id);
      toast.success('Moved to cart!');
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <FiHeart className="mx-auto text-gray-300 mb-4" size={80} />
        <h2 className="text-2xl font-bold text-gray-600 mb-2">Please login to view your wishlist</h2>
        <Link to="/login" className="btn-primary inline-block mt-4">Login</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <FiHeart className="mx-auto text-gray-300 mb-4" size={80} />
        <h2 className="text-2xl font-bold text-gray-600 mb-2">Your wishlist is empty</h2>
        <p className="text-gray-400 mb-6">Save items you love for later.</p>
        <Link to="/" className="btn-primary inline-block">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Wishlist ({items.length} items)</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-4">
            <Link to={`/product/${item.slug}`} className="flex-shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 object-contain bg-gray-50 rounded-lg"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Product'; }}
              />
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/product/${item.slug}`}>
                <h3 className="font-semibold text-gray-800 truncate hover:text-[#0078ad]">{item.name}</h3>
              </Link>
              <div className="text-sm text-gray-500">{item.brand}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold">&#8377;{item.price}</span>
                {item.mrp && item.mrp > item.price && (
                  <span className="text-sm text-gray-400 line-through">&#8377;{item.mrp}</span>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => moveToCart(item)}
                  className="text-xs bg-[#0078ad] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-[#006090]"
                >
                  <FiShoppingCart size={12} /> Move to Cart
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-xs text-red-500 px-2 py-1.5 rounded-lg hover:bg-red-50"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
