# JioMart Automation Bot

Playwright-based bot that automates logging into JioMart, adding products to cart, and placing orders.

## Prerequisites

- **Node.js 18+**
- **Playwright** (installed via `npm install`)

## Setup

```bash
cd bot
npm install
npx playwright install chromium
```

Copy the example config and fill in your details:

```bash
cp config.example.json config.json
```

## Configuration

Edit `config.json`:

```json
{
  "jiomart": {
    "mobileNumber": "9876543210",
    "headless": false,
    "slowMo": 100,
    "timeout": 60000
  },
  "delivery": {
    "pincode": "400001",
    "addressIndex": 0
  },
  "products": [
    {
      "url": "https://www.jiomart.com/p/groceries/your-product/12345",
      "quantity": 2
    }
  ],
  "order": {
    "paymentMethod": "COD",
    "couponCode": ""
  }
}
```

### Config Options

| Field | Description |
|-------|-------------|
| `jiomart.mobileNumber` | Your JioMart registered mobile number |
| `jiomart.headless` | Run browser without GUI (`true`/`false`) |
| `jiomart.slowMo` | Delay between actions in ms (for stability) |
| `delivery.pincode` | Delivery pincode |
| `delivery.addressIndex` | Which saved address to use (0-based) |
| `products[].url` | JioMart product page URL |
| `products[].quantity` | Quantity to order |
| `order.paymentMethod` | `COD`, `UPI`, `CARD`, `NETBANKING`, or `WALLET` |
| `order.couponCode` | Coupon code to apply (optional) |

## Usage

### Login Only (saves session for future runs)

```bash
npm run login
```

The bot will:
1. Open JioMart
2. Enter your mobile number
3. Prompt you for the OTP received on your phone
4. Save cookies/session for future runs

### Add Products to Cart (default)

```bash
npm start
```

The bot will:
1. Login (using saved session or OTP)
2. Set delivery pincode
3. Add all configured products to cart
4. Show cart summary

### Full Order (login + cart + place order)

```bash
npm run order
```

The bot will:
1. Login
2. Set delivery pincode
3. Add products to cart
4. Select payment method
5. Ask for your confirmation before placing the order
6. Place the order

### Headless Mode

Add `--headless` flag to any command:

```bash
node src/index.js --headless
node src/index.js --place-order --headless
```

## Authentication

The bot supports two login methods:

1. **OTP Login** - Enters your mobile number, prompts you for the OTP
2. **Cookie/Session Reuse** - After first login, saves cookies in `cookies.json` and `storage-state.json` for subsequent runs

## Files Generated

| File | Description |
|------|-------------|
| `cookies.json` | Saved browser cookies (auto-generated) |
| `storage-state.json` | Browser session state (auto-generated) |
| `screenshot.png` | Final screenshot after bot run |

These files are gitignored and not committed to the repository.

## Safety

- The bot always asks for confirmation before placing an order
- Set `headless: false` to watch the bot work in real time
- Use `slowMo` to control the speed of automation
- Session data is saved locally and never uploaded
