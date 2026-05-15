import { Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, fetchCart } = useCart();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <FiShoppingBag className="mx-auto text-gray-300 mb-4" size={80} />
        <h2 className="text-2xl font-bold text-gray-600 mb-2">Please login to view your cart</h2>
        <Link to="/login" className="btn-primary inline-block mt-4">Login</Link>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <FiShoppingBag className="mx-auto text-gray-300 mb-4" size={80} />
        <h2 className="text-2xl font-bold text-gray-600 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-6">Add items to your cart to get started.</p>
        <Link to="/" className="btn-primary inline-block">Start Shopping</Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    try {
      const { data } = await api.post('/orders', { paymentMethod: 'cod' });
      toast.success('Order placed successfully!');
      await fetchCart();
    } catch {
      toast.error('Failed to place order');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Shopping Cart ({cart.itemCount} items)</h1>
        <button
          onClick={clearCart}
          className="text-red-500 text-sm hover:underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
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
                <div className="text-sm text-gray-500 mt-0.5">{item.brand} | {item.unit}</div>

                <div className="flex items-center gap-3 mt-2">
                  <span className="font-bold text-lg">&#8377;{item.price}</span>
                  {item.mrp && item.mrp > item.price && (
                    <span className="text-sm text-gray-400 line-through">&#8377;{item.mrp}</span>
                  )}
                  {item.discount_percent > 0 && (
                    <span className="text-green-600 text-sm font-semibold">{Math.round(item.discount_percent)}% off</span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                    >
                      <FiMinus size={14} />
                    </button>
                    <span className="w-10 h-8 flex items-center justify-center border-x text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                    title="Remove"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm sticky top-20">
            <h3 className="text-lg font-bold mb-4">Order Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({cart.itemCount} items)</span>
                <span className="font-semibold">&#8377;{cart.total.toFixed(2)}</span>
              </div>
              {cart.savings > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>You Save</span>
                  <span className="font-semibold">-&#8377;{cart.savings.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className="text-green-600 font-semibold">FREE</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-base">
                <span className="font-bold">Total</span>
                <span className="font-bold text-lg">&#8377;{cart.total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="w-full btn-primary mt-6 py-3 flex items-center justify-center gap-2"
            >
              Place Order <FiArrowRight size={16} />
            </button>

            <Link to="/" className="block text-center text-sm text-[#0078ad] mt-3 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
