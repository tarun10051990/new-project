import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = resolve(__dirname, '..', 'config.json');
const EXAMPLE_PATH = resolve(__dirname, '..', 'config.example.json');

export function loadConfig() {
  if (!existsSync(CONFIG_PATH)) {
    if (existsSync(EXAMPLE_PATH)) {
      console.error(
        '❌ config.json not found.\n' +
        '   Copy config.example.json to config.json and fill in your details:\n' +
        '   cp config.example.json config.json'
      );
    } else {
      console.error('❌ config.json not found. Create one with your JioMart settings.');
    }
    process.exit(1);
  }

  const raw = readFileSync(CONFIG_PATH, 'utf-8');
  const config = JSON.parse(raw);

  if (!config.jiomart) config.jiomart = {};
  if (!config.delivery) config.delivery = {};
  if (!config.products || !Array.isArray(config.products)) config.products = [];
  if (!config.order) config.order = {};

  config.jiomart.loginUrl = config.jiomart.loginUrl || 'https://www.jiomart.com/';
  config.jiomart.headless = config.jiomart.headless ?? false;
  config.jiomart.slowMo = config.jiomart.slowMo ?? 100;
  config.jiomart.timeout = config.jiomart.timeout ?? 60000;
  config.order.paymentMethod = config.order.paymentMethod || 'COD';

  return config;
}

export function parseArgs() {
  const args = process.argv.slice(2);
  return {
    loginOnly: args.includes('--login-only'),
    placeOrder: args.includes('--place-order'),
    headless: args.includes('--headless'),
  };
}
