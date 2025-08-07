import fetch from "node-fetch";
import fs from "fs";
import * as cheerio from "cheerio";
import iconv from 'iconv-lite';

const scheduleUrl = "https://kpfu.ru/computing-technology/raspisanie";

export async function downloadScheduleFile() {
  try {
    const response = await fetch(scheduleUrl);
    const buffer = await response.arrayBuffer();
    const decodedBody = iconv.decode(Buffer.from(buffer), 'windows-1251');

    const $ = cheerio.load(decodedBody);
    let fileLink: any = null;

    $("a").each((i, el) => {
      const text = $(el).text().trim();
      if (text.includes("Расписание на 2 семестр 2024/2025 года")) {
        console.log("Найдено")
        fileLink = $(el).attr("href");
        return false; 
      }
    });

    if (!fileLink) {
      console.log("Ссылка на расписание не найдена");
      return;
    }

    // Формируем полный URL, если ссылка относительная
    if (fileLink.startsWith("/")) {
      fileLink = "https://kpfu.ru" + fileLink;
    }

    // Скачиваем файл
    const fileResponse = await fetch(fileLink);
    const bufferNew = await fileResponse.arrayBuffer();
    fs.writeFileSync('schedule_2sem_2024_2025.xlsx', Buffer.from(bufferNew));
    console.log("Файл скачан и обновлен");
  } catch (error) {
    console.error("Ошибка при скачивании расписания:", error);
  }
}


