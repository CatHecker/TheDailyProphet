import express from "express";

import cron from "node-cron";
import { downloadScheduleFile } from "./src/parser.js";
import { initDbConnection } from "./src/db.js";
import { onListener } from "./src/bot.js";


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
