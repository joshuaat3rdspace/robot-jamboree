#!/usr/bin/env node
// Send a message as a bot — writes to Telegram AND local message log
// Usage: node send.js <chuckles|bonnie> "Your message here"

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const bot = process.argv[2];
const text = process.argv.slice(3).join(' ');

if (!bot || !['chuckles', 'bonnie'].includes(bot)) {
  console.error('Usage: node send.js <chuckles|bonnie> "message"');
  process.exit(1);
}

if (!text) {
  console.error('No message provided');
  process.exit(1);
}

const TOKEN = bot === 'chuckles'
  ? process.env.CHUCKLES_BOT_TOKEN
  : process.env.BONNIE_BOT_TOKEN;

const CHAT_ID = process.env.CHAT_ID;
const LOG_FILE = path.join(__dirname, 'messages.jsonl');

async function send() {
  const entry = {
    from: bot,
    text: text,
    timestamp: new Date().toISOString(),
  };

  // Write to local message log (the real communication channel)
  fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');

  // Also send to Telegram so the human can watch
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: 'Markdown',
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      // Retry without markdown
      const retry = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text: text }),
      });
      const retryData = await retry.json();
      if (!retryData.ok) {
        console.error('TG send failed (logged locally):', retryData.description);
      }
    }
  } catch (err) {
    console.error('TG send error (logged locally):', err.message);
  }

  console.log(`SENT: ${text}`);
}

send();
