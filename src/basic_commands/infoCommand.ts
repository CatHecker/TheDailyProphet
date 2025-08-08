import { sendMessage } from "../bot.js";

export const infoCommand = (chatId: string, group: string | null) => {
  sendMessage(
    chatId,
    `
👥 ${group ? `Вы выбрали группу: ${group}` : "У вас не выбрана группа!"}

✉️ По всем вопросам и предложениям - обращайтесь к нам!

🧑‍💻 Разработчики: <a href='t.me/chud0kot'>ChudoKOT</a>, <a href='t.me/iWanderling'>Никита Слывка</a>

💸 <a href='https://www.tinkoff.ru/rm/akhiyarov.emil1/jomzE2512'>Поддержать бота</a> 
`,
    {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }
  );
};
