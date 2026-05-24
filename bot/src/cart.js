import { safeClick, safeType, sleep, log } from './utils.js';

export async function addProductToCart(page, productUrl, quantity = 1) {
  log('CART', `Adding product: ${productUrl} (qty: ${quantity})`);

  await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(3000);

  const title = await page.title();
  log('CART', `Product page: ${title}`);

  // Look for "Add to Cart" button
  const addToCartSelectors = [
    'button:has-text("Add to Cart")',
    'button:has-text("ADD TO CART")',
    'button:has-text("Add to cart")',
    'button:has-text("Add To Cart")',
    '[class*="add-to-cart"]',
    '[data-testid="add-to-cart"]',
    '#add-to-cart',
    'button:has-text("ADD")',
  ];

  let addedToCart = false;

  for (const sel of addToCartSelectors) {
    try {
      const btn = await page.$(sel);
      if (btn && await btn.isVisible()) {
        await btn.click();
        addedToCart = true;
        log('CART', 'Clicked "Add to Cart"');
        break;
      }
    } catch {
      continue;
    }
  }

  if (!addedToCart) {
    // Try "Buy Now" as fallback
    for (const sel of ['button:has-text("Buy Now")', 'button:has-text("BUY NOW")']) {
      try {
        const btn = await page.$(sel);
        if (btn && await btn.isVisible()) {
          await btn.click();
          addedToCart = true;
          log('CART', 'Clicked "Buy Now"');
          break;
        }
      } catch {
        continue;
      }
    }
  }

  if (!addedToCart) {
    log('CART', 'Could not find Add to Cart button. Product may be out of stock.');
    return false;
  }

  await sleep(2000);

  // Set quantity if more than 1
  if (quantity > 1) {
    await setQuantity(page, quantity);
  }

  log('CART', `Product added to cart (qty: ${quantity})`);
  return true;
}

async function setQuantity(page, quantity) {
  log('CART', `Setting quantity to ${quantity}`);

  // Try increment button
  const incrementSelectors = [
    'button:has-text("+")',
    '[class*="increment"]',
    '[class*="plus"]',
    '[data-testid="qty-increase"]',
  ];

  for (let i = 1; i < quantity; i++) {
    for (const sel of incrementSelectors) {
      try {
        const btn = await page.$(sel);
        if (btn && await btn.isVisible()) {
          await btn.click();
          await sleep(500);
          break;
        }
      } catch {
        continue;
      }
    }
  }

  // Try direct quantity input
  const qtyInputSelectors = [
    'input[name="quantity"]',
    'input[name="qty"]',
    'input[type="number"]',
    '[class*="quantity"] input',
  ];

  for (const sel of qtyInputSelectors) {
    try {
      const input = await page.$(sel);
      if (input && await input.isVisible()) {
        await input.fill(String(quantity));
        await sleep(500);
        return;
      }
    } catch {
      continue;
    }
  }
}

export async function addMultipleProducts(page, products) {
  const results = [];

  for (const product of products) {
    const url = product.productUrl || product.url;
    const qty = product.quantity || 1;
    const success = await addProductToCart(page, url, qty);
    results.push({ url, quantity: qty, added: success });
    if (success) await sleep(1000);
  }

  return results;
}

export async function viewCart(page) {
  log('CART', 'Navigating to cart...');

  const cartSelectors = [
    'a[href*="/cart"]',
    'a[href*="viewcart"]',
    'text=View Cart',
    'text=Go to Cart',
    '[class*="cart-icon"]',
    '[data-testid="cart"]',
  ];

  for (const sel of cartSelectors) {
    try {
      const el = await page.$(sel);
      if (el && await el.isVisible()) {
        await el.click();
        await sleep(3000);
        log('CART', 'Cart page loaded');
        return true;
      }
    } catch {
      continue;
    }
  }

  // Direct URL fallback
  await page.goto('https://www.jiomart.com/cart', { waitUntil: 'domcontentloaded' });
  await sleep(3000);
  return true;
}
