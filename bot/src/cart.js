import { waitForSelector, safeClick, sleep, log } from './utils.js';

export async function setPincode(page, pincode) {
  if (!pincode) return;

  log('CART', `Setting delivery pincode: ${pincode}`);

  try {
    // Look for pincode/location selector
    const pincodeSelectors = [
      'text=Enter pincode',
      'text=Select Location',
      'text=Deliver to',
      '[class*="pincode"]',
      '[class*="location"]',
      '[data-testid="pincode"]',
    ];

    for (const sel of pincodeSelectors) {
      try {
        const el = await page.$(sel);
        if (el && await el.isVisible()) {
          await el.click();
          await sleep(1000);
          break;
        }
      } catch {
        continue;
      }
    }

    // Find and fill pincode input
    const inputSelectors = [
      'input[placeholder*="pincode" i]',
      'input[placeholder*="pin code" i]',
      'input[name="pincode"]',
      'input[type="tel"]',
      'input[type="number"]',
    ];

    for (const sel of inputSelectors) {
      try {
        const input = await page.$(sel);
        if (input && await input.isVisible()) {
          await input.fill('');
          await input.type(pincode, { delay: 50 });
          await sleep(500);

          // Click apply/submit
          const applySelectors = [
            'button:has-text("Apply")',
            'button:has-text("Check")',
            'button:has-text("Submit")',
            'button[type="submit"]',
          ];

          for (const btnSel of applySelectors) {
            const clicked = await safeClick(page, btnSel, { timeout: 3000 });
            if (clicked) break;
          }

          await sleep(1000);
          log('CART', 'Pincode set successfully');
          return true;
        }
      } catch {
        continue;
      }
    }
  } catch (err) {
    log('CART', `Failed to set pincode: ${err.message}`);
  }

  return false;
}

export async function addProductToCart(page, productUrl, quantity = 1) {
  log('CART', `Adding product: ${productUrl}`);

  await page.goto(productUrl, { waitUntil: 'domcontentloaded' });
  await sleep(3000);

  // Check if product page loaded
  const title = await page.title();
  log('CART', `Product page title: ${title}`);

  // Check for "Add to Cart" button
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
    const buyNowSelectors = [
      'button:has-text("Buy Now")',
      'button:has-text("BUY NOW")',
    ];

    for (const sel of buyNowSelectors) {
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

  // Handle quantity if more than 1
  if (quantity > 1) {
    await setQuantity(page, quantity);
  }

  log('CART', `Product added to cart (qty: ${quantity})`);
  return true;
}

async function setQuantity(page, quantity) {
  log('CART', `Setting quantity to ${quantity}`);

  // Try increment button approach
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

  // Alternatively try a quantity input
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
    const success = await addProductToCart(page, product.url, product.quantity || 1);
    results.push({
      url: product.url,
      quantity: product.quantity || 1,
      added: success,
    });

    if (success) {
      // Navigate back if needed for next product
      await sleep(1000);
    }
  }

  return results;
}

export async function viewCart(page) {
  log('CART', 'Navigating to cart...');

  const cartSelectors = [
    'a[href*="/cart"]',
    'a[href*="viewcart"]',
    'text=Cart',
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

  // Try direct URL
  await page.goto('https://www.jiomart.com/cart', { waitUntil: 'domcontentloaded' });
  await sleep(3000);
  return true;
}

export async function getCartSummary(page) {
  log('CART', 'Getting cart summary...');

  const summary = {
    itemCount: 0,
    totalPrice: '',
    items: [],
  };

  try {
    // Try to read cart count
    const countSelectors = [
      '[class*="cart-count"]',
      '[class*="badge"]',
      '[class*="item-count"]',
    ];

    for (const sel of countSelectors) {
      try {
        const el = await page.$(sel);
        if (el) {
          const text = await el.textContent();
          const num = parseInt(text.replace(/\D/g, ''), 10);
          if (!isNaN(num)) {
            summary.itemCount = num;
            break;
          }
        }
      } catch {
        continue;
      }
    }

    // Try to read total
    const totalSelectors = [
      '[class*="total"] [class*="price"]',
      '[class*="grand-total"]',
      'text=/₹[\\d,.]+/',
    ];

    for (const sel of totalSelectors) {
      try {
        const el = await page.$(sel);
        if (el) {
          summary.totalPrice = await el.textContent();
          break;
        }
      } catch {
        continue;
      }
    }
  } catch (err) {
    log('CART', `Error reading cart summary: ${err.message}`);
  }

  return summary;
}
