import { createClient } from "redis";
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

export async function getUserGroupFromCache(chatId: string) {
  return await redisClient.get(`userGroup:${chatId}`);
}


