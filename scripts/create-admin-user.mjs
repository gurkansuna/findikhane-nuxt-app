#!/usr/bin/env node
// Admin paneline giriş yapacak bir kullanıcı oluşturur/şifresini günceller.
// Kullanım:
//   POSTGRES_CONNECTION_STRING=... node scripts/create-admin-user.mjs <kullanici-adi> <sifre>
// (POSTGRES_CONNECTION_STRING verilmezse docker-compose'daki varsayılan
// findikhane/findikhane/localhost:5432 bağlantısı denenir.)

import { Pool } from "pg";
import { randomBytes, scryptSync } from "node:crypto";

const [, , username, password] = process.argv;

if (!username || !password) {
  console.error("Kullanım: node scripts/create-admin-user.mjs <kullanici-adi> <sifre>");
  process.exit(1);
}

if (password.length < 8) {
  console.error("Şifre en az 8 karakter olmalı.");
  process.exit(1);
}

function hashPassword(rawPassword) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(rawPassword, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const pool = new Pool({
  connectionString:
    process.env.POSTGRES_CONNECTION_STRING || "postgresql://findikhane:findikhane@localhost:5432/findikhane"
});

try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      username      text PRIMARY KEY,
      password_hash text NOT NULL,
      created_at    timestamptz NOT NULL DEFAULT now()
    );
  `);

  const passwordHash = hashPassword(password);
  await pool.query(
    `INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [username, passwordHash]
  );

  console.log(`"${username}" kullanıcısı oluşturuldu/güncellendi.`);
} finally {
  await pool.end();
}
