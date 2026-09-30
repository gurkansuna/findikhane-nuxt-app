import {
  isAdminAuthConfigured,
  isLoginRateLimited,
  recordLoginAttempt,
  clearLoginAttempts,
  setAdminSessionCookie,
  verifyPassword
} from "../../lib/adminAuth";
import { findAdminUser } from "../../lib/orderRepository";

function parseFormEncoded(body: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!body) return result;
  for (const pair of body.split("&")) {
    if (!pair) continue;
    const [rawKey, rawValue = ""] = pair.split("=");
    result[decodeURIComponent(rawKey.replace(/\+/g, " "))] = decodeURIComponent(rawValue.replace(/\+/g, " "));
  }
  return result;
}

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { "Cache-Control": "no-store" });

  if (!isAdminAuthConfigured()) {
    setResponseStatus(event, 503);
    return "Admin paneli henüz yapılandırılmadı (ADMIN_SESSION_SECRET eksik).";
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  if (isLoginRateLimited(ip)) {
    return sendRedirect(event, "/admin/login?error=2");
  }

  const rawBody = (await readRawBody(event, "utf8")) ?? "";
  const contentType = getHeader(event, "content-type") || "";
  const fields = contentType.includes("application/json") ? JSON.parse(rawBody || "{}") : parseFormEncoded(rawBody);

  const username = String(fields.username || "").trim();
  const password = String(fields.password || "");

  const user = username ? await findAdminUser(username) : null;
  const valid = user ? verifyPassword(password, user.passwordHash) : false;

  if (!valid) {
    recordLoginAttempt(ip);
    return sendRedirect(event, "/admin/login?error=1");
  }

  clearLoginAttempts(ip);
  setAdminSessionCookie(event, username);
  return sendRedirect(event, "/admin");
});
