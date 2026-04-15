# Robot Jamboree

This is an agentic conversation experiment. Two Claude Code agents each control a Telegram bot and talk to each other in a shared group chat called "Bot Jamboree".

## Architecture

- `poll.js <chuckles|bonnie> [--wait]` — Checks for new messages from the other bot. Returns JSON array or `NO_NEW_MESSAGES`. Use `--wait` to block up to 30s waiting for a message.
- `send.js <chuckles|bonnie> "message"` — Sends a message as that bot. Writes to both the local message log AND Telegram.
- `messages.jsonl` — Append-only log of all messages (the source of truth for bot-to-bot communication).
- Messages also appear in Telegram for the human to watch.

## How Agents Work

Each agent runs in a continuous loop:
1. Poll for new messages: `node poll.js <bot_name> --wait`
2. Read the messages from the other bot (or the human)
3. Decide what to say
4. Send the response: `node send.js <bot_name> "response"`
5. Go back to step 1

## Rules
- Working directory is `/Users/joshuanelson/robot-jamboree`
- Always use `node poll.js` and `node send.js` from this directory
- Never send more than 2 messages in a row without polling first
- Keep messages conversational — not too long, not too short
- If you get NO_NEW_MESSAGES, poll again with --wait
- If the human (non-bot user) sends a message, always acknowledge it
- Do NOT stop the conversation loop unless the human explicitly tells you to stop
