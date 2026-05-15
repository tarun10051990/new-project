const express = require('express');
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', (req, res) => {
  try {
    const items = db.prepare(`
      SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.slug, p.price, p.mrp,
             p.discount_percent, p.image, p.unit, p.weight, p.brand, p.in_stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `).all(req.userId);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const savings = items.reduce((sum, item) => sum + ((item.mrp || item.price) - item.price) * item.quantity, 0);

    res.json({ items, total, savings, itemCount: items.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

router.post('/add', (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existing = db.prepare('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?').get(req.userId, productId);

    if (existing) {
      db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?').run(quantity, existing.id);
    } else {
      db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)').run(req.userId, productId, quantity);
    }

    res.json({ message: 'Item added to cart' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

router.put('/update/:itemId', (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (quantity < 1) {
      db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(itemId, req.userId);
      return res.json({ message: 'Item removed from cart' });
    }

    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?').run(quantity, itemId, req.userId);
    res.json({ message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

router.delete('/remove/:itemId', (req, res) => {
  try {
    db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(req.params.itemId, req.userId);
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

router.delete('/clear', (req, res) => {
  try {
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.userId);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;
