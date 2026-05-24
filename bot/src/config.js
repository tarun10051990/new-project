export const BOT_PORT = process.env.BOT_PORT || 3001;
export const HEADLESS = process.env.BOT_HEADLESS !== 'false';
export const SLOW_MO = parseInt(process.env.BOT_SLOW_MO || '50', 10);
