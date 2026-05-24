import { safeClick, safeType, sleep, log } from './utils.js';

export async function selectDeliveryAddress(page, address) {
  log('ORDER', 'Selecting delivery address...');

  // If we're on checkout, look for address cards
  const addressSelectors = [
    '[class*="address-card"]',
    '[class*="address-item"]',
    '[class*="address-block"]',
    '[class*="delivery-address"]',
  ];

  for (const sel of addressSelectors) {
    try {
      const cards = await page.$$(sel);
      if (cards.length > 0) {
        // Try to find matching address by text content
        for (const card of cards) {
          const text = await card.textContent();
          if (address.pincode && text.includes(address.pincode)) {
            await card.click();
            log('ORDER', `Selected address matching pincode ${address.pincode}`);
            await sleep(1000);
            return true;
          }
          if (address.fullName && text.includes(address.fullName)) {
            await card.click();
            log('ORDER', `Selected address for ${address.fullName}`);
            await sleep(1000);
            return true;
          }
        }
        // If no match, select the first one
        await cards[0].click();
        log('ORDER', 'Selected first available address');
        await sleep(1000);
        return true;
      }
    } catch {
      continue;
    }
  }

  log('ORDER', 'No address selection found, may be pre-selected');
  return true;
}

export async function applyCoupon(page, couponCode) {
  if (!couponCode) return false;

  log('ORDER', `Applying coupon: ${couponCode}`);

  // Click to open coupon section
  const couponTriggers = [
    'text=Apply Coupon',
    'text=Have a coupon',
    'text=Enter coupon',
    'text=Promo Code',
    '[class*="coupon"]',
  ];

  for (const sel of couponTriggers) {
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

  // Enter coupon code
  const couponInputs = [
    'input[placeholder*="coupon" i]',
    'input[placeholder*="promo" i]',
    'input[name="coupon"]',
    'input[name="promoCode"]',
  ];

  for (const sel of couponInputs) {
    const entered = await safeType(page, sel, couponCode, { timeout: 5000 });
    if (entered) {
      for (const btnSel of ['button:has-text("Apply")', 'button:has-text("APPLY")', 'button[type="submit"]']) {
        const clicked = await safeClick(page, btnSel, { timeout: 3000 });
        if (clicked) {
          await sleep(2000);
          log('ORDER', 'Coupon applied');
          return true;
        }
      }
    }
  }

  log('ORDER', 'Could not apply coupon');
  return false;
}

export async function selectCODPayment(page) {
  log('ORDER', 'Selecting Cash on Delivery payment...');

  const codSelectors = [
    'text=Cash on Delivery',
    'text=Cash On Delivery',
    'text=COD',
    'text=Pay on Delivery',
    'text=Cash/Pay on Delivery',
    '[class*="cod"]',
    '[data-testid="cod"]',
    'label:has-text("Cash on Delivery")',
    'div:has-text("Cash on Delivery")',
  ];

  for (const sel of codSelectors) {
    try {
      const el = await page.$(sel);
      if (el && await el.isVisible()) {
        await el.click();
        await sleep(1000);
        log('ORDER', 'COD payment selected');
        return true;
      }
    } catch {
      continue;
    }
  }

  log('ORDER', 'Could not find COD payment option');
  return false;
}

export async function placeOrder(page) {
  log('ORDER', 'Placing order...');

  const placeOrderSelectors = [
    'button:has-text("Place Order")',
    'button:has-text("PLACE ORDER")',
    'button:has-text("Confirm Order")',
    'button:has-text("CONFIRM ORDER")',
    'button:has-text("Complete Order")',
    '[class*="place-order"]',
    '[data-testid="place-order"]',
  ];

  for (const sel of placeOrderSelectors) {
    try {
      const btn = await page.$(sel);
      if (btn && await btn.isVisible()) {
        await btn.click();
        await sleep(5000);
        log('ORDER', 'Order placed! Checking confirmation...');

        const confirmed = await checkOrderConfirmation(page);
        return confirmed;
      }
    } catch {
      continue;
    }
  }

  log('ORDER', 'Could not find Place Order button');
  return false;
}

export async function proceedToCheckout(page) {
  log('ORDER', 'Proceeding to checkout...');

  const checkoutSelectors = [
    'button:has-text("Proceed to Pay")',
    'button:has-text("Proceed to Checkout")',
    'button:has-text("PROCEED TO CHECKOUT")',
    'button:has-text("Checkout")',
    'button:has-text("CHECKOUT")',
    'button:has-text("Place Order")',
    'button:has-text("PLACE ORDER")',
    'a:has-text("Proceed")',
    '[class*="checkout-btn"]',
    '[data-testid="checkout"]',
  ];

  for (const sel of checkoutSelectors) {
    try {
      const btn = await page.$(sel);
      if (btn && await btn.isVisible()) {
        await btn.click();
        await sleep(3000);
        log('ORDER', 'Clicked checkout button');
        return true;
      }
    } catch {
      continue;
    }
  }

  log('ORDER', 'Could not find checkout button');
  return false;
}

async function checkOrderConfirmation(page) {
  const confirmationSelectors = [
    'text=Order Placed',
    'text=Order Confirmed',
    'text=Thank you',
    'text=order has been placed',
    'text=successfully placed',
    '[class*="order-success"]',
    '[class*="confirmation"]',
  ];

  for (const sel of confirmationSelectors) {
    try {
      const el = await page.$(sel);
      if (el && await el.isVisible()) {
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
}

/**
 * Full order flow: go to cart → checkout → select address → apply coupon → select COD → place order
 */
export async function executeOrderFlow(page, orderData) {
  const steps = [];

  // Step 1: Select delivery address if on checkout page
  if (orderData.address) {
    const addrOk = await selectDeliveryAddress(page, orderData.address);
    steps.push({ step: 'selectAddress', success: addrOk });
  }

  // Step 2: Apply coupon if provided
  if (orderData.couponCode) {
    const couponOk = await applyCoupon(page, orderData.couponCode);
    steps.push({ step: 'applyCoupon', success: couponOk });
  }

  // Step 3: Select COD payment
  const codOk = await selectCODPayment(page);
  steps.push({ step: 'selectCOD', success: codOk });

  // Step 4: Place order
  const orderOk = await placeOrder(page);
  steps.push({ step: 'placeOrder', success: orderOk });

  return {
    success: orderOk,
    steps,
  };
}
