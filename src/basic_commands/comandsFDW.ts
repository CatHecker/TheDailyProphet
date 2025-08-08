import { sendMessage } from "../bot.js";
import { schedule } from "../parseExcelFile.js";
import { parseScheduleCell } from "./parseCell.js";

export type CellType = {
  subject: string;
  other: string;
};
// schedule for week
export type WeekDay =
  | "Понедельник"
  | "Вторник"
  | "Среда"
  | "Четверг"
  | "Пятница"
  | "Суббота";

export function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const commandsFDW = async (
  text: string,
  chatId: string,
  group: string
): Promise<Boolean> => {
  const weekDayObj: Record<WeekDay, string> = {
    Понедельник: group,
    Вторник: "вт",
    Среда: "ср",
    Четверг: "чт",
    Пятница: "пт",
    Суббота: "сб",
  };
  let now = new Date();

  if (text === "На сегодня") {
    if (now.getDay() === 0) {
      sendMessage(chatId, "Сегодня воскресенье 🤪");
      return true;
    }
    let nowDayWeek = now.getDay() === 0 ? 0 : now.getDay() - 1;
    text = Object.keys(weekDayObj)[nowDayWeek];
  }
  if (text === "На завтра") {
    if (now.getDay() === 6) {
      sendMessage(chatId, "Завтра воскресенье 🤪");
      return true;
    }
    text = Object.keys(weekDayObj)[now.getDay()];
  }
  if (!(text in weekDayObj)) {
    return false;
  }
  const abbrWeekDay = weekDayObj[text as WeekDay];
  const groupRowIndex = 15;
  const groupsList = schedule[groupRowIndex];
  const groupIndex = groupsList.indexOf(group);
  let lectionsFDW = `<b>${text}:</b>\n\n`;
  let counterOfLections = 0;

  let start = false;
  let temp = "";
  for (let row of schedule) {
    if (!row[1]) start = false;
    if (abbrWeekDay === row[groupIndex]) {
      start = true;
    } else if (
      start &&
      Object.values(weekDayObj).includes(row[groupIndex]) &&
      row[groupIndex] !== abbrWeekDay
    ) {
      break;
    } else if (start && row[groupIndex] != null && row[groupIndex] !== "") {
      const parsedText = parseScheduleCell(row[groupIndex]);
      if (parsedText.length && row[groupIndex] !== temp) {
        temp = row[groupIndex];
        let parsedCell: CellType = parsedText[0];

        lectionsFDW += `<b>${++counterOfLections}) ${escapeHtml(
          parsedCell.subject
        )}</b>\n`;
        lectionsFDW += `⏰ ${escapeHtml(row[1].trim() || "-")}\n`;
        lectionsFDW += `🏫 ${
          parsedCell.other ? `<i>${escapeHtml(parsedCell.other)}</i>` : "-"
        }\n\n`;
      }
    }
  }
  if (lectionsFDW === `<b>${text}:</b>\n\n`) {
    lectionsFDW = "В этот день пар нет 🥳";
  }
  await sendMessage(chatId, lectionsFDW, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
  return true;
};
