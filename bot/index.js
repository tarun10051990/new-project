import express from 'express';
import cors from 'cors';
import { chromium } from 'playwright';

const app = express();
app.use(cors());
app.use(express.json());

const LOGIN_URL =
  'https://account.relianceretail.com/login/?client_id=fdb646ea-e708-4725-a953-228fa1cb8355&return_ui_url=www.jiomart.com/ext/retail-auth/ui/session?return_callback=https%3A//www.jiomart.com/auth/login%3FredirectUrl%3D/profile%26cl%3Dtrue%26application_id%3D685945f46c8c7aee3f3af605';

/**
 * POST /run-bot
 * Body: { cra_access_token, cra_refresh_token }
 *
 * 1. Launch browser and navigate to the Reliance login URL
 * 2. Inject cra_access_token and cra_refresh_token cookies
 * 3. Reload the page so the cookies take effect
 * 4. Click the "Continue" button
 * 5. Wait for navigation / redirects to settle
 * 6. Harvest all cookies from every relevant domain
 * 7. Return them as JSON
 */
app.post('/run-bot', async (req, res) => {
  const { cra_access_token, cra_refresh_token } = req.body;

  if (!cra_access_token || !cra_refresh_token) {
    return res.status(400).json({
      error: 'Both cra_access_token and cra_refresh_token are required',
    });
  }

  let browser = null;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

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
    }

    console.log('[bot] Setting cookies …');
    await context.addCookies(cookiesToSet);

    // Step 3 – Refresh the page so the server sees the injected cookies
    console.log('[bot] Refreshing page …');
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });

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
        .waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 })
        .catch(() => {
          // navigation may not always happen; ignore timeout
        });

      await page.waitForTimeout(3000);
    } else {
      console.log('[bot] Continue button not found – proceeding to collect cookies');
    }

    // Step 5 – Harvest all cookies from the browser context
    console.log('[bot] Collecting cookies …');
    const allCookies = await context.cookies();

    // Also try to pick up cookies from the JioMart domain explicitly
    const jioMartCookies = await context.cookies('https://www.jiomart.com');
    const relianceCookies = await context.cookies('https://account.relianceretail.com');

    // Merge & deduplicate
    const seen = new Set();
    const merged = [];
    for (const c of [...allCookies, ...jioMartCookies, ...relianceCookies]) {
      const key = `${c.name}||${c.domain}||${c.path}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(c);
      }
    }

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
