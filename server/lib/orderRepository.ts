import { Pool } from "pg";
import type { Buyer, CartLine } from "./validation";

// data/orders.json içindeki tek dosyalı depolamanın yerini alan, PostgreSQL tabanlı
// sipariş deposu. Not: kredi kartı bilgisi burada asla saklanmaz; sadece sepet
// içeriği, alıcı/teslimat bilgisi ve iyzico ile konuşmak için gereken alanlar tutulur.
// Alıcı bilgisi /admin panelinin siparişleri gösterebilmesi için eklendi
// (öncesinde sadece iyzico'ya gönderilip hiç saklanmıyordu).

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS orders (
    order_id            text PRIMARY KEY,
    created_at          timestamptz NOT NULL,
    completed_at        timestamptz NULL,
    cart                jsonb NOT NULL,
    conversation_id     text NOT NULL,
    total               numeric(12,2) NOT NULL,
    payment_status      text NOT NULL,
    token               text NULL,
    payment_id          text NULL,
    fulfillment_status  text NOT NULL DEFAULT 'NEW',
    buyer_first_name    text NULL,
    buyer_last_name     text NULL,
    buyer_email         text NULL,
    buyer_gsm           text NULL,
    buyer_identity_number text NULL,
    buyer_address       text NULL,
    buyer_city          text NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_token ON orders (token) WHERE token IS NOT NULL;

  -- Daha önce oluşturulmuş tablolarda eksik olabilecek sütunları da ekler (idempotent).
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_status text NOT NULL DEFAULT 'NEW';
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_first_name text NULL;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_last_name text NULL;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_email text NULL;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_gsm text NULL;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_identity_number text NULL;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_address text NULL;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_city text NULL;

  CREATE TABLE IF NOT EXISTS admin_users (
    username      text PRIMARY KEY,
    password_hash text NOT NULL,
    created_at    timestamptz NOT NULL DEFAULT now()
  );
`;

export const FULFILLMENT_STATUSES = ["NEW", "PREPARING", "SHIPPED", "DELIVERED"] as const;
export type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number];

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
  fulfillmentStatus: FulfillmentStatus;
  buyer: Buyer | null;
};

export type NewOrder = {
  orderId: string;
  createdAt: Date;
  cart: CartLine[];
  conversationId: string;
  total: number;
  paymentStatus: string;
  token?: string | null;
  buyer: Buyer;
};

export type AdminUser = {
  username: string;
  passwordHash: string;
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
    `INSERT INTO orders (
       order_id, created_at, cart, conversation_id, total, payment_status, token,
       buyer_first_name, buyer_last_name, buyer_email, buyer_gsm, buyer_identity_number, buyer_address, buyer_city
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [
      order.orderId,
      order.createdAt,
      JSON.stringify(order.cart),
      order.conversationId,
      order.total,
      order.paymentStatus,
      order.token ?? null,
      order.buyer.firstName,
      order.buyer.lastName,
      order.buyer.email,
      order.buyer.gsmNumber,
      order.buyer.identityNumber,
      order.buyer.address,
      order.buyer.city
    ]
  );
}

export async function setOrderToken(orderId: string, token: string): Promise<void> {
  await ensureSchema();
  await getPool().query("UPDATE orders SET token = $1 WHERE order_id = $2", [token, orderId]);
}

export async function findOrderByToken(token: string): Promise<OrderRecord | null> {
  await ensureSchema();
  const { rows } = await getPool().query(`SELECT * FROM orders WHERE token = $1 LIMIT 1`, [token]);
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

// --- Admin paneli için ---

export type OrderListFilter = {
  paymentStatus?: string;
  fulfillmentStatus?: FulfillmentStatus;
  limit?: number;
  offset?: number;
};

export async function listOrders(filter: OrderListFilter = {}): Promise<{ orders: OrderRecord[]; total: number }> {
  await ensureSchema();
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filter.paymentStatus) {
    params.push(filter.paymentStatus);
    conditions.push(`payment_status = $${params.length}`);
  }
  if (filter.fulfillmentStatus) {
    params.push(filter.fulfillmentStatus);
    conditions.push(`fulfillment_status = $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await getPool().query(`SELECT COUNT(*)::int AS count FROM orders ${where}`, params);
  const total = countResult.rows[0]?.count ?? 0;

  const limit = Math.min(Math.max(filter.limit ?? 50, 1), 200);
  const offset = Math.max(filter.offset ?? 0, 0);
  params.push(limit);
  params.push(offset);

  const { rows } = await getPool().query(
    `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return { orders: rows.map(mapRow), total };
}

export async function updateFulfillmentStatus(orderId: string, status: FulfillmentStatus): Promise<boolean> {
  await ensureSchema();
  const { rowCount } = await getPool().query(
    "UPDATE orders SET fulfillment_status = $1 WHERE order_id = $2",
    [status, orderId]
  );
  return (rowCount ?? 0) > 0;
}

export async function findAdminUser(username: string): Promise<AdminUser | null> {
  await ensureSchema();
  const { rows } = await getPool().query(
    "SELECT username, password_hash FROM admin_users WHERE username = $1 LIMIT 1",
    [username]
  );
  if (rows.length === 0) return null;
  return { username: rows[0].username as string, passwordHash: rows[0].password_hash as string };
}

export async function upsertAdminUser(username: string, passwordHash: string): Promise<void> {
  await ensureSchema();
  await getPool().query(
    `INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [username, passwordHash]
  );
}

function mapRow(row: Record<string, unknown>): OrderRecord {
  const fulfillmentStatus = (row.fulfillment_status as string) || "NEW";
  const hasBuyer = Boolean(row.buyer_first_name || row.buyer_last_name || row.buyer_email);
  return {
    orderId: row.order_id as string,
    createdAt: row.created_at as Date,
    completedAt: (row.completed_at as Date | null) ?? null,
    cart: row.cart as CartLine[],
    conversationId: row.conversation_id as string,
    total: Number(row.total),
    paymentStatus: row.payment_status as string,
    token: (row.token as string | null) ?? null,
    paymentId: (row.payment_id as string | null) ?? null,
    fulfillmentStatus: (FULFILLMENT_STATUSES as readonly string[]).includes(fulfillmentStatus)
      ? (fulfillmentStatus as FulfillmentStatus)
      : "NEW",
    buyer: hasBuyer
      ? {
          firstName: (row.buyer_first_name as string) || "",
          lastName: (row.buyer_last_name as string) || "",
          email: (row.buyer_email as string) || "",
          gsmNumber: (row.buyer_gsm as string) || "",
          identityNumber: (row.buyer_identity_number as string) || "",
          address: (row.buyer_address as string) || "",
          city: (row.buyer_city as string) || ""
        }
      : null
  };
}
