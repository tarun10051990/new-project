import { waitForSelector, safeClick, safeType, sleep, log, prompt } from './utils.js';

export async function selectDeliveryAddress(page, config) {
  log('ORDER', 'Selecting delivery address...');

  const addressIndex = config.delivery.addressIndex || 0;

  // Check if we're on address selection page
  const addressSelectors = [
    '[class*="address-card"]',
    '[class*="address-item"]',
    '[class*="address-block"]',
    '[class*="delivery-address"]',
  ];

  for (const sel of addressSelectors) {
    try {
      const addresses = await page.$$(sel);
      if (addresses.length > 0) {
        const targetIndex = Math.min(addressIndex, addresses.length - 1);
        await addresses[targetIndex].click();
        log('ORDER', `Selected address at index ${targetIndex}`);
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

  const couponInputs = [
    'input[placeholder*="coupon" i]',
    'input[placeholder*="promo" i]',
    'input[name="coupon"]',
    'input[name="promoCode"]',
  ];

  for (const sel of couponInputs) {
    const entered = await safeType(page, sel, couponCode, { timeout: 5000 });
    if (entered) {
      const applyBtns = [
        'button:has-text("Apply")',
        'button:has-text("APPLY")',
        'button[type="submit"]',
      ];

      for (const btnSel of applyBtns) {
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

export async function selectPaymentMethod(page, method) {
  log('ORDER', `Selecting payment method: ${method}`);

  const methodMap = {
    COD: [
      'text=Cash on Delivery',
      'text=Cash On Delivery',
      'text=COD',
      'text=Pay on Delivery',
      '[class*="cod"]',
      '[data-testid="cod"]',
    ],
    UPI: [
      'text=UPI',
      'text=Google Pay',
      'text=PhonePe',
      '[class*="upi"]',
    ],
    CARD: [
      'text=Credit / Debit Card',
      'text=Credit Card',
      'text=Debit Card',
      '[class*="card-payment"]',
    ],
    NETBANKING: [
      'text=Net Banking',
      'text=Netbanking',
      '[class*="netbanking"]',
    ],
    WALLET: [
      'text=Wallet',
      'text=JioMoney',
      '[class*="wallet"]',
    ],
  };

  const selectors = methodMap[method.toUpperCase()] || methodMap.COD;

  for (const sel of selectors) {
    try {
      const el = await page.$(sel);
      if (el && await el.isVisible()) {
        await el.click();
        await sleep(1000);
        log('ORDER', `Payment method "${method}" selected`);
        return true;
      }
    } catch {
      continue;
    }
  }

  log('ORDER', `Could not find "${method}" payment method`);
  return false;
}

export async function proceedToCheckout(page) {
  log('ORDER', 'Proceeding to checkout...');

  const checkoutSelectors = [
    'button:has-text("Place Order")',
    'button:has-text("PLACE ORDER")',
    'button:has-text("Proceed to Pay")',
    'button:has-text("Proceed to Checkout")',
    'button:has-text("PROCEED TO CHECKOUT")',
    'button:has-text("Checkout")',
    'button:has-text("CHECKOUT")',
    'a:has-text("Place Order")',
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
        log('ORDER', 'Clicked checkout/proceed button');
        return true;
      }
    } catch {
      continue;
    }
  }

  log('ORDER', 'Could not find checkout button');
  return false;
}

export async function placeOrder(page, config) {
  log('ORDER', '=== Starting order placement ===');

  // Step 1: Select delivery address
  await selectDeliveryAddress(page, config);

  // Step 2: Apply coupon if provided
  if (config.order.couponCode) {
    await applyCoupon(page, config.order.couponCode);
  }

  // Step 3: Select payment method
  await selectPaymentMethod(page, config.order.paymentMethod);

  // Step 4: Proceed to place order
  log('ORDER', 'Ready to place order.');
  const confirmation = await prompt('Confirm order placement? (yes/no): ');

  if (confirmation.toLowerCase() !== 'yes' && confirmation.toLowerCase() !== 'y') {
    log('ORDER', 'Order placement cancelled by user.');
    return false;
  }

  // Click final "Place Order" button
  const placeOrderSelectors = [
    'button:has-text("Place Order")',
    'button:has-text("PLACE ORDER")',
    'button:has-text("Confirm Order")',
    'button:has-text("CONFIRM ORDER")',
    'button:has-text("Pay")',
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
        log('ORDER', 'Order placed! Waiting for confirmation...');

        // Check for order confirmation
        const confirmed = await checkOrderConfirmation(page);
        if (confirmed) {
          log('ORDER', 'Order confirmed successfully!');
        }
        return confirmed;
      }
    } catch {
      continue;
    }
  }

  log('ORDER', 'Could not find place order button.');
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
