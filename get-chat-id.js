// Utility: Add both bots to a Telegram group, then run this to discover the chat ID.
// Send any message in the group after starting this script.

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.CHUCKLES_BOT_TOKEN, { polling: true });

console.log('Listening for messages... Send something in the group chat.');

bot.on('message', (msg) => {
  console.log(`\nChat ID: ${msg.chat.id}`);
  console.log(`Chat title: ${msg.chat.title || 'DM'}`);
  console.log(`From: ${msg.from.first_name} (${msg.from.id})`);
  console.log(`Message: ${msg.text}`);
  console.log(`\nAdd this to your .env:\nCHAT_ID=${msg.chat.id}`);
  process.exit(0);
});
