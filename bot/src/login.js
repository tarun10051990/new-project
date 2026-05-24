import { prompt, waitForSelector, safeClick, safeType, sleep, log } from './utils.js';

const SELECTORS = {
  signInLink: 'a[href*="login"], button:has-text("Sign In"), [data-testid="login-button"]',
  mobileInput: 'input[type="tel"], input[name="mobile"], input[placeholder*="mobile"], input[placeholder*="phone"], input[placeholder*="number"]',
  otpInput: 'input[type="tel"][maxlength="1"], input[name="otp"], input[placeholder*="OTP"], input[type="number"]',
  sendOtpBtn: 'button:has-text("Continue"), button:has-text("Send OTP"), button:has-text("Get OTP"), button[type="submit"]',
  verifyOtpBtn: 'button:has-text("Verify"), button:has-text("Submit"), button:has-text("Login"), button[type="submit"]',
  profileIcon: '[class*="profile"], [class*="user"], [class*="account"], [data-testid="profile"]',
  loginModal: '[class*="login"], [class*="modal"], [class*="auth"]',
};

export async function loginWithOtp(page, config) {
  const mobile = config.jiomart.mobileNumber;

  log('LOGIN', 'Navigating to JioMart...');
  await page.goto(config.jiomart.loginUrl, { waitUntil: 'domcontentloaded' });
  await sleep(3000);

  log('LOGIN', 'Looking for Sign In button...');
  const signInClicked = await tryClickSignIn(page);
  if (!signInClicked) {
    log('LOGIN', 'Could not find Sign In button. Trying direct login URL...');
    await page.goto('https://www.jiomart.com/login', { waitUntil: 'domcontentloaded' });
    await sleep(2000);
  }

  await sleep(2000);

  log('LOGIN', `Entering mobile number: ${mobile.substring(0, 4)}****`);
  const mobileEntered = await enterMobileNumber(page, mobile);
  if (!mobileEntered) {
    log('LOGIN', 'Failed to enter mobile number. Page might have a different layout.');
    log('LOGIN', 'Please enter the mobile number manually in the browser.');
    await prompt('Press Enter once you have entered the mobile number...');
  }

  log('LOGIN', 'Clicking Send OTP...');
  await clickSendOtp(page);
  await sleep(2000);

  log('LOGIN', 'Waiting for OTP...');
  const otp = await prompt('Enter the OTP received on your mobile: ');

  log('LOGIN', 'Entering OTP...');
  const otpEntered = await enterOtp(page, otp);
  if (!otpEntered) {
    log('LOGIN', 'Could not auto-enter OTP. Please enter it manually.');
    await prompt('Press Enter once you have entered the OTP...');
  }

  log('LOGIN', 'Clicking Verify...');
  await clickVerifyOtp(page);
  await sleep(3000);

  const loggedIn = await verifyLogin(page);
  if (loggedIn) {
    log('LOGIN', 'Successfully logged in!');
  } else {
    log('LOGIN', 'Login status uncertain. Proceeding anyway...');
  }

  return loggedIn;
}

export async function loginWithCookies(page, cookies, config) {
  log('LOGIN', 'Setting cookies for JioMart...');

  const cookieObjects = cookies.map((cookie) => ({
    ...cookie,
    domain: cookie.domain || '.jiomart.com',
    path: cookie.path || '/',
  }));

  await page.context().addCookies(cookieObjects);

  log('LOGIN', 'Navigating to JioMart with cookies...');
  await page.goto(config.jiomart.loginUrl, { waitUntil: 'domcontentloaded' });
  await sleep(3000);

  const loggedIn = await verifyLogin(page);
  if (loggedIn) {
    log('LOGIN', 'Cookie-based login successful!');
  } else {
    log('LOGIN', 'Cookie login failed. Cookies may be expired.');
  }

  return loggedIn;
}

async function tryClickSignIn(page) {
  const selectors = [
    'text=Sign In',
    'text=Login',
    'text=Sign in',
    'text=LOG IN',
    'a[href*="login"]',
    'button:has-text("Sign In")',
    '[data-testid="login"]',
    '.sign-in',
    '#login-btn',
  ];

  for (const sel of selectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        await el.click();
        return true;
      }
    } catch {
      continue;
    }
  }
  return false;
}

async function enterMobileNumber(page, mobile) {
  const selectors = [
    'input[type="tel"]',
    'input[name="mobile"]',
    'input[placeholder*="mobile" i]',
    'input[placeholder*="phone" i]',
    'input[placeholder*="number" i]',
    'input[type="number"]',
  ];

  for (const sel of selectors) {
    const entered = await safeType(page, sel, mobile, { timeout: 5000, delay: 80 });
    if (entered) return true;
  }
  return false;
}

async function clickSendOtp(page) {
  const selectors = [
    'button:has-text("Continue")',
    'button:has-text("Send OTP")',
    'button:has-text("Get OTP")',
    'button:has-text("CONTINUE")',
    'button[type="submit"]',
    'input[type="submit"]',
  ];

  for (const sel of selectors) {
    const clicked = await safeClick(page, sel, { timeout: 5000 });
    if (clicked) return true;
  }
  return false;
}

async function enterOtp(page, otp) {
  await sleep(1000);

  // Try individual OTP digit inputs
  const digitInputs = await page.$$('input[type="tel"][maxlength="1"], input[type="number"][maxlength="1"]');
  if (digitInputs.length >= 4) {
    for (let i = 0; i < Math.min(otp.length, digitInputs.length); i++) {
      await digitInputs[i].fill(otp[i]);
      await sleep(100);
    }
    return true;
  }

  // Try single OTP input
  const singleSelectors = [
    'input[name="otp"]',
    'input[placeholder*="OTP" i]',
    'input[placeholder*="otp" i]',
    'input[type="tel"]:not([maxlength="1"])',
    'input[type="number"]:not([maxlength="1"])',
  ];

  for (const sel of singleSelectors) {
    const entered = await safeType(page, sel, otp, { timeout: 5000, delay: 80 });
    if (entered) return true;
  }

  return false;
}

async function clickVerifyOtp(page) {
  const selectors = [
    'button:has-text("Verify")',
    'button:has-text("Submit")',
    'button:has-text("VERIFY")',
    'button:has-text("Login")',
    'button:has-text("LOG IN")',
    'button[type="submit"]',
  ];

  for (const sel of selectors) {
    const clicked = await safeClick(page, sel, { timeout: 5000 });
    if (clicked) return true;
  }
  return false;
}

async function verifyLogin(page) {
  await sleep(2000);

  const loggedOutIndicators = [
    'text=Sign In',
    'text=Login',
    'text=Enter mobile number',
    'text=Enter OTP',
  ];

  for (const sel of loggedOutIndicators) {
    try {
      const el = await page.$(sel);
      if (el && await el.isVisible()) {
        return false;
      }
    } catch {
      continue;
    }
  }

  const loggedInIndicators = [
    'text=My Account',
    'text=My Orders',
    '[class*="profile"]',
    '[class*="account"]',
    'text=Hi,',
    'text=Hello',
  ];

  for (const sel of loggedInIndicators) {
    try {
      const el = await page.$(sel);
      if (el && await el.isVisible()) {
        return true;
      }
    } catch {
      continue;
    }
  }

  // If no clear indicator, check URL
  const url = page.url();
  return !url.includes('login');
}
