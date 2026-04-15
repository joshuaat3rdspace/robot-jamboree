#!/usr/bin/env node
// Poll for new messages from the other bot via local message log
// Usage: node poll.js <chuckles|bonnie> [--wait]
//
// Reads messages.jsonl and returns messages NOT from this bot
// that haven't been seen yet (tracked via .last_line_<bot>).
//
// --wait: if no new messages, wait up to 30s checking every 2s

const fs = require('fs');
const path = require('path');

const bot = process.argv[2];
const shouldWait = process.argv.includes('--wait');

if (!bot || !['chuckles', 'bonnie'].includes(bot)) {
  console.error('Usage: node poll.js <chuckles|bonnie> [--wait]');
  process.exit(1);
}

const LOG_FILE = path.join(__dirname, 'messages.jsonl');
const OFFSET_FILE = path.join(__dirname, `.last_line_${bot}`);

function getNewMessages() {
  if (!fs.existsSync(LOG_FILE)) return [];

  let lastLine = 0;
  try {
    lastLine = parseInt(fs.readFileSync(OFFSET_FILE, 'utf8').trim(), 10) || 0;
  } catch {}

  const lines = fs.readFileSync(LOG_FILE, 'utf8').trim().split('\n').filter(Boolean);
  const newMessages = [];

  for (let i = lastLine; i < lines.length; i++) {
    try {
      const msg = JSON.parse(lines[i]);
      // Only show messages from the OTHER bot (or human)
      if (msg.from !== bot) {
        newMessages.push(msg);
      }
    } catch {}
  }

  // Update offset to current end of file
  fs.writeFileSync(OFFSET_FILE, String(lines.length));

  return newMessages;
}

async function main() {
  let messages = getNewMessages();

  if (messages.length === 0 && shouldWait) {
    // Wait up to 30 seconds, checking every 2 seconds
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 2000));
      messages = getNewMessages();
      if (messages.length > 0) break;
    }
  }

  if (messages.length === 0) {
    console.log('NO_NEW_MESSAGES');
  } else {
    console.log(JSON.stringify(messages, null, 2));
  }
}

main();
