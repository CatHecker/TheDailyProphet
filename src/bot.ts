import TelegramBot from "node-telegram-bot-api";
import { checkCommands } from "./commands.js";
import dotenv from "dotenv";
dotenv.config();
// bot creating
const token = process.env.TELEGRAM_BOT_TOKEN as string;
const bot = new TelegramBot(token, {
  polling: true,
});

export async function sendMessage(
  chatId: string,
  message: string,
  options = {}
) {
  await bot.sendMessage(chatId, message, options);
}

// listener сoобщений
export const onListener = () => {
  bot.on("message", async (msg: any) => {
    checkCommands(msg.chat.id, msg.text);
  });
};
