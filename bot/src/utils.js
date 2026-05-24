import { createInterface } from 'readline';

export function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function waitForSelector(page, selector, options = {}) {
  const timeout = options.timeout || 30000;
  try {
    await page.waitForSelector(selector, { timeout, ...options });
    return true;
  } catch {
    return false;
  }
}

export async function safeClick(page, selector, options = {}) {
  try {
    await page.waitForSelector(selector, { timeout: options.timeout || 10000 });
    await page.click(selector);
    return true;
  } catch {
    console.warn(`Could not click: ${selector}`);
    return false;
  }
}

export async function safeType(page, selector, text, options = {}) {
  try {
    await page.waitForSelector(selector, { timeout: options.timeout || 10000 });
    await page.fill(selector, '');
    await page.type(selector, text, { delay: options.delay || 50 });
    return true;
  } catch {
    console.warn(`Could not type into: ${selector}`);
    return false;
  }
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function log(prefix, message) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] [${prefix}] ${message}`);
}
