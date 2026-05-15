const express = require('express');
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.userId);

    const result = orders.map(order => {
      const items = db.prepare(`
        SELECT oi.*, p.name, p.slug, p.image, p.brand
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).all(order.id);

      return { ...order, items };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.post('/', (req, res) => {
  try {
    const { addressId, paymentMethod = 'cod' } = req.body;

    const cartItems = db.prepare(`
      SELECT ci.*, p.price, p.name FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(req.userId);

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const createOrder = db.transaction(() => {
      const orderResult = db.prepare(
        'INSERT INTO orders (user_id, address_id, total, payment_method) VALUES (?, ?, ?, ?)'
      ).run(req.userId, addressId || null, total, paymentMethod);

      const orderId = orderResult.lastInsertRowid;

      const insertItem = db.prepare(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
      );

      for (const item of cartItems) {
        insertItem.run(orderId, item.product_id, item.quantity, item.price);
      }

      db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.userId);

      return orderId;
    });

    const orderId = createOrder();
    res.status(201).json({ message: 'Order placed successfully', orderId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = db.prepare(`
      SELECT oi.*, p.name, p.slug, p.image, p.brand
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(order.id);

    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

module.exports = router;
