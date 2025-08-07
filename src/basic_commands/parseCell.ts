export function parseScheduleCell(cellText: string) {
  //const currentWeek = getCurrentAcademicWeek();
  let currentWeek = 3;
  const evenNow = currentWeek % 2 === 0;

  if (
    (evenNow && cellText.substring(0, 3) === "н/н") ||
    (!evenNow && cellText.substring(0, 3) === "ч/н")
  ) {
    return [];
  }
  cellText = cellText.replace(/^\s*(ч\/н|н\/н)\s*/i, "");

  let weeks = cellText.match(/\s*\d+(-\d+)?\s*неделя\s*\s*/i);
  if (weeks) {
    let week = weeks[0].replace(/\s*неделя\s*\s*/i, "").split("-");
    if (week.length === 1 && currentWeek !== parseInt(week[0])) return [];
    if (
      week.length === 2 &&
      (currentWeek < parseInt(week[0]) || currentWeek > parseInt(week[1]))
    )
      return [];
  }
  // Убираем в начале диапазон недель типа (1-15 неделя), (14 неделя)
  cellText = cellText.replace(/\(\s*\d+(-\d+)?\s*неделя\s*\)\s*/gi, "");

  // const teacherMatch = cellText.match(/([А-ЯЁ][а-яё]+\s[А-ЯЁ]\.?[А-ЯЁ]?\.?)/);

  // const roomMatch = cellText.match(/ауд\..*$/i);
  // let room = "";

  // if (roomMatch) {
  //   room = roomMatch[0].trim();
  // }

  // let subjectEndIndex = cellText.length;
  // if (teacherMatch)
  //   subjectEndIndex = Math.min(subjectEndIndex, teacherMatch.index!);
  // if (roomMatch) subjectEndIndex = Math.min(subjectEndIndex, roomMatch.index!);

  // const subject = cellText
  //   .slice(0, subjectEndIndex)
  //   .trim()
  //   .replace(/\.+$/g, "");

  // const teacher = teacherMatch ? teacherMatch[0].trim() : "";
  let firstPunctIndex = cellText.indexOf(".");

  // Если знака пунктуации нет, можно взять весь текст как subject
  if (firstPunctIndex === -1) firstPunctIndex = cellText.length;
  const subject = cellText.slice(0, firstPunctIndex).trim();
  const other = cellText.slice(firstPunctIndex + 1).trim();

  return [
    {
      subject,
      other,
    },
  ];
}

function getMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 (вс) - 6 (сб)
  const diff = (day === 0 ? -6 : 1) - day; // Сдвиг к понедельнику
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getCurrentAcademicWeek() {
  const now = new Date();
  const year = now.getFullYear();
  const sept1 = new Date(year, 8, 1); // 1 сентября

  const sept1Monday = getMonday(sept1);
  const currentMonday = getMonday(now);

  const diffMillis = currentMonday.valueOf() - sept1Monday.valueOf();
  const diffDays = diffMillis / (1000 * 60 * 60 * 24);
  const diffWeeks = Math.floor(diffDays / 7);

  return diffWeeks + 1; // 1 - если текущая неделя та, где 1 сентября
}
