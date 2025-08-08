import { sendMessage } from "../bot.js";


export const start_command = function (chatId: string) {
  let startMessage = `
<strong>🌟 Доброго дня, студент! 🌟</strong>

📅 Здесь ты можешь найти расписание своей группы 
🔍 Чтобы начать введи номер группы (например: 09-101)
`;
  sendMessage(chatId, startMessage, {
    parse_mode: "HTML",
  });
};
