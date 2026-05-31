import express from 'express';
import cors from 'cors';
import { chromium } from 'playwright';

/**
 * Decode the JWT payload (no verification) and extract the User-Agent
 * from device_info.os_name.  Falls back to a sensible default.
 */
function extractUserAgentFromToken(token) {
  const DEFAULT_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36';
  try {
    const parts = token.split('.');
    if (parts.length < 2) return DEFAULT_UA;
    // Base64url → Base64, then decode
    let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (payload.length % 4) payload += '=';
    const json = Buffer.from(payload, 'base64').toString('utf-8');
    const data = JSON.parse(json);
    const ua = data?.device_info?.os_name;
    if (ua && typeof ua === 'string' && ua.length > 10) {
      console.log(`[bot] Extracted User-Agent from token: ${ua}`);
      return ua;
    }
  } catch (err) {
    console.log(`[bot] Could not decode token for User-Agent: ${err.message}`);
  }
  console.log('[bot] Using default User-Agent');
  return DEFAULT_UA;
}

const app = express();
app.use(cors());
app.use(express.json());

const LOGIN_URL =
  'https://account.relianceretail.com/login/?client_id=fdb646ea-e708-4725-a953-228fa1cb8355&return_ui_url=www.jiomart.com/ext/retail-auth/ui/session?return_callback=https%3A//www.jiomart.com/auth/login%3FredirectUrl%3D/profile%26cl%3Dtrue%26application_id%3D685945f46c8c7aee3f3af605';

/**
 * POST /run-bot
 * Body: { cra_access_token, cra_refresh_token, _ga, _ga_XGZ513W4JV }
 *
 * 1. Launch browser and navigate to the Reliance login URL
 * 2. Inject cra_access_token, cra_refresh_token, _ga, and _ga_XGZ513W4JV cookies
 * 3. Reload the page so the cookies take effect
 * 4. Click the "Continue" button
 * 5. Wait for navigation / redirects to settle
 * 6. Harvest all cookies from every relevant domain
 * 7. Return them as JSON
 */
app.post('/run-bot', async (req, res) => {
  const { cra_access_token, cra_refresh_token, _ga, _ga_XGZ513W4JV } = req.body;

  if (!cra_access_token || !cra_refresh_token) {
    return res.status(400).json({
      error: 'Both cra_access_token and cra_refresh_token are required',
    });
  }

  let browser = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
      ],
    });
    // Extract User-Agent from the JWT token so the browser fingerprint matches
    // the device that originally created the token – this is required for
    // JioMart's session endpoint to return a populated f.session cookie.
    const userAgent = extractUserAgentFromToken(cra_access_token);
    const context = await browser.newContext({ userAgent });
    const page = await context.newPage();

    // Remove navigator.webdriver flag so sites don't detect automation
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    // Track server-set cookies via Set-Cookie headers (catches cookies that may
    // be briefly set and then cleared by subsequent API calls, like f.session)
    const serverSetCookies = [];
    page.on('response', async (response) => {
      try {
        const hdrs = await response.headersArray();
        for (const { name: hdrName, value: hdrValue } of hdrs) {
          if (hdrName.toLowerCase() !== 'set-cookie') continue;
          const raw = hdrValue;
          const nameVal = raw.split(';')[0] || '';
          const eqIdx = nameVal.indexOf('=');
          if (eqIdx < 1) continue;
          const name = nameVal.substring(0, eqIdx).trim();
          const value = nameVal.substring(eqIdx + 1).trim();
          const domainMatch = raw.match(/Domain=([^;]+)/i);
          const pathMatch = raw.match(/Path=([^;]+)/i);
          const domain = domainMatch ? domainMatch[1].trim() : new URL(response.url()).hostname;
          const path = pathMatch ? pathMatch[1].trim() : '/';
          serverSetCookies.push({
            name,
            value,
            domain,
            path,
            httpOnly: /httponly/i.test(raw),
            secure: /secure/i.test(raw),
            sameSite: /samesite=strict/i.test(raw) ? 'Strict'
              : /samesite=lax/i.test(raw) ? 'Lax'
              : /samesite=none/i.test(raw) ? 'None' : 'Lax',
          });
        }
      } catch {
        // ignore parse errors
      }
    });

    // Step 1 – Navigate to the Reliance Retail login page
    console.log('[bot] Opening login URL …');
    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Step 2 – Inject the two CRA cookies on the relevant domains
    const cookieDomains = [
      '.jiomart.com',
      '.relianceretail.com',
      'account.relianceretail.com',
      'www.jiomart.com',
    ];

    const cookiesToSet = [];
    for (const domain of cookieDomains) {
      cookiesToSet.push(
        {
          name: 'cra_access_token',
          value: cra_access_token,
          domain,
          path: '/',
          httpOnly: false,
          secure: true,
          sameSite: 'None',
        },
        {
          name: 'cra_refresh_token',
          value: cra_refresh_token,
          domain,
          path: '/',
          httpOnly: false,
          secure: true,
          sameSite: 'None',
        },
      );

      if (_ga) {
        cookiesToSet.push({
          name: '_ga',
          value: _ga,
          domain,
          path: '/',
          httpOnly: false,
          secure: false,
          sameSite: 'Lax',
        });
      }

      if (_ga_XGZ513W4JV) {
        cookiesToSet.push({
          name: '_ga_XGZ513W4JV',
          value: _ga_XGZ513W4JV,
          domain,
          path: '/',
          httpOnly: false,
          secure: false,
          sameSite: 'Lax',
        });
      }
    }

    console.log('[bot] Setting cookies …');
    await context.addCookies(cookiesToSet);

    // Step 3 – Refresh the page so the server sees the injected cookies
    console.log('[bot] Refreshing page …');
    await page.reload({ waitUntil: 'networkidle', timeout: 60000 }).catch(() => {
      console.log('[bot] Page reload timed out – continuing');
    });

    // Give the page a moment to render dynamic content
    await page.waitForTimeout(3000);

    // Step 4 – Click the "Continue" button
    console.log('[bot] Looking for Continue button …');
    const continueBtn = await page.$(
      'button:has-text("Continue"), button:has-text("continue"), a:has-text("Continue"), input[value="Continue" i]',
    );

    if (continueBtn) {
      console.log('[bot] Clicking Continue …');
      await continueBtn.click();

      // Wait for navigation or network to settle after clicking
      await page
        .waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 })
        .catch(() => {
          // navigation may not always happen; ignore timeout
        });

      // Wait for redirect chain to complete
      await page.waitForTimeout(5000);
    } else {
      console.log('[bot] Continue button not found – proceeding to collect cookies');
    }

    // Step 5a – Capture cookies right after the auth redirect settles
    // (f.session and other server-side cookies may be set during the redirect)
    console.log('[bot] Capturing cookies after auth redirect …');
    const postAuthCookies = await context.cookies();
    console.log(`[bot] Post-auth cookies: ${postAuthCookies.length}`);

    // Step 5b – Navigate to JioMart to trigger all tracking/session scripts
    console.log('[bot] Navigating to www.jiomart.com to collect all cookies …');
    await page.goto('https://www.jiomart.com', {
      waitUntil: 'networkidle',
      timeout: 60000,
    }).catch(() => {
      console.log('[bot] JioMart page load timed out – continuing with cookie collection');
    });

    // Wait for tracking scripts (GA, CleverTap, Facebook Pixel, etc.) to set cookies
    await page.waitForTimeout(5000);

    // Step 5c – Navigate to /profile to trigger additional session/server cookies
    console.log('[bot] Navigating to JioMart profile page …');
    await page.goto('https://www.jiomart.com/profile', {
      waitUntil: 'networkidle',
      timeout: 30000,
    }).catch(() => {
      console.log('[bot] Profile page load timed out – continuing');
    });
    await page.waitForTimeout(2000);

    // Step 6 – Harvest ALL cookies from the browser context
    console.log('[bot] Collecting all cookies …');
    const postNavigationCookies = await context.cookies();

    // Also explicitly request cookies for each relevant URL
    const urlsToCheck = [
      'https://www.jiomart.com',
      'https://www.jiomart.com/profile',
      'https://jiomart.com',
      'https://account.relianceretail.com',
      'https://relianceretail.com',
    ];

    // Start with post-auth cookies, post-navigation cookies, and server-set cookies
    // (server-set cookies include any that were briefly set then cleared by later requests)
    console.log(`[bot] Server-set cookies intercepted: ${serverSetCookies.length}`);
    let allCollected = [...postAuthCookies, ...postNavigationCookies, ...serverSetCookies];
    for (const url of urlsToCheck) {
      try {
        const urlCookies = await context.cookies(url);
        allCollected.push(...urlCookies);
      } catch {
        // ignore errors for individual URL cookie fetches
      }
    }

    // Merge & deduplicate by name+domain+path
    // Always prefer the entry with a non-empty value (captures cookies that were
    // briefly set then cleared, like f.session with invalid tokens)
    const cookieMap = new Map();
    for (const c of allCollected) {
      const key = `${c.name}||${c.domain}||${c.path}`;
      const existing = cookieMap.get(key);
      if (!existing) {
        cookieMap.set(key, c);
      } else if (c.value && !existing.value) {
        // prefer non-empty value
        cookieMap.set(key, c);
      } else if (c.value && existing.value && c.value.length > existing.value.length) {
        // when both have values, prefer the longer (more complete) one
        cookieMap.set(key, c);
      }
    }
    const merged = [...cookieMap.values()];
    
    console.log(`[bot] Done – collected ${merged.length} cookies`);
    res.json({ success: true, cookies: merged, count: merged.length });
  } catch (err) {
    console.error('[bot] Error:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.BOT_PORT || 3001;
app.listen(PORT, () => console.log(`[bot] Cookie bot server running on http://localhost:${PORT}`));
