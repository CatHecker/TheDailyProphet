import { queryCreator } from "../db.js";
import { sendMessage } from "../index.js";
import { schedule } from "../parseExcelFile.js";
import { cacheUserGroup } from "../redis_connections.js";

export const groupChangeFn = (text: string, chatId: string) => {
  let groupRowIndex = 15;
  const groupsList = schedule[groupRowIndex];

  for (let group of groupsList) {
    if (text === group || text === group.substring(0, 6)) {
      cacheUserGroup(chatId, group);
      const sql = `
  INSERT INTO users (chatId, \`group\`) 
  VALUES (?, ?)
  ON DUPLICATE KEY UPDATE \`group\` = VALUES(\`group\`);
`;
      queryCreator(sql, [chatId, group]);
      sendMessage(chatId, `✅ Ваша группа теперь: ${group}`, {
        reply_markup: {
          keyboard: [
            ["Понедельник", "Четверг"],
            ["Вторник", "Пятница"],
            ["Среда", "Суббота"],
            ["На неделю", "На сегодня", "На завтра", "Инфо"],
          ],
        },
      });
      return true;
    }
  }
};
