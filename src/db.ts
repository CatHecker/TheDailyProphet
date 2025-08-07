import mysql from 'mysql2/promise';

let connection: any;

export async function initDbConnection() {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASS,
    });
    console.log('Подключение к серверу MySQL успешно установлено');
  }
  return connection;
} 

export async function queryCreator(sql: string, values: Array<string>) {
  const conn = await initDbConnection();
  try {
    const [rows] = await conn.execute(sql, values);
    return rows;
  } catch (err) {
    console.error('Ошибка SQL:', err);
    throw err;
  }
}

