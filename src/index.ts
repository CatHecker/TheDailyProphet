import TelegramBot from "node-telegram-bot-api";
import express from "express";
import dotenv from "dotenv";
import cron from "node-cron";
import { downloadScheduleFile } from "./parser.js";
import { schedule } from "./parseExcelFile.js";
import { initDbConnection, queryCreator } from "./db.js";
import { checkCommands } from "./commands.js";

dotenv.config();

cron.schedule("0 0 * * *", () => {
  console.log("Запуск ежедневного обновления расписания");
  downloadScheduleFile();
});

// server creating
const app = express();
const port = process.env.PORT || 3000;
app.get("/", (req: any, res: any) => {
  res.send({});
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  initDbConnection(); // Запустить базу данных
  onListener(); // Запустить прослушивание сообщений
});

// bot creating
const token = process.env.TELEGRAM_BOT_TOKEN as string;
const bot = new TelegramBot(token, {
  polling: true,
});


export async function sendMessage(chatId: string, message: string, options={}) {
  await bot.sendMessage(chatId, message, options)
}

class userErrors {
  error_message: string;

  constructor(error_message: string) {
    this.error_message = error_message;
  }

  push_error(chatId: string) {
    bot.sendMessage(chatId, this.error_message);
  }
}

let noGroup = new userErrors(
  `❌ Такой группы не существует или её нет в базе данных бота ❌`
);

// listener сoобщений
let onListener = () => {
  bot.on("message", async (msg: any) => {  
    checkCommands(msg.chat.id, msg.text);
  });
};
