---
name: testing-jiomart
description: Test the ELITe JioMart bulk ordering app end-to-end. Use when verifying UI changes, API endpoints, or new features like OTP tracking and order management.
---

# Testing ELITe JioMart Bulk Ordering App

## Prerequisites

### Start Servers
1. **Backend**: `cd backend && mvn spring-boot:run` (runs on port 8080)
2. **Frontend**: `cd frontend && npm run dev` (runs on port 5173)
3. Wait for both to be ready before testing

### Authentication
- Demo access key: `jm_demo`
- Login at `http://localhost:5173/login`
- After login, redirects to dashboard at `/`

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

### 4. Creating Test Data via API
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
