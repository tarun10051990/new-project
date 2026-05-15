const express = require('express');
const db = require('../database');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 20, featured } = req.query;
    const offset = (page - 1) * limit;
    let where = ['1=1'];
    const params = {};

    if (category) {
      where.push('c.slug = @category');
      params.category = category;
    }

    if (search) {
      where.push('(p.name LIKE @search OR p.brand LIKE @search OR p.description LIKE @search)');
      params.search = `%${search}%`;
    }

    if (featured === '1') {
      where.push('p.is_featured = 1');
    }

    let orderBy = 'p.created_at DESC';
    if (sort === 'price_asc') orderBy = 'p.price ASC';
    else if (sort === 'price_desc') orderBy = 'p.price DESC';
    else if (sort === 'rating') orderBy = 'p.rating DESC';
    else if (sort === 'discount') orderBy = 'p.discount_percent DESC';
    else if (sort === 'name') orderBy = 'p.name ASC';

    const whereClause = where.join(' AND ');

    const countQuery = db.prepare(`
      SELECT COUNT(*) as total FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
    `);
    const { total } = countQuery.get(params);

    const query = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT @limit OFFSET @offset
    `);

    const products = query.all({ ...params, limit: Number(limit), offset: Number(offset) });

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/featured', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_featured = 1
      ORDER BY p.rating DESC
      LIMIT 12
    `).all();

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

router.get('/by-category', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT * FROM categories ORDER BY display_order ASC
    `).all();

    const result = categories.map(cat => {
      const products = db.prepare(`
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.category_id = ?
        ORDER BY p.is_featured DESC, p.rating DESC
        LIMIT 6
      `).all(cat.id);

      return { ...cat, products };
    }).filter(cat => cat.products.length > 0);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products by category' });
  }
});

router.get('/:slug', (req, res) => {
  try {
    const product = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ?
    `).get(req.params.slug);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const related = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? AND p.id != ?
      ORDER BY p.rating DESC
      LIMIT 4
    `).all(product.category_id, product.id);

    res.json({ ...product, related });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

module.exports = router;
