import mysql from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: mysql.Pool | undefined;
}

const sslEnabled =
  process.env.DB_SSL === "true" || process.env.DB_SSL === "1" || process.env.DB_SSL === "yes";

export const pool: mysql.Pool =
  global.__mysqlPool ??
  mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    // Aiven typically needs SSL. For dev, rejectUnauthorized:false is common.
    // For production-hardening, use the Aiven CA cert instead.
    ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  global.__mysqlPool = pool;
}