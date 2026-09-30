import { getAdminSession } from "../../lib/adminAuth";
import { listOrders, FULFILLMENT_STATUSES, type FulfillmentStatus } from "../../lib/orderRepository";
import { renderAdminOrdersPage } from "../../lib/adminPages";

const PAGE_SIZE = 50;
const VALID_PAYMENT_STATUSES = ["PENDING", "SUCCESS", "FAILURE"];

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { "Cache-Control": "no-store" });

  if (!getAdminSession(event)) {
    return sendRedirect(event, "/admin/login");
  }

  const query = getQuery(event);
  const page = Math.max(1, Number(query.page) || 1);
  const paymentStatusRaw = String(query.paymentStatus || "");
  const fulfillmentStatusRaw = String(query.fulfillmentStatus || "");
  const paymentStatus = VALID_PAYMENT_STATUSES.includes(paymentStatusRaw) ? paymentStatusRaw : "";
  const fulfillmentStatus = (FULFILLMENT_STATUSES as readonly string[]).includes(fulfillmentStatusRaw)
    ? (fulfillmentStatusRaw as FulfillmentStatus)
    : undefined;

  const { orders, total } = await listOrders({
    paymentStatus: paymentStatus || undefined,
    fulfillmentStatus,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE
  });

  return renderAdminOrdersPage({
    orders,
    total,
    page,
    pageSize: PAGE_SIZE,
    paymentStatus,
    fulfillmentStatus: fulfillmentStatus || ""
  });
});
