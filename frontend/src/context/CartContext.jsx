import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0, savings: 0, itemCount: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], total: 0, savings: 0, itemCount: 0 });
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      setCart(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) return false;
    try {
      await api.post('/cart/add', { productId, quantity });
      await fetchCart();
      return true;
    } catch {
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await api.put(`/cart/update/${itemId}`, { quantity });
      await fetchCart();
    } catch {
      // ignore
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await api.delete(`/cart/remove/${itemId}`);
      await fetchCart();
    } catch {
      // ignore
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      await fetchCart();
    } catch {
      // ignore
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
