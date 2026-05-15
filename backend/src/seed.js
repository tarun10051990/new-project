const db = require('./database');

const categories = [
  { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', icon: '🥬', display_order: 1 },
  { name: 'Dairy & Bakery', slug: 'dairy-bakery', icon: '🥛', display_order: 2 },
  { name: 'Staples', slug: 'staples', icon: '🌾', display_order: 3 },
  { name: 'Snacks & Beverages', slug: 'snacks-beverages', icon: '🍿', display_order: 4 },
  { name: 'Personal Care', slug: 'personal-care', icon: '🧴', display_order: 5 },
  { name: 'Home Care', slug: 'home-care', icon: '🏠', display_order: 6 },
  { name: 'Electronics', slug: 'electronics', icon: '📱', display_order: 7 },
  { name: 'Fashion', slug: 'fashion', icon: '👕', display_order: 8 },
  { name: 'Beauty', slug: 'beauty', icon: '💄', display_order: 9 },
  { name: 'Home & Kitchen', slug: 'home-kitchen', icon: '🍳', display_order: 10 },
  { name: 'Baby Care', slug: 'baby-care', icon: '👶', display_order: 11 },
  { name: 'Pet Care', slug: 'pet-care', icon: '🐾', display_order: 12 },
];

const insertCategory = db.prepare(`
  INSERT OR IGNORE INTO categories (name, slug, icon, display_order)
  VALUES (@name, @slug, @icon, @display_order)
`);

const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products (name, slug, description, price, mrp, discount_percent, image, category_id, brand, unit, weight, in_stock, rating, review_count, is_featured)
  VALUES (@name, @slug, @description, @price, @mrp, @discount_percent, @image, @category_id, @brand, @unit, @weight, @in_stock, @rating, @review_count, @is_featured)
`);

const insertBanner = db.prepare(`
  INSERT OR IGNORE INTO banners (title, image, link, display_order, is_active)
  VALUES (@title, @image, @link, @display_order, @is_active)
`);

const seedDB = db.transaction(() => {
  for (const cat of categories) {
    insertCategory.run(cat);
  }

  const getCategoryId = (slug) => {
    const row = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug);
    return row ? row.id : null;
  };

  const products = [
    // Fruits & Vegetables
    { name: 'Fresh Onion', slug: 'fresh-onion', description: 'Fresh and high quality onions', price: 29, mrp: 40, discount_percent: 28, image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300', category_id: getCategoryId('fruits-vegetables'), brand: 'Fresh', unit: '1 kg', weight: '1 kg', in_stock: 1, rating: 4.2, review_count: 856, is_featured: 1 },
    { name: 'Fresh Tomato', slug: 'fresh-tomato', description: 'Farm fresh red tomatoes', price: 35, mrp: 50, discount_percent: 30, image: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=300', category_id: getCategoryId('fruits-vegetables'), brand: 'Fresh', unit: '1 kg', weight: '1 kg', in_stock: 1, rating: 4.0, review_count: 632, is_featured: 1 },
    { name: 'Potato', slug: 'potato', description: 'Fresh potatoes', price: 32, mrp: 45, discount_percent: 29, image: 'https://images.unsplash.com/photo-1518977676601-b53f82ber477?w=300', category_id: getCategoryId('fruits-vegetables'), brand: 'Fresh', unit: '1 kg', weight: '1 kg', in_stock: 1, rating: 4.1, review_count: 445, is_featured: 0 },
    { name: 'Green Apple', slug: 'green-apple', description: 'Crisp and fresh green apples', price: 180, mrp: 220, discount_percent: 18, image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300', category_id: getCategoryId('fruits-vegetables'), brand: 'Imported', unit: '4 Pcs', weight: '500 g', in_stock: 1, rating: 4.5, review_count: 320, is_featured: 1 },
    { name: 'Banana', slug: 'banana-robusta', description: 'Fresh Robusta bananas', price: 45, mrp: 55, discount_percent: 18, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300', category_id: getCategoryId('fruits-vegetables'), brand: 'Fresh', unit: '1 Dozen', weight: '1 dozen', in_stock: 1, rating: 4.3, review_count: 712, is_featured: 1 },
    { name: 'Capsicum Green', slug: 'capsicum-green', description: 'Fresh green capsicums', price: 28, mrp: 40, discount_percent: 30, image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300', category_id: getCategoryId('fruits-vegetables'), brand: 'Fresh', unit: '250 g', weight: '250 g', in_stock: 1, rating: 4.0, review_count: 189, is_featured: 0 },

    // Dairy & Bakery
    { name: 'Amul Taaza Milk', slug: 'amul-taaza-milk', description: 'Amul Taaza Toned Fresh Milk', price: 27, mrp: 29, discount_percent: 7, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300', category_id: getCategoryId('dairy-bakery'), brand: 'Amul', unit: '500 ml', weight: '500 ml', in_stock: 1, rating: 4.4, review_count: 1205, is_featured: 1 },
    { name: 'Amul Butter', slug: 'amul-butter', description: 'Amul Pasteurised Butter', price: 56, mrp: 60, discount_percent: 7, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300', category_id: getCategoryId('dairy-bakery'), brand: 'Amul', unit: '100 g', weight: '100 g', in_stock: 1, rating: 4.6, review_count: 2103, is_featured: 1 },
    { name: 'Britannia White Bread', slug: 'britannia-white-bread', description: 'Soft and fresh white bread', price: 40, mrp: 45, discount_percent: 11, image: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=300', category_id: getCategoryId('dairy-bakery'), brand: 'Britannia', unit: '1 Pack', weight: '400 g', in_stock: 1, rating: 4.2, review_count: 890, is_featured: 0 },
    { name: 'Amul Cheese Slices', slug: 'amul-cheese-slices', description: 'Processed cheese slices', price: 120, mrp: 135, discount_percent: 11, image: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=300', category_id: getCategoryId('dairy-bakery'), brand: 'Amul', unit: '200 g', weight: '200 g', in_stock: 1, rating: 4.5, review_count: 1560, is_featured: 1 },
    { name: 'Curd (Dahi)', slug: 'amul-dahi', description: 'Fresh plain curd', price: 35, mrp: 40, discount_percent: 13, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300', category_id: getCategoryId('dairy-bakery'), brand: 'Amul', unit: '400 g', weight: '400 g', in_stock: 1, rating: 4.3, review_count: 670, is_featured: 0 },

    // Staples
    { name: 'Aashirvaad Atta', slug: 'aashirvaad-atta', description: 'Aashirvaad Superior MP Whole Wheat Atta', price: 295, mrp: 350, discount_percent: 16, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300', category_id: getCategoryId('staples'), brand: 'Aashirvaad', unit: '5 kg', weight: '5 kg', in_stock: 1, rating: 4.5, review_count: 3200, is_featured: 1 },
    { name: 'Fortune Sunflower Oil', slug: 'fortune-sunflower-oil', description: 'Refined sunflower oil', price: 155, mrp: 180, discount_percent: 14, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300', category_id: getCategoryId('staples'), brand: 'Fortune', unit: '1 L', weight: '1 L', in_stock: 1, rating: 4.3, review_count: 1890, is_featured: 1 },
    { name: 'India Gate Basmati Rice', slug: 'india-gate-rice', description: 'Premium basmati rice', price: 499, mrp: 599, discount_percent: 17, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300', category_id: getCategoryId('staples'), brand: 'India Gate', unit: '5 kg', weight: '5 kg', in_stock: 1, rating: 4.6, review_count: 2750, is_featured: 1 },
    { name: 'Tata Salt', slug: 'tata-salt', description: 'Iodised salt', price: 24, mrp: 28, discount_percent: 14, image: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=300', category_id: getCategoryId('staples'), brand: 'Tata', unit: '1 kg', weight: '1 kg', in_stock: 1, rating: 4.7, review_count: 4100, is_featured: 0 },
    { name: 'Toor Dal', slug: 'toor-dal', description: 'Unpolished toor dal', price: 145, mrp: 170, discount_percent: 15, image: 'https://images.unsplash.com/photo-1585996979619-cdee19e69a33?w=300', category_id: getCategoryId('staples'), brand: 'Local', unit: '1 kg', weight: '1 kg', in_stock: 1, rating: 4.2, review_count: 980, is_featured: 0 },
    { name: 'Sugar', slug: 'sugar', description: 'Refined white sugar', price: 42, mrp: 48, discount_percent: 13, image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=300', category_id: getCategoryId('staples'), brand: 'Local', unit: '1 kg', weight: '1 kg', in_stock: 1, rating: 4.1, review_count: 560, is_featured: 0 },

    // Snacks & Beverages
    { name: 'Lay\'s Classic Salted', slug: 'lays-classic-salted', description: 'Classic salted potato chips', price: 20, mrp: 20, discount_percent: 0, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300', category_id: getCategoryId('snacks-beverages'), brand: 'Lay\'s', unit: '52 g', weight: '52 g', in_stock: 1, rating: 4.3, review_count: 2340, is_featured: 1 },
    { name: 'Coca-Cola', slug: 'coca-cola', description: 'Refreshing cola drink', price: 40, mrp: 40, discount_percent: 0, image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=300', category_id: getCategoryId('snacks-beverages'), brand: 'Coca-Cola', unit: '750 ml', weight: '750 ml', in_stock: 1, rating: 4.4, review_count: 3100, is_featured: 1 },
    { name: 'Maggi 2-Minute Noodles', slug: 'maggi-noodles', description: 'Instant masala noodles', price: 14, mrp: 14, discount_percent: 0, image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=300', category_id: getCategoryId('snacks-beverages'), brand: 'Maggi', unit: '70 g', weight: '70 g', in_stock: 1, rating: 4.5, review_count: 5200, is_featured: 1 },
    { name: 'Haldiram\'s Namkeen', slug: 'haldirams-namkeen', description: 'Aloo Bhujia', price: 55, mrp: 60, discount_percent: 8, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=300', category_id: getCategoryId('snacks-beverages'), brand: 'Haldiram\'s', unit: '200 g', weight: '200 g', in_stock: 1, rating: 4.3, review_count: 1780, is_featured: 0 },
    { name: 'Tata Tea Gold', slug: 'tata-tea-gold', description: 'Premium tea blend', price: 285, mrp: 330, discount_percent: 14, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300', category_id: getCategoryId('snacks-beverages'), brand: 'Tata', unit: '500 g', weight: '500 g', in_stock: 1, rating: 4.6, review_count: 2890, is_featured: 1 },
    { name: 'Nescafe Classic Coffee', slug: 'nescafe-classic', description: 'Instant coffee powder', price: 245, mrp: 280, discount_percent: 13, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300', category_id: getCategoryId('snacks-beverages'), brand: 'Nescafe', unit: '200 g', weight: '200 g', in_stock: 1, rating: 4.5, review_count: 3450, is_featured: 1 },

    // Personal Care
    { name: 'Dove Shampoo', slug: 'dove-shampoo', description: 'Intense Repair shampoo', price: 210, mrp: 250, discount_percent: 16, image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=300', category_id: getCategoryId('personal-care'), brand: 'Dove', unit: '340 ml', weight: '340 ml', in_stock: 1, rating: 4.4, review_count: 1890, is_featured: 1 },
    { name: 'Colgate MaxFresh', slug: 'colgate-maxfresh', description: 'Toothpaste with cooling crystals', price: 95, mrp: 110, discount_percent: 14, image: 'https://images.unsplash.com/photo-1628359355624-855c23aa7f1f?w=300', category_id: getCategoryId('personal-care'), brand: 'Colgate', unit: '150 g', weight: '150 g', in_stock: 1, rating: 4.3, review_count: 2340, is_featured: 1 },
    { name: 'Dettol Handwash', slug: 'dettol-handwash', description: 'Original liquid handwash', price: 99, mrp: 120, discount_percent: 18, image: 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=300', category_id: getCategoryId('personal-care'), brand: 'Dettol', unit: '200 ml', weight: '200 ml', in_stock: 1, rating: 4.5, review_count: 3100, is_featured: 0 },
    { name: 'Nivea Body Lotion', slug: 'nivea-body-lotion', description: 'Nourishing body milk', price: 275, mrp: 320, discount_percent: 14, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300', category_id: getCategoryId('personal-care'), brand: 'Nivea', unit: '400 ml', weight: '400 ml', in_stock: 1, rating: 4.4, review_count: 1560, is_featured: 1 },

    // Home Care
    { name: 'Surf Excel Detergent', slug: 'surf-excel-detergent', description: 'Easy wash detergent powder', price: 199, mrp: 240, discount_percent: 17, image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=300', category_id: getCategoryId('home-care'), brand: 'Surf Excel', unit: '1 kg', weight: '1 kg', in_stock: 1, rating: 4.5, review_count: 2890, is_featured: 1 },
    { name: 'Harpic Toilet Cleaner', slug: 'harpic-toilet-cleaner', description: 'Power Plus disinfectant', price: 85, mrp: 99, discount_percent: 14, image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=300', category_id: getCategoryId('home-care'), brand: 'Harpic', unit: '500 ml', weight: '500 ml', in_stock: 1, rating: 4.3, review_count: 1670, is_featured: 0 },
    { name: 'Lizol Floor Cleaner', slug: 'lizol-floor-cleaner', description: 'Citrus surface cleaner', price: 135, mrp: 160, discount_percent: 16, image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=300', category_id: getCategoryId('home-care'), brand: 'Lizol', unit: '500 ml', weight: '500 ml', in_stock: 1, rating: 4.2, review_count: 1230, is_featured: 1 },

    // Electronics
    { name: 'boAt Airdopes 141', slug: 'boat-airdopes-141', description: 'TWS earbuds with 42H playback', price: 1299, mrp: 2990, discount_percent: 57, image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=300', category_id: getCategoryId('electronics'), brand: 'boAt', unit: '1 Piece', weight: '50 g', in_stock: 1, rating: 4.1, review_count: 45600, is_featured: 1 },
    { name: 'Mi Power Bank 3i', slug: 'mi-power-bank', description: '20000mAh power bank', price: 1499, mrp: 1999, discount_percent: 25, image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=300', category_id: getCategoryId('electronics'), brand: 'Xiaomi', unit: '1 Piece', weight: '450 g', in_stock: 1, rating: 4.3, review_count: 23400, is_featured: 1 },
    { name: 'Fire-Boltt Smartwatch', slug: 'fire-boltt-smartwatch', description: 'BSW001 smartwatch with SpO2', price: 1799, mrp: 5999, discount_percent: 70, image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300', category_id: getCategoryId('electronics'), brand: 'Fire-Boltt', unit: '1 Piece', weight: '100 g', in_stock: 1, rating: 4.0, review_count: 18900, is_featured: 1 },
    { name: 'USB-C Cable', slug: 'usb-c-cable', description: 'Fast charging USB-C cable 1m', price: 199, mrp: 499, discount_percent: 60, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300', category_id: getCategoryId('electronics'), brand: 'Generic', unit: '1 Piece', weight: '30 g', in_stock: 1, rating: 4.0, review_count: 8900, is_featured: 0 },

    // Fashion
    { name: 'Men\'s Cotton T-Shirt', slug: 'mens-cotton-tshirt', description: 'Round neck casual t-shirt', price: 349, mrp: 799, discount_percent: 56, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300', category_id: getCategoryId('fashion'), brand: 'StyleUp', unit: '1 Piece', weight: '200 g', in_stock: 1, rating: 4.1, review_count: 3400, is_featured: 1 },
    { name: 'Women\'s Kurti', slug: 'womens-kurti', description: 'Printed cotton kurti', price: 499, mrp: 999, discount_percent: 50, image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300', category_id: getCategoryId('fashion'), brand: 'Ethnic', unit: '1 Piece', weight: '250 g', in_stock: 1, rating: 4.2, review_count: 2100, is_featured: 1 },
    { name: 'Running Shoes', slug: 'running-shoes', description: 'Lightweight sports shoes', price: 899, mrp: 1999, discount_percent: 55, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300', category_id: getCategoryId('fashion'), brand: 'SportX', unit: '1 Pair', weight: '600 g', in_stock: 1, rating: 4.0, review_count: 5600, is_featured: 1 },

    // Beauty
    { name: 'Lakme Lipstick', slug: 'lakme-lipstick', description: 'Matte lip color', price: 299, mrp: 450, discount_percent: 34, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300', category_id: getCategoryId('beauty'), brand: 'Lakme', unit: '1 Piece', weight: '4.2 g', in_stock: 1, rating: 4.3, review_count: 6700, is_featured: 1 },
    { name: 'Maybelline Foundation', slug: 'maybelline-foundation', description: 'Fit Me matte foundation', price: 399, mrp: 550, discount_percent: 27, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300', category_id: getCategoryId('beauty'), brand: 'Maybelline', unit: '30 ml', weight: '30 ml', in_stock: 1, rating: 4.4, review_count: 8900, is_featured: 1 },

    // Home & Kitchen
    { name: 'Prestige Cooker 3L', slug: 'prestige-cooker', description: 'Popular pressure cooker', price: 1299, mrp: 1795, discount_percent: 28, image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=300', category_id: getCategoryId('home-kitchen'), brand: 'Prestige', unit: '1 Piece', weight: '1.5 kg', in_stock: 1, rating: 4.5, review_count: 12300, is_featured: 1 },
    { name: 'Milton Water Bottle', slug: 'milton-water-bottle', description: 'Steel water bottle 1L', price: 449, mrp: 699, discount_percent: 36, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300', category_id: getCategoryId('home-kitchen'), brand: 'Milton', unit: '1 Piece', weight: '350 g', in_stock: 1, rating: 4.3, review_count: 4500, is_featured: 1 },
  ];

  for (const product of products) {
    insertProduct.run(product);
  }

  const banners = [
    { title: 'Grocery Deals', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=400&fit=crop', link: '/category/fruits-vegetables', display_order: 1, is_active: 1 },
    { title: 'Electronics Sale', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=400&fit=crop', link: '/category/electronics', display_order: 2, is_active: 1 },
    { title: 'Fashion Fest', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop', link: '/category/fashion', display_order: 3, is_active: 1 },
    { title: 'Beauty Essentials', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=400&fit=crop', link: '/category/beauty', display_order: 4, is_active: 1 },
    { title: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=400&fit=crop', link: '/category/home-kitchen', display_order: 5, is_active: 1 },
  ];

  for (const banner of banners) {
    insertBanner.run(banner);
  }

  console.log('Database seeded successfully!');
  console.log(`Categories: ${db.prepare('SELECT COUNT(*) as count FROM categories').get().count}`);
  console.log(`Products: ${db.prepare('SELECT COUNT(*) as count FROM products').get().count}`);
  console.log(`Banners: ${db.prepare('SELECT COUNT(*) as count FROM banners').get().count}`);
});

seedDB();
