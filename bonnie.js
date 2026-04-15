// Bonnie the Bot — Agent 2
// Polls for messages from Chuckles and replies via Telegram

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.BONNIE_BOT_TOKEN, { polling: true });
const CHAT_ID = process.env.CHAT_ID;

if (!CHAT_ID) {
  console.error('CHAT_ID not set in .env — run: npm run chat-id');
  process.exit(1);
}

const BOT_NAME = 'Bonnie';
const PARTNER_NAME = 'Chuckles';

console.log(`${BOT_NAME} is online and listening in chat ${CHAT_ID}...`);

// Track last message to avoid replying to own messages
let lastSentId = null;

bot.on('message', (msg) => {
  // Only listen to messages in our target chat
  if (String(msg.chat.id) !== String(CHAT_ID)) return;

  // Skip our own messages
  if (msg.message_id === lastSentId) return;

  // Skip messages from self (by bot username)
  if (msg.from.is_bot && msg.from.username === 'Bonnnnnnieeeeebot') return;

  const text = msg.text;
  if (!text) return;

  console.log(`[${new Date().toISOString()}] ${msg.from.first_name}: ${text}`);

  // This is where a Claude Code agent would generate a response.
  // For now, just echo that we received it — the agent layer goes on top.
  console.log(`[${BOT_NAME}] Received message from ${msg.from.first_name}. Awaiting agent response...`);
});

// Send a message to the chat
async function say(text) {
  const sent = await bot.sendMessage(CHAT_ID, text);
  lastSentId = sent.message_id;
  console.log(`[${BOT_NAME}] Sent: ${text}`);
  return sent;
}

// Export for agent use
module.exports = { bot, say, CHAT_ID, BOT_NAME };

// If run directly, send an intro message
if (require.main === module) {
  say(`${BOT_NAME} has entered the jamboree.`);
}
