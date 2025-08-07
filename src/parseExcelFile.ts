import XLSX from "xlsx";
import fs from "fs";

// Читаем файл из локального хранилища
const workbook = XLSX.readFile("schedule_2sem_2024_2025.xlsx");

// Получаем первый лист
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

for (const range of sheet["!merges"] || []) {
  const startCell = XLSX.utils.encode_cell(range.s);
  const startValue = sheet[startCell] ? sheet[startCell].v : null;

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!sheet[cellAddress]) {
        sheet[cellAddress] = { t: "s", v: startValue };
      }
    }
  }
}
// Конвертируем лист в JSON - массив объектов
export const schedule: string[][] = XLSX.utils.sheet_to_json(sheet, {
  header: 1,
  defval: "",
});

