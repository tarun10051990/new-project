import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage } from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders');
        setOrders(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <FiPackage className="mx-auto text-gray-300 mb-4" size={80} />
        <h2 className="text-2xl font-bold text-gray-600 mb-2">Please login to view your orders</h2>
        <Link to="/login" className="btn-primary inline-block mt-4">Login</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <FiPackage className="mx-auto text-gray-300 mb-4" size={80} />
        <h2 className="text-2xl font-bold text-gray-600 mb-2">No orders yet</h2>
        <p className="text-gray-400 mb-6">Your order history will appear here.</p>
        <Link to="/" className="btn-primary inline-block">Start Shopping</Link>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="font-semibold text-gray-800">Order #{order.id}</div>
                <div className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <span className="font-bold text-lg">&#8377;{order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {order.items.map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.slug}`}
                  className="flex items-center gap-3 bg-gray-50 rounded-lg p-2 pr-4 hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-contain rounded"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/50?text=P'; }}
                  />
                  <div>
                    <div className="text-sm font-medium truncate max-w-[150px]">{item.name}</div>
                    <div className="text-xs text-gray-500">Qty: {item.quantity} | &#8377;{item.price}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
