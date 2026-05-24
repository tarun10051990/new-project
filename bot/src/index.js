import express from 'express';
import { chromium } from 'playwright';
import { BOT_PORT, HEADLESS, SLOW_MO } from './config.js';
import { loginWithCookies, loginWithCookieFile } from './login.js';
import { addMultipleProducts, viewCart } from './cart.js';
import { executeOrderFlow, proceedToCheckout } from './order.js';
import { log, sleep } from './utils.js';

const app = express();
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'jiomart-bot' });
});

/**
 * POST /execute-order
 * Main endpoint called by the Spring Boot backend when "START BULK ORDERS" is clicked.
 *
 * Request body:
 * {
 *   "accessToken": "cra_access_token value",
 *   "refreshToken": "cra_refresh_token value",
 *   "products": [{ "productUrl": "...", "quantity": 1 }],
 *   "address": { "fullName": "...", "pincode": "...", "city": "...", ... },
 *   "couponCode": "SAVE10",
 *   "orderId": 123
 * }
 */
app.post('/execute-order', async (req, res) => {
  const { accessToken, refreshToken, products, address, couponCode, orderId } = req.body;

  if (!accessToken) {
    return res.status(400).json({ success: false, error: 'accessToken is required' });
  }
  if (!products || products.length === 0) {
    return res.status(400).json({ success: false, error: 'At least one product is required' });
  }

  log('BOT', `=== Order #${orderId || 'N/A'} - Starting automation ===`);
  log('BOT', `Products: ${products.length}, Coupon: ${couponCode || 'none'}`);

  let browser;
  try {
    browser = await chromium.launch({
      headless: HEADLESS,
      slowMo: SLOW_MO,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1366, height: 768 },
      locale: 'en-IN',
      timezoneId: 'Asia/Kolkata',
    });

    const page = await context.newPage();

    // Step 1: Login with cookies
    log('BOT', '--- Step 1: Cookie Login ---');
    const loggedIn = await loginWithCookies(page, accessToken, refreshToken || '');
    if (!loggedIn) {
      log('BOT', 'Login failed, but continuing with automation...');
    }

    // Step 2: Add products to cart
    log('BOT', '--- Step 2: Add Products to Cart ---');
    const cartResults = await addMultipleProducts(page, products);
    const successCount = cartResults.filter((r) => r.added).length;
    log('BOT', `Added ${successCount}/${cartResults.length} products to cart`);

    if (successCount === 0) {
      await browser.close();
      return res.json({
        success: false,
        error: 'No products could be added to cart',
        cartResults,
        orderId,
      });
    }

    // Step 3: Go to cart
    log('BOT', '--- Step 3: View Cart ---');
    await viewCart(page);

    // Step 4: Proceed to checkout
    log('BOT', '--- Step 4: Checkout ---');
    await proceedToCheckout(page);

    // Step 5: Execute order flow (address, coupon, COD, place order)
    log('BOT', '--- Step 5: Place Order ---');
    const orderResult = await executeOrderFlow(page, {
      address: address || {},
      couponCode: couponCode || '',
    });

    log('BOT', `=== Order #${orderId || 'N/A'} - ${orderResult.success ? 'SUCCESS' : 'COMPLETED'} ===`);

    await browser.close();

    return res.json({
      success: orderResult.success,
      orderId,
      cartResults,
      orderSteps: orderResult.steps,
      message: orderResult.success
        ? 'Order placed successfully on JioMart!'
        : 'Automation completed. Order may need manual verification.',
    });
  } catch (err) {
    log('BOT', `Error: ${err.message}`);
    if (browser) await browser.close();
    return res.status(500).json({
      success: false,
      error: err.message,
      orderId,
    });
  }
});

/**
 * POST /login-test
 * Test login with cookies to verify they are valid.
 */
app.post('/login-test', async (req, res) => {
  const { accessToken, refreshToken, cookieData } = req.body;

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      viewport: { width: 1366, height: 768 },
    });

    const page = await context.newPage();
    let loggedIn = false;

    if (accessToken) {
      loggedIn = await loginWithCookies(page, accessToken, refreshToken || '');
    } else if (cookieData) {
      loggedIn = await loginWithCookieFile(page, cookieData);
    } else {
      await browser.close();
      return res.status(400).json({ success: false, error: 'Provide accessToken or cookieData' });
    }

    await browser.close();
    return res.json({ success: loggedIn, message: loggedIn ? 'Login successful' : 'Login failed' });
  } catch (err) {
    if (browser) await browser.close();
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /add-to-cart
 * Add products to JioMart cart without placing an order.
 */
app.post('/add-to-cart', async (req, res) => {
  const { accessToken, refreshToken, products } = req.body;

  if (!accessToken) {
    return res.status(400).json({ success: false, error: 'accessToken is required' });
  }

  let browser;
  try {
    browser = await chromium.launch({
      headless: HEADLESS,
      slowMo: SLOW_MO,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      viewport: { width: 1366, height: 768 },
      locale: 'en-IN',
      timezoneId: 'Asia/Kolkata',
    });

    const page = await context.newPage();

    await loginWithCookies(page, accessToken, refreshToken || '');
    const cartResults = await addMultipleProducts(page, products || []);

    await browser.close();
    return res.json({
      success: true,
      cartResults,
      added: cartResults.filter((r) => r.added).length,
      total: cartResults.length,
    });
  } catch (err) {
    if (browser) await browser.close();
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(BOT_PORT, () => {
  log('BOT', `JioMart Bot Service running on port ${BOT_PORT}`);
  log('BOT', `Headless: ${HEADLESS}, SlowMo: ${SLOW_MO}ms`);
  log('BOT', 'Endpoints:');
  log('BOT', '  POST /execute-order  - Full order flow');
  log('BOT', '  POST /login-test     - Test cookie login');
  log('BOT', '  POST /add-to-cart    - Add products to cart');
  log('BOT', '  GET  /health         - Health check');
});
