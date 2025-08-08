import { createClient } from "redis";
import { queryCreator } from "./db.js";
// Создаём клиент
const redisClient = createClient({
  url: "redis://localhost:6379",
});

redisClient.on("error", (err: any) => console.error("Redis Client Error", err));

await redisClient.connect();

export async function cacheUserGroup(chatId: string, group: string) {
  await redisClient.set(`userGroup:${chatId}`, group, {
    EX: 3600, // время жизни ключа — 1 час
  });
}

// export async function getUserGroupFromCache(chatId: string) {
//   return await redisClient.get(`userGroup:${chatId}`);
// }
async function getUserGroupFromSql(chatId: string): Promise<string | null> {
  const rows = await queryCreator("SELECT `group` FROM users WHERE chatId = ?", [chatId]);
  if (Array.isArray(rows) && rows.length > 0) {
    // Вернуть значение поля группы из первой записи
    return rows[0].group || null;
  }
  return null;
}



export async function getUserGroupFromCache(chatId: string): Promise<string | null> {
  // Сначала пытаемся получить из Redis
  const cachedGroup = await redisClient.get(`userGroup:${chatId}`);
  if (cachedGroup) {
    return cachedGroup;
  }

  // Если в Redis нет — запрашиваем из SQL
  const sqlGroup = await getUserGroupFromSql(chatId); // ваша функция из SQL

  if (sqlGroup) {
    // Можно при желании сохранить в Redis для кеша на будущее
    await redisClient.set(`userGroup:${chatId}`, sqlGroup);
  }

  return sqlGroup;
}
