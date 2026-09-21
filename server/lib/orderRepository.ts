import { Pool } from "pg";
import type { CartLine } from "./validation";

// data/orders.json içindeki tek dosyalı depolamanın yerini alan, PostgreSQL tabanlı
// sipariş deposu. Not: orijinal koddaki gibi kredi kartı veya kimlik bilgisi burada
// saklanmaz; sadece sepet içeriği, tutar ve iyzico ile konuşmak için gereken alanlar tutulur.

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS orders (
    order_id        text PRIMARY KEY,
    created_at      timestamptz NOT NULL,
    completed_at    timestamptz NULL,
    cart            jsonb NOT NULL,
    conversation_id text NOT NULL,
    total           numeric(12,2) NOT NULL,
    payment_status  text NOT NULL,
    token           text NULL,
    payment_id      text NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_token ON orders (token) WHERE token IS NOT NULL;
`;

export type OrderRecord = {
  orderId: string;
  createdAt: Date;
  completedAt: Date | null;
  cart: CartLine[];
  conversationId: string;
  total: number;
  paymentStatus: string;
  token: string | null;
  paymentId: string | null;
};

export type NewOrder = {
  orderId: string;
  createdAt: Date;
  cart: CartLine[];
  conversationId: string;
  total: number;
  paymentStatus: string;
  token?: string | null;
};

// Nitro dev sunucusu her istekte modülü yeniden çalıştırabildiği için bağlantı havuzu
// globalThis üzerinde tekilleştiriliyor (aksi halde her reload'da yeni bir Pool açılır).
const globalForPg = globalThis as unknown as { findikhanePool?: Pool };

function getPool(): Pool {
  if (!globalForPg.findikhanePool) {
    globalForPg.findikhanePool = new Pool({
      connectionString:
        process.env.POSTGRES_CONNECTION_STRING ||
        "postgresql://findikhane:findikhane@localhost:5432/findikhane"
    });
  }
  return globalForPg.findikhanePool;
}

let schemaEnsured = false;

export async function ensureSchema(): Promise<void> {
  if (schemaEnsured) return;
  await getPool().query(CREATE_TABLE_SQL);
  schemaEnsured = true;
}

export async function insertOrder(order: NewOrder): Promise<void> {
  await ensureSchema();
  await getPool().query(
    `INSERT INTO orders (order_id, created_at, cart, conversation_id, total, payment_status, token)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [order.orderId, order.createdAt, JSON.stringify(order.cart), order.conversationId, order.total, order.paymentStatus, order.token ?? null]
  );
}

export async function setOrderToken(orderId: string, token: string): Promise<void> {
  await ensureSchema();
  await getPool().query("UPDATE orders SET token = $1 WHERE order_id = $2", [token, orderId]);
}

export async function findOrderByToken(token: string): Promise<OrderRecord | null> {
  await ensureSchema();
  const { rows } = await getPool().query(
    `SELECT order_id, created_at, completed_at, cart, conversation_id, total, payment_status, token, payment_id
     FROM orders WHERE token = $1 LIMIT 1`,
    [token]
  );
  if (rows.length === 0) return null;
  return mapRow(rows[0]);
}

export async function completeOrderPayment(orderId: string, completed: boolean, paymentId: string | null): Promise<void> {
  await ensureSchema();
  await getPool().query(
    `UPDATE orders
     SET payment_status = $1, payment_id = $2, completed_at = $3
     WHERE order_id = $4`,
    [completed ? "SUCCESS" : "FAILURE", paymentId ?? null, new Date(), orderId]
  );
}

function mapRow(row: Record<string, unknown>): OrderRecord {
  return {
    orderId: row.order_id as string,
    createdAt: row.created_at as Date,
    completedAt: (row.completed_at as Date | null) ?? null,
    cart: row.cart as CartLine[],
    conversationId: row.conversation_id as string,
    total: Number(row.total),
    paymentStatus: row.payment_status as string,
    token: (row.token as string | null) ?? null,
    paymentId: (row.payment_id as string | null) ?? null
  };
}
