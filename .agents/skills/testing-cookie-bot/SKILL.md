---
name: testing-cookie-bot
description: Test the Cookie Bot feature end-to-end. Use when verifying Cookie Bot UI, bot server, or cookie injection changes.
---

# Testing Cookie Bot

## Overview
The Cookie Bot is a Playwright-based automation tool that navigates to the Reliance Retail login URL, injects cookies, and harvests all resulting JioMart cookies.

## Architecture
- **Bot server** (`bot/index.js`): Express + Playwright on port 3001 (or `BOT_PORT` env var)
- **Frontend** (`frontend/`): React app on port 5173 with `/cookie-bot` route
- **Backend** (`backend/`): Spring Boot on port 8080 (required for auth)

## Starting Services

```bash
# 1. Backend (needs Maven)
cd backend && mvn spring-boot:run &

# 2. Frontend
cd frontend && npm run dev &

# 3. Bot server
cd bot && npm install && npx playwright install chromium && node index.js &
```

If ports are in use, free them first: `fuser -k <port>/tcp`

## Creating a Test User
The H2 database resets on backend restart. Create a demo user:
```bash
curl -X POST http://localhost:8080/api/admin/customers \
  -H 'Content-Type: application/json' \
  -d '{"name":"Demo Visitor","email":"demo@test.com","phone":"0000000000","accessKey":"jm_demo","role":"DEMO","credits":9999}'
```
Login credentials: access key `jm_demo`

## Test Cases

### 1. UI Rendering
- Navigate to `http://localhost:5173/cookie-bot` (must be logged in)
- Verify 4 input fields: `cra_access_token`, `cra_refresh_token`, `_ga (optional)`, `_ga_XGZ513W4JV (optional)`
- Verify description mentions all 4 cookie names
- Verify "Run Cookie Bot" button present

### 2. Validation
- Click Run with empty fields → toast error "Both tokens are required"
- `cra_access_token` and `cra_refresh_token` are required; `_ga` and `_ga_XGZ513W4JV` are optional

### 3. Bot Run with All 4 Cookies
- Fill all 4 fields with dummy values
- Click Run → blue "Running Bot..." status → green "Successfully collected N cookies"
- Expect **16 cookies**: 4 cookie types × 4 domains (`.jiomart.com`, `.relianceretail.com`, `www.jiomart.com`, `account.relianceretail.com`)
- Verify `_ga` and `_ga_XGZ513W4JV` rows appear with correct values

### 4. Bot Run without GA Cookies (Backward Compatibility)
- Fill only `cra_access_token` and `cra_refresh_token`, leave GA fields empty
- Expect **8 cookies**: only `cra_access_token` and `cra_refresh_token` × 4 domains
- No `_ga` or `_ga_XGZ513W4JV` rows should appear

### 5. Copy & Raw JSON
- "Copy All JSON" button copies all cookies as JSON to clipboard
- Individual copy buttons work per-cookie row
- "View Raw JSON" expands to show formatted JSON

### 6. Navigation Regression
- Header should show "Cookie Bot" nav link alongside other links (Dashboard, How to Use, etc.)

## Notes
- With dummy tokens, the Reliance Retail auth page won't show a "Continue" button (auth doesn't succeed), but the cookie injection and harvesting pipeline still executes.
- Cookies for `account.relianceretail.com` may have empty values — this is expected behavior from the auth page.
- The bot takes ~15-25 seconds to complete each run (headless browser startup + page navigation).
- Maven might not be on PATH in fresh environments — install via `sudo apt-get install -y maven` if needed.

## Devin Secrets Needed
No secrets required — uses dummy token values for testing.
