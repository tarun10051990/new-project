# JioMart Bot Service

A Playwright-based automation service that integrates with the ELITe JioMart Bulk Order Portal to automate ordering on JioMart.

## Architecture

The bot runs as a standalone HTTP service (default: port 3001) that the Spring Boot backend calls when users click "START BULK ORDERS" in the portal.

**Flow:**
1. User adds products, selects address, and clicks "START BULK ORDERS" in the portal
2. Backend creates the order record and calls `/api/jiomart/place-order-cod`
3. Backend fetches account cookies (accessToken/refreshToken), cart items, and address
4. Backend sends a POST request to the bot service at `http://localhost:3001/execute-order`
5. Bot launches a Playwright browser, injects cookies, logs into JioMart
6. Bot adds all products to the JioMart cart, applies coupons, selects COD, and places the order
7. Bot returns the result to the backend

## Setup

```bash
cd bot
npm install
npx playwright install chromium
```

## Running

```bash
# Start the bot service
npm start

# Or with environment variables
BOT_PORT=3001 BOT_HEADLESS=true npm start
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BOT_PORT` | `3001` | Port the bot service listens on |
| `BOT_HEADLESS` | `true` | Run browser in headless mode (`false` for debugging) |
| `BOT_SLOW_MO` | `50` | Slow down actions by N ms (for debugging) |

## API Endpoints

### `POST /execute-order`
Full order flow: login → add products → checkout → COD → place order.

**Request:**
```json
{
  "accessToken": "cra_access_token_value",
  "refreshToken": "cra_refresh_token_value",
  "products": [
    { "productUrl": "https://www.jiomart.com/p/...", "quantity": 2 }
  ],
  "address": {
    "fullName": "John Doe",
    "pincode": "400001",
    "city": "Mumbai"
  },
  "couponCode": "SAVE10",
  "orderId": 123
}
```

### `POST /login-test`
Test if cookies are valid.

```json
{
  "accessToken": "cra_access_token_value",
  "refreshToken": "cra_refresh_token_value"
}
```

### `POST /add-to-cart`
Add products without placing an order.

### `GET /health`
Health check.

## Cookie Authentication

The bot uses JioMart's `cra_access_token` and `cra_refresh_token` cookies for authentication. These are stored as `accessToken` and `refreshToken` in the portal's Connected Accounts. Users can extract these cookies using the portal's Cookie Converter tool.
