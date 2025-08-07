import { commandsFDW } from "./basic_commands/comandsFDW.js";
import { groupChangeFn } from "./basic_commands/groupChange.js";
import { infoCommand } from "./basic_commands/infoCommand.js";
import { start_command } from "./basic_commands/start.js";
import { weekSchedule } from "./basic_commands/weekScheduleVer2.js";
import { getUserGroupFromCache } from "./redis_connections.js";

export const checkCommands = async function (chatId: string, text: string) {
  // Проверка базовых команд (начинающихся с '/')
  if (text != null && text != undefined && text != "" && text[0] == "/") {
    return start_command(chatId);
  }
  // Команда для смены группы
  if (groupChangeFn(text, chatId)) return;

  let group = await getUserGroupFromCache(chatId);

  if (group && (await commandsFDW(text, chatId, group))) return;
  if (group && text === "На неделю") await weekSchedule(chatId, group);
  if (text === "Инфо") {
    infoCommand(chatId, group);
  }
};
