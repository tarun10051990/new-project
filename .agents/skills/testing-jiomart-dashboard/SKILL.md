---
name: testing-jiomart-dashboard
description: Test the ELITe JioMart Bulk Order Dashboard end-to-end. Use when verifying UI, API, or full-stack changes to the bulk ordering application.
---

# Testing the ELITe JioMart Bulk Order Dashboard

## Environment Setup

### Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run &
# Runs on http://localhost:8080
# Uses H2 in-memory database (resets on restart)
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev &
# Runs on http://localhost:5173
# API calls go to http://localhost:8080/api
```

Wait for both servers to be ready before testing.

## Auth

- Demo access key: `jm_demo` (creates "Demo Visitor" user with 9999.0 credits)
- Any key starting with `jm_` is accepted and auto-creates a user
- Invalid keys (without `jm_` prefix) show error toast

## Devin Secrets Needed

No secrets required. The app uses a demo key `jm_demo` for testing.

## Core Test Flows

### 1. Login Flow
- Navigate to `/login`
- Test invalid key (no `jm_` prefix) → error toast "Access key must start with jm_"
- Test valid key `jm_demo` → redirects to `/` with "Demo Visitor" and 9999.00 Cr

### 2. Dashboard Stats
- After login, verify header stats: Total Accounts, Total Orders, Today's Orders, Total Spent
- Stats load on page mount and may not auto-refresh after actions (refresh page to see updated stats)

### 3. Address Management
- Click "Add New Address" to expand the form
- 3 tabs: "Import from Account", "JSON Payload", "Manual Entry"
- Fill manual entry: Full Name, Pincode, Flat/House No, City, State
- Click "Save Address to Database" → toast "Address saved"
- Verify address appears in "Target Delivery Address" dropdown

### 4. Cart Configuration
- Enter product URL in Cart #1 input
- Set quantity, coupon code, expected price
- Click "Add Another Cart" for multi-cart testing
- Click "Add Product" inside a cart for multiple product URLs

### 5. Bulk Order Submission
- Select address from dropdown
- Set repeat order count
- Click "START BULK ORDERS" → success toast "Bulk orders started successfully!"
- Without address selected → error toast "Please select a delivery address"

### 6. Connected Accounts
- Scroll to "Connected Accounts" section
- Click "+ Add Account" → modal with Mobile Number, Access Token, Refresh Token fields
- Fill and submit → account appears in table with "Active" state
- Click trash icon to delete → returns to "No accounts found."

### 7. Theme Toggle
- Click sun/moon icon in header toolbar
- Verify background switches between dark and light
- CSS variables control theming via `data-theme` attribute on `<html>`

### 8. How to Use Page
- Click "How to Use" link in header → navigates to `/howtouse`
- Should show 4 numbered step cards
- Click "I'm Ready, Take Me Back" → returns to dashboard

### 9. Cookie Converter
- Click "Cookie Converter" link → navigates to `/converter`
- Paste cookie text like: `cra_access_token=abc123; cra_refresh_token=xyz789`
- Click "Extract & Convert" → output shows JSON array with extracted tokens
- Badge shows count of accounts extracted

### 10. Logout
- Click "Logout" in header → redirects to `/login`
- Directly navigating to `/` should redirect to `/login` (protected route)

## Tips

- The H2 database resets on backend restart, so all data (users, addresses, accounts, orders) is ephemeral
- The "Add New Address" section might be collapsed by default — click to expand before filling the form
- After submitting a bulk order, stats in the header update on next page load (navigation away and back, or refresh)
- The theme toggle icon changes between sun and moon icons depending on current theme
- Cookie Converter is a client-side only tool — it doesn't make API calls
- The frontend uses react-hot-toast for notifications — toasts appear at top-center and auto-dismiss
