# JioMart Cookie Bot

Automated browser bot that logs into JioMart via Reliance Retail auth and extracts session cookies.

## How It Works

1. Opens the Reliance Retail login URL in a headless browser
2. Injects `cra_access_token` and `cra_refresh_token` cookies on relevant domains
3. Refreshes the page so the server recognises the session
4. Clicks the **Continue** button to complete the auth handshake
5. Collects **all** cookies from the browser (JioMart + Reliance Retail)
6. Returns them as JSON

## Setup

```bash
cd bot
npm install
npx playwright install chromium
```

## Run

```bash
npm start          # starts on port 3001 (or BOT_PORT env var)
```

## API

### `POST /run-bot`

**Body:**
```json
{
  "cra_access_token": "<token>",
  "cra_refresh_token": "<token>"
}
```

**Response:**
```json
{
  "success": true,
  "count": 12,
  "cookies": [
    { "name": "...", "value": "...", "domain": "...", "path": "/", ... }
  ]
}
```

### `GET /health`

Returns `{ "status": "ok" }`.

## Frontend

The bot server is called from the **Cookie Bot** page in the React frontend (`/cookie-bot` route). Make sure the bot server is running before using the UI.
