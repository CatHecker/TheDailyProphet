import { sendMessage } from "../index.js";
import { schedule } from "../parseExcelFile.js";
import { CellType, escapeHtml } from "./comandsFDW.js";
import { parseScheduleCell } from "./parseCell.js";

export const weekSchedule = (chatId: string, group: string) => {
  const groupRowIndex = 15;
  const groupsList = schedule[groupRowIndex];
  const groupIndex = groupsList.indexOf(group);
  //let lectionsFDW = `<b>${text}:</b>\n\n`;
  let lectionsFDW = "";
  let counterOfLections = 0;
  const weekDayObj = {
    [group]: "Понедельник",
    вт: "Вторник",
    ср: "Среда",
    чт: "Четверг",
    пт: "Пятница",
    сб: "Суббота",
  };
  let start = false;
  let temp = ''
  for (let row of schedule) {
    if (!row[1]) start = false;
    if (row[groupIndex] === group) {
      if ((counterOfLections = 0)) {
        lectionsFDW += "В этот день пар нет! 🥳";
      }
      start = true;
      lectionsFDW += "<b>Понедельник</b>\n";
      counterOfLections = 0;
    }
    if (Object.keys(weekDayObj).includes(row[groupIndex])) {
      if ((counterOfLections = 0)) {
        lectionsFDW += "В этот день пар нет! 🥳";
      }
      lectionsFDW += `<b>${weekDayObj[row[groupIndex]]}</b>\n`;
      counterOfLections = 0;
    } else if (start && row[groupIndex] != null && row[groupIndex] !== "") {
      const parsedText = parseScheduleCell(row[groupIndex]);
      if (parsedText.length && row[groupIndex] !== temp) {
        temp = row[groupIndex];
        let parsedCell: CellType = parseScheduleCell(row[groupIndex])[0];

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
  if (lectionsFDW === "") {
    lectionsFDW = "На этой неделе пар нет 💥🥳";
  }
  sendMessage(chatId, lectionsFDW, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
};
