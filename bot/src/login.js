import { safeClick, sleep, log } from './utils.js';

/**
 * Login to JioMart by injecting cookies (cra_access_token + cra_refresh_token)
 * and navigating to the site. The cookies authenticate the session automatically.
 */
export async function loginWithCookies(page, accessToken, refreshToken) {
  log('LOGIN', 'Setting JioMart authentication cookies...');

  const cookies = [
    {
      name: 'cra_access_token',
      value: accessToken,
      domain: '.jiomart.com',
      path: '/',
      httpOnly: false,
      secure: true,
      sameSite: 'None',
    },
    {
      name: 'cra_refresh_token',
      value: refreshToken,
      domain: '.jiomart.com',
      path: '/',
      httpOnly: false,
      secure: true,
      sameSite: 'None',
    },
  ];

  await page.context().addCookies(cookies);

  log('LOGIN', 'Navigating to JioMart...');
  await page.goto('https://www.jiomart.com/', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await sleep(3000);

  // Try clicking Sign In / Login to trigger cookie-based auto-login
  log('LOGIN', 'Looking for Sign In / Login button...');
  const signInClicked = await tryClickSignIn(page);

  if (signInClicked) {
    await sleep(2000);

    // If a "Continue" button appears after cookie injection, click it
    log('LOGIN', 'Looking for Continue button...');
    await tryClickContinue(page);
    await sleep(3000);
  }

  // Verify login status
  const loggedIn = await verifyLogin(page);
  if (loggedIn) {
    log('LOGIN', 'Successfully logged in via cookies!');
  } else {
    log('LOGIN', 'Cookie login may not have fully completed. Proceeding anyway...');
  }

  return loggedIn;
}

/**
 * Login using a raw cookie string (e.g., from a cookies file).
 * Format: "cra_access_token=xxx; cra_refresh_token=yyy; other=zzz"
 */
export async function loginWithCookieString(page, cookieString) {
  log('LOGIN', 'Parsing cookie string...');

  const accessMatch = cookieString.match(/cra_access_token[=:]\s*([^\s;,]+)/i);
  const refreshMatch = cookieString.match(/cra_refresh_token[=:]\s*([^\s;,]+)/i);

  if (!accessMatch) {
    log('LOGIN', 'No cra_access_token found in cookie string');
    return false;
  }

  const accessToken = accessMatch[1];
  const refreshToken = refreshMatch ? refreshMatch[1] : '';

  return loginWithCookies(page, accessToken, refreshToken);
}

/**
 * Login using a cookies JSON file (array of cookie objects or raw cookie text).
 */
export async function loginWithCookieFile(page, cookieData) {
  log('LOGIN', 'Processing cookie data...');

  if (typeof cookieData === 'string') {
    // Try parsing as JSON first
    try {
      const parsed = JSON.parse(cookieData);
      if (Array.isArray(parsed)) {
        return loginWithCookieArray(page, parsed);
      }
      if (parsed.cra_access_token) {
        return loginWithCookies(page, parsed.cra_access_token, parsed.cra_refresh_token || '');
      }
    } catch {
      // Not JSON, treat as raw cookie string
      return loginWithCookieString(page, cookieData);
    }
  }

  if (Array.isArray(cookieData)) {
    return loginWithCookieArray(page, cookieData);
  }

  if (cookieData.cra_access_token) {
    return loginWithCookies(page, cookieData.cra_access_token, cookieData.cra_refresh_token || '');
  }

  log('LOGIN', 'Could not extract cookies from provided data');
  return false;
}

async function loginWithCookieArray(page, cookieArray) {
  // Look for cra_access_token and cra_refresh_token in the array
  let accessToken = '';
  let refreshToken = '';

  for (const cookie of cookieArray) {
    if (cookie.name === 'cra_access_token' || cookie.cra_access_token) {
      accessToken = cookie.value || cookie.cra_access_token || '';
    }
    if (cookie.name === 'cra_refresh_token' || cookie.cra_refresh_token) {
      refreshToken = cookie.value || cookie.cra_refresh_token || '';
    }
  }

  if (!accessToken && cookieArray.length > 0 && cookieArray[0].cra_access_token) {
    accessToken = cookieArray[0].cra_access_token;
    refreshToken = cookieArray[0].cra_refresh_token || '';
  }

  if (!accessToken) {
    log('LOGIN', 'No cra_access_token found in cookie array');
    return false;
  }

  return loginWithCookies(page, accessToken, refreshToken);
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
  ];

  for (const sel of selectors) {
    try {
      const el = await page.$(sel);
      if (el && await el.isVisible()) {
        await el.click();
        return true;
      }
    } catch {
      continue;
    }
  }
  return false;
}

async function tryClickContinue(page) {
  const selectors = [
    'button:has-text("Continue")',
    'button:has-text("CONTINUE")',
    'button:has-text("Proceed")',
    'button:has-text("Submit")',
    'button[type="submit"]',
  ];

  for (const sel of selectors) {
    const clicked = await safeClick(page, sel, { timeout: 5000 });
    if (clicked) {
      log('LOGIN', 'Clicked Continue button');
      return true;
    }
  }
  return false;
}

async function verifyLogin(page) {
  await sleep(2000);

  const loggedInIndicators = [
    'text=My Account',
    'text=My Orders',
    'text=Hi,',
    'text=Hello',
    '[class*="profile"]',
    '[class*="account"]',
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

  // Check URL — if we're not on login page, probably logged in
  const url = page.url();
  return !url.includes('login');
}
