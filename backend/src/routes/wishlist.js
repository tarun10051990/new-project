const express = require('express');
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', (req, res) => {
  try {
    const items = db.prepare(`
      SELECT wi.id, p.id as product_id, p.name, p.slug, p.price, p.mrp,
             p.discount_percent, p.image, p.unit, p.brand, p.in_stock, p.rating
      FROM wishlist_items wi
      JOIN products p ON wi.product_id = p.id
      WHERE wi.user_id = ?
      ORDER BY wi.created_at DESC
    `).all(req.userId);

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

router.post('/toggle', (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const existing = db.prepare('SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?').get(req.userId, productId);

    if (existing) {
      db.prepare('DELETE FROM wishlist_items WHERE id = ?').run(existing.id);
      return res.json({ message: 'Removed from wishlist', wishlisted: false });
    }

    db.prepare('INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)').run(req.userId, productId);
    res.json({ message: 'Added to wishlist', wishlisted: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update wishlist' });
  }
});

router.delete('/:itemId', (req, res) => {
  try {
    db.prepare('DELETE FROM wishlist_items WHERE id = ? AND user_id = ?').run(req.params.itemId, req.userId);
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

module.exports = router;
