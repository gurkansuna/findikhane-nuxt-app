import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "node:crypto";
import type { H3Event } from "h3";

// /admin panelinin kimlik doğrulama yardımcıları. Ekstra bağımlılık eklememek için
// şifre hash'i node:crypto scrypt ile, oturum çerezi ise HMAC imzasıyla yapılıyor
// (klasik bir sunucu taraflı oturum deposu kurmaya gerek bırakmıyor).

const SESSION_COOKIE = "fh_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 saat

export function isAdminAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_SESSION_SECRET);
}

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET tanımlı değil.");
  return secret;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createSessionToken(username: string): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${username}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): { username: string } | null {
  if (!token || !process.env.ADMIN_SESSION_SECRET) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [username, expiresAtRaw, signature] = parts;
  const payload = `${username}.${expiresAtRaw}`;

  let expected: Buffer;
  let actual: Buffer;
  try {
    expected = Buffer.from(sign(payload), "hex");
    actual = Buffer.from(signature, "hex");
  } catch {
    return null;
  }
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;

  return { username };
}

export function setAdminSessionCookie(event: H3Event, username: string): void {
  setCookie(event, SESSION_COOKIE, createSessionToken(username), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000
  });
}

export function clearAdminSessionCookie(event: H3Event): void {
  deleteCookie(event, SESSION_COOKIE, { path: "/" });
}

export function getAdminSession(event: H3Event): { username: string } | null {
  const token = getCookie(event, SESSION_COOKIE);
  return verifySessionToken(token);
}

// --- Basit brute-force yavaşlatma (tek process'lik Nitro sunucusu için yeterli;
// birden fazla replikaya ölçeklenirse Redis gibi paylaşımlı bir depoya taşınmalı). ---

const attemptsByKey = new Map<string, { count: number; windowStartedAt: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 10;

export function isLoginRateLimited(key: string): boolean {
  const entry = attemptsByKey.get(key);
  if (!entry) return false;
  if (Date.now() - entry.windowStartedAt > RATE_LIMIT_WINDOW_MS) {
    attemptsByKey.delete(key);
    return false;
  }
  return entry.count >= RATE_LIMIT_MAX_ATTEMPTS;
}

export function recordLoginAttempt(key: string): void {
  const entry = attemptsByKey.get(key);
  if (!entry || Date.now() - entry.windowStartedAt > RATE_LIMIT_WINDOW_MS) {
    attemptsByKey.set(key, { count: 1, windowStartedAt: Date.now() });
    return;
  }
  entry.count += 1;
}

export function clearLoginAttempts(key: string): void {
  attemptsByKey.delete(key);
}
