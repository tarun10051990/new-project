import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadConfig, parseArgs } from './config.js';
import { loginWithOtp, loginWithCookies } from './login.js';
import { addProductToCart, addMultipleProducts, viewCart, getCartSummary, setPincode } from './cart.js';
import { placeOrder, proceedToCheckout } from './order.js';
import { log, prompt, sleep } from './utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COOKIES_PATH = resolve(__dirname, '..', 'cookies.json');
const STORAGE_PATH = resolve(__dirname, '..', 'storage-state.json');

async function main() {
  const config = loadConfig();
  const args = parseArgs();

  if (args.headless) {
    config.jiomart.headless = true;
  }

  log('BOT', '=== JioMart Automation Bot ===');
  log('BOT', `Mode: ${args.loginOnly ? 'Login Only' : args.placeOrder ? 'Full Order' : 'Add to Cart'}`);
  log('BOT', `Headless: ${config.jiomart.headless}`);
  log('BOT', `Products: ${config.products.length}`);

  const browser = await chromium.launch({
    headless: config.jiomart.headless,
    slowMo: config.jiomart.slowMo,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 768 },
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
  });

  // Restore previous session if available
  if (existsSync(STORAGE_PATH)) {
    log('BOT', 'Restoring previous session...');
    try {
      const storageState = JSON.parse(readFileSync(STORAGE_PATH, 'utf-8'));
      if (storageState.cookies) {
        await context.addCookies(storageState.cookies);
      }
    } catch {
      log('BOT', 'Could not restore session, starting fresh');
    }
  }

  const page = await context.newPage();

  // Block unnecessary resources for speed
  await page.route('**/*.{png,jpg,jpeg,gif,svg,ico,woff,woff2,ttf}', (route) => route.abort());

  try {
    // Step 1: Login
    log('BOT', '--- Step 1: Login ---');
    let loggedIn = false;

    if (existsSync(COOKIES_PATH)) {
      log('BOT', 'Found saved cookies, trying cookie-based login...');
      const cookies = JSON.parse(readFileSync(COOKIES_PATH, 'utf-8'));
      loggedIn = await loginWithCookies(page, cookies, config);
    }

    if (!loggedIn) {
      loggedIn = await loginWithOtp(page, config);
    }

    // Save session state
    await saveSession(context);

    if (args.loginOnly) {
      log('BOT', 'Login-only mode. Exiting.');
      await browser.close();
      return;
    }

    // Step 2: Set pincode
    if (config.delivery.pincode) {
      log('BOT', '--- Step 2: Set Pincode ---');
      await setPincode(page, config.delivery.pincode);
    }

    // Step 3: Add products to cart
    if (config.products.length > 0) {
      log('BOT', '--- Step 3: Add Products to Cart ---');
      const results = await addMultipleProducts(page, config.products);

      log('BOT', '\n=== Cart Results ===');
      for (const r of results) {
        log('BOT', `  ${r.added ? '[OK]' : '[FAIL]'} ${r.url} (qty: ${r.quantity})`);
      }

      const successCount = results.filter((r) => r.added).length;
      log('BOT', `Added ${successCount}/${results.length} products to cart`);

      if (successCount === 0) {
        log('BOT', 'No products added to cart. Exiting.');
        await browser.close();
        return;
      }
    }

    // Step 4: View cart
    log('BOT', '--- Step 4: View Cart ---');
    await viewCart(page);
    const summary = await getCartSummary(page);
    log('BOT', `Cart: ${summary.itemCount} items, Total: ${summary.totalPrice || 'N/A'}`);

    // Step 5: Place order (if requested)
    if (args.placeOrder) {
      log('BOT', '--- Step 5: Place Order ---');
      await proceedToCheckout(page);
      const orderPlaced = await placeOrder(page, config);

      if (orderPlaced) {
        log('BOT', '=== ORDER PLACED SUCCESSFULLY ===');
      } else {
        log('BOT', '=== ORDER PLACEMENT FAILED ===');
      }
    } else {
      log('BOT', 'Products added to cart. Run with --place-order to place the order.');
    }

    // Save session state after everything
    await saveSession(context);

  } catch (err) {
    log('BOT', `Error: ${err.message}`);
    console.error(err);
  } finally {
    log('BOT', 'Taking final screenshot...');
    await page.screenshot({ path: resolve(__dirname, '..', 'screenshot.png'), fullPage: true });
    log('BOT', 'Closing browser...');
    await browser.close();
    log('BOT', 'Done.');
  }
}

async function saveSession(context) {
  try {
    const cookies = await context.cookies();
    const storageState = { cookies };
    writeFileSync(STORAGE_PATH, JSON.stringify(storageState, null, 2));
    writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));
    log('BOT', 'Session saved for next run');
  } catch (err) {
    log('BOT', `Could not save session: ${err.message}`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
