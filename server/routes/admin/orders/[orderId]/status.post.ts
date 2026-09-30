import { getAdminSession } from "../../../../lib/adminAuth";
import { FULFILLMENT_STATUSES, updateFulfillmentStatus, type FulfillmentStatus } from "../../../../lib/orderRepository";

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
  if (!getAdminSession(event)) {
    setResponseStatus(event, 401);
    return "Yetkisiz.";
  }

  const orderId = getRouterParam(event, "orderId") || "";
  const rawBody = (await readRawBody(event, "utf8")) ?? "";
  const fields = parseFormEncoded(rawBody);
  const status = fields.status as FulfillmentStatus;

  if (!orderId || !(FULFILLMENT_STATUSES as readonly string[]).includes(status)) {
    setResponseStatus(event, 400);
    return "Geçersiz durum.";
  }

  await updateFulfillmentStatus(orderId, status);
  return sendRedirect(event, "/admin");
});
