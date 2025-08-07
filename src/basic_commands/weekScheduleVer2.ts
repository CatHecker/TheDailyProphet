import { commandsFDW } from "./comandsFDW.js";

export const weekSchedule = async (chatId: string, group: string) => {
  let weekDays = [
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
  ];
  for (let i of weekDays) {
    await commandsFDW(i, chatId, group);
  }
};
