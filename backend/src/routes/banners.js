const express = require('express');
const db = require('../database');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const banners = db.prepare(
      'SELECT * FROM banners WHERE is_active = 1 ORDER BY display_order ASC'
    ).all();
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

module.exports = router;
