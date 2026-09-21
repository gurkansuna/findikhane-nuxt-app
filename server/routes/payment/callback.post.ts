import { iyzicoRequest, isApiCredentialsPresent, verifyIyzicoSignature } from "../../lib/iyzico";
import { getIyzicoOptions } from "../../lib/config";
import { completeOrderPayment, findOrderByToken } from "../../lib/orderRepository";
import { renderPaymentResultPage } from "../../lib/paymentResultPage";

// server.js#handlePaymentCallback ile birebir aynı akış.
// server/routes/ (server/api/ değil) altında olduğu için /payment/callback yoluna
// (öndeki /api olmadan) bağlanır — orijinal server.js ile aynı URL.

function parseFormEncoded(body: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!body) return result;
  for (const pair of body.split("&")) {
    if (!pair) continue;
    const [rawKey, rawValue = ""] = pair.split("=");
    const key = decodeURIComponent(rawKey.replace(/\+/g, " "));
    const value = decodeURIComponent(rawValue.replace(/\+/g, " "));
    result[key] = value;
  }
  return result;
}

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  });

  const options = getIyzicoOptions();
  const body = (await readRawBody(event, "utf8")) ?? "";
  const contentType = getHeader(event, "content-type") || "";

  let values: Record<string, unknown>;
  if (contentType.includes("application/json")) {
    values = body ? JSON.parse(body) : {};
  } else {
    values = parseFormEncoded(body);
  }

  const token = (values.token as string) || "";
  if (!token || !isApiCredentialsPresent(options)) {
    setResponseStatus(event, 400);
    return renderPaymentResultPage(false, "Ödeme sonucu doğrulanamadı.");
  }

  try {
    const order = await findOrderByToken(token);
    if (!order) {
      setResponseStatus(event, 400);
      return renderPaymentResultPage(false, "Sipariş bulunamadı.");
    }

    const result = await iyzicoRequest(options, "/payment/iyzipos/checkoutform/auth/ecom/detail", {
      locale: "tr",
      conversationId: order.conversationId,
      token
    });

    const fields = ["paymentStatus", "paymentId", "currency", "basketId", "conversationId", "paidPrice", "price", "token"];
    const completed =
      verifyIyzicoSignature(options.secretKey, result, fields) &&
      result.paymentStatus === "SUCCESS" &&
      result.basketId === order.orderId;
    const paymentId = completed ? ((result.paymentId as string) ?? null) : null;

    await completeOrderPayment(order.orderId, completed, paymentId);

    setResponseStatus(event, completed ? 200 : 400);
    return renderPaymentResultPage(
      completed,
      completed ? `Siparişiniz alındı. Sipariş numaranız: ${order.orderId}` : "Ödemeniz tamamlanamadı. Lütfen tekrar deneyin."
    );
  } catch {
    setResponseStatus(event, 400);
    return renderPaymentResultPage(false, "Ödeme sonucu sorgulanırken bir sorun oluştu.");
  }
});
