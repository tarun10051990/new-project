---
name: testing-jiomart
description: Test the ELITe JioMart bulk ordering app end-to-end. Use when verifying UI changes, API endpoints, or new features like OTP tracking and order management.
---

# Testing ELITe JioMart Bulk Ordering App

## Prerequisites

### Start Servers
1. **Backend**: `cd backend && mvn spring-boot:run` (runs on port 8080)
2. **Frontend**: `cd frontend && npm run dev` (runs on port 5173)
3. **Bot Server** (for Cookie Bot tests): `cd bot && node index.js` (runs on port 3001)
4. Wait for all servers to be ready before testing

### Authentication
- Demo access key: `jm_demo`
- Login at `http://localhost:5173/login`
- After login, redirects to dashboard at `/`

### Create Demo User
The H2 in-memory database resets on backend restart. Create a demo user:
```bash
curl -X POST http://localhost:8080/api/admin/customers \
  -H 'Content-Type: application/json' \
  -d '{"name":"Demo Visitor","email":"demo@test.com","phone":"0000000000","accessKey":"jm_demo","role":"DEMO","credits":9999}'
```

## Devin Secrets Needed
No secrets required — demo key `jm_demo` is hardcoded for testing.

## Key Test Flows

### 1. Dashboard & Bulk Order Flow
- Login with `jm_demo`
- Verify dashboard stats (Total Accounts, Total Orders, Today's Orders, Total Spent)
- Add address via "Add New Address" expandable section (Manual Entry tab)
- Select address from dropdown, add product URL in Cart #1
- Click "START BULK ORDERS" — expect success toast
- Verify Total Orders counter increments

### 2. Live OTP Tracker (`/otp-tracker`)
- Click "Open Live OTP Tracker" button on dashboard
- **Empty state**: Shows "No Active Orders" with Package icon and "Go to Dashboard" link
- **After placing order**: Tracking card appears with JioMart Order ID (format `JIO-{orderId}-{digits}`), "Processing" yellow badge
- **Expand card**: Shows detail grid (Order ID, Account ID, Mobile, OTP placeholder, Last Synced)
- **Auto-refresh**: Toggle checkbox controls 30-second polling interval
- **Cancel**: Click "Cancel Order" on expanded card — card removed from active list

### 3. Account Orders Modal
- Scroll to Connected Accounts table
- Add account via "+ Add Account" button (needs mobile, access token, refresh token)
- Click blue "Orders" button on account row
- Modal shows two tabs: "Orders" and "Tracking & OTPs"
- **Empty state**: "No orders found for this account." / "No tracking data for this account."
- **With data**: Orders tab shows order history with status badges; Tracking tab shows JioMart tracking IDs with OTP display
- **Cancel**: Cancel button on active orders/tracking entries

### 4. Cookie Bot (`/cookie-bot`)
- Click "Cookie Bot" in the header nav (or navigate to `/cookie-bot`)
- **UI has 4 input fields:**
  - `cra_access_token` (required)
  - `cra_refresh_token` (required)
  - `_ga` (optional)
  - `_ga_XGZ513W4JV` (optional)
- **Test with all 4 fields:** Use test values like `test_access_12345`, `test_refresh_67890`, `GA1.1.123456789.1234567890`, `GS1.1.abcdef.12345`
- Click "Run Cookie Bot" — shows "Running Bot..." with status banner
- **Expected result:** Success banner showing 40+ cookies collected
- **Key cookies to verify in results table:**
  - `f.session` — domain `.jiomart.com` (captured via Set-Cookie header interception)
  - `_gcl_au`, `_fbp`, `WZRK_G`, `WZRK_S_*` — tracking cookies
  - `RT` — domain `.www.jiomart.com`
  - `app_location_details`, `app_geolocation` — geolocation cookies
  - `_ga_XHR9Q2M3VV` — GA property cookie
  - `anonymous_id` — user identity cookie
- **With test tokens:** f.session will have empty value (expected — server does session cleanup)
- **With real tokens:** f.session and other cookies would have populated values
- **Bot takes ~60-90 seconds** to complete (launches headless browser, navigates JioMart)

#### Cookie Bot API Testing (without UI)
```bash
curl -X POST http://localhost:3001/run-bot \
  -H 'Content-Type: application/json' \
  -d '{"cra_access_token":"test_access_12345","cra_refresh_token":"test_refresh_67890","_ga":"GA1.1.123456789.1234567890","_ga_XGZ513W4JV":"GS1.1.abcdef.12345"}'
```
Expected: `{"success":true,"count":45,...}` with `f.session` in cookies array.

### 5. Creating Test Data via API
When you need orders tied to a specific account (the UI bulk order doesn't always set accountId):
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"accountId":1,"addressId":1,"totalAmount":299.0,"repeatCount":1,"status":"Processing","items":[{"productUrl":"https://www.jiomart.com/p/test/12345","quantity":1}]}'
```

## Database
- H2 in-memory database — resets on backend restart
- All test data must be recreated each session

## Common Issues
- If port 5173 is already in use, Vite picks next available port (check terminal output)
- Backend must be running before frontend API calls work (CORS configured for localhost:5173)
- The OTP Tracker page uses the `/api/tracking/{userId}/active` endpoint which excludes cancelled orders
- Order cancellation updates both BulkOrder and OrderTracking entities
- **Cookie Bot:** If `f.session` is missing from results, check that `response.headersArray()` is used (not `response.allHeaders()`) for Set-Cookie parsing. The `allHeaders()` method merges multiple Set-Cookie headers into a comma-separated string which breaks parsing.
- **Cookie Bot:** Some cookies like `AKA_A2`, `user_groups` may only appear with valid (non-test) CRA tokens
- **Cookie Bot:** The bot server must have Playwright and Chromium installed: `cd bot && npm install && npx playwright install chromium`
