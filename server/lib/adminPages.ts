import { escapeHtml } from "./paymentResultPage";
import { FULFILLMENT_STATUSES, type FulfillmentStatus, type OrderRecord } from "./orderRepository";
import { money } from "./money";

// /admin panelinin sayfaları. Storefront'un aksine ekstra bir client-side script'e
// ihtiyaç duymuyor: filtre ve durum güncelleme formları düz HTML <form> ile,
// T.C. kimlik no gizleme ise <details> ile (JS'siz) çalışıyor.

const PAGE_STYLE = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #f4f1ea; color: #1c2422; font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; }
  header.admin-header { display: flex; align-items: center; justify-content: space-between; background: #193d36; color: #fff8eb; padding: 14px 24px; }
  header.admin-header a { color: inherit; text-decoration: none; font-weight: 700; letter-spacing: -.02em; }
  header.admin-header form { margin: 0; }
  header.admin-header button { background: transparent; border: 1px solid rgba(255,255,255,.5); color: inherit; padding: 6px 12px; border-radius: 100px; cursor: pointer; font: inherit; }
  main { max-width: 1180px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .muted { color: #6d817a; }
  .filters { display: flex; flex-wrap: wrap; gap: 10px; align-items: end; margin: 18px 0; padding: 14px; background: #fff; border: 1px solid #e2ddce; border-radius: 8px; }
  .filters label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; font-weight: 600; color: #46524d; }
  .filters select, .filters button { padding: 7px 10px; border-radius: 6px; border: 1px solid #cfc8b4; font: inherit; }
  .filters button { background: #193d36; color: #fff; border-color: #193d36; cursor: pointer; }
  table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e2ddce; border-radius: 8px; overflow: hidden; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #eee6d6; vertical-align: top; }
  th { background: #efe9d8; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #574f3c; }
  tr:last-child td { border-bottom: none; }
  .badge { display: inline-block; padding: 3px 9px; border-radius: 100px; font-size: 11px; font-weight: 700; }
  .badge-success { background: #dcefe0; color: #1e6b3a; }
  .badge-pending { background: #fdf0cf; color: #8a6417; }
  .badge-failure { background: #fbe1de; color: #9c2e1f; }
  .cart-line { font-size: 12px; }
  select.status-select { padding: 5px 8px; border-radius: 6px; border: 1px solid #cfc8b4; font: inherit; }
  details.tc-reveal summary { cursor: pointer; color: #193d36; font-size: 12px; }
  .pagination { display: flex; gap: 8px; margin-top: 16px; }
  .pagination a { padding: 6px 12px; border: 1px solid #cfc8b4; border-radius: 6px; text-decoration: none; color: #193d36; font-size: 12px; }
  .error { background: #fbe1de; color: #8a2416; padding: 10px 14px; border-radius: 6px; margin-bottom: 14px; font-size: 13px; }
  .login-card { max-width: 340px; margin: 12vh auto; background: #fff; border: 1px solid #e2ddce; border-radius: 10px; padding: 28px; }
  .login-card h1 { margin-bottom: 18px; }
  .login-card label { display: block; font-size: 12px; font-weight: 600; margin: 12px 0 4px; }
  .login-card input { width: 100%; padding: 9px 10px; border-radius: 6px; border: 1px solid #cfc8b4; font: inherit; }
  .login-card button { margin-top: 18px; width: 100%; padding: 10px; background: #193d36; color: #fff; border: 0; border-radius: 6px; font: inherit; font-weight: 700; cursor: pointer; }
`;

function layout(title: string, body: string, opts: { showHeader?: boolean } = {}): string {
  const header = opts.showHeader === false ? "" : `
    <header class="admin-header">
      <a href="/admin">fındıkhane · admin</a>
      <form method="post" action="/admin/logout"><button type="submit">Çıkış yap</button></form>
    </header>`;
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escapeHtml(title)} | Fındıkhane Admin</title><style>${PAGE_STYLE}</style></head><body>${header}<main>${body}</main></body></html>`;
}

export function renderAdminLoginPage(error?: string): string {
  const errorHtml = error ? `<div class="error">${escapeHtml(error)}</div>` : "";
  const body = `
    <div class="login-card">
      <h1>Fındıkhane Admin</h1>
      ${errorHtml}
      <form method="post" action="/admin/login">
        <label for="username">Kullanıcı adı</label>
        <input id="username" name="username" autocomplete="username" required autofocus />
        <label for="password">Şifre</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required />
        <button type="submit">Giriş yap</button>
      </form>
    </div>`;
  return layout("Giriş", body, { showHeader: false });
}

function paymentBadge(status: string): string {
  const map: Record<string, string> = { SUCCESS: "badge-success", PENDING: "badge-pending", FAILURE: "badge-failure" };
  const cls = map[status] || "badge-pending";
  return `<span class="badge ${cls}">${escapeHtml(status)}</span>`;
}

const FULFILLMENT_LABELS: Record<FulfillmentStatus, string> = {
  NEW: "Yeni",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoya verildi",
  DELIVERED: "Teslim edildi"
};

function statusForm(order: OrderRecord): string {
  const options = FULFILLMENT_STATUSES.map(
    (status) =>
      `<option value="${status}" ${status === order.fulfillmentStatus ? "selected" : ""}>${escapeHtml(FULFILLMENT_LABELS[status])}</option>`
  ).join("");
  return `
    <form method="post" action="/admin/orders/${encodeURIComponent(order.orderId)}/status">
      <select class="status-select" name="status" onchange="this.form.submit()">${options}</select>
    </form>`;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" });
}

function orderRow(order: OrderRecord): string {
  const buyer = order.buyer;
  const buyerCell = buyer
    ? `<div><strong>${escapeHtml(`${buyer.firstName} ${buyer.lastName}`.trim())}</strong></div>
       <div class="muted">${escapeHtml(buyer.city)}</div>
       <div class="muted">${escapeHtml(buyer.address)}</div>
       <div>${escapeHtml(buyer.gsmNumber)} · ${escapeHtml(buyer.email)}</div>
       <details class="tc-reveal"><summary>T.C. kimlik no göster</summary>${escapeHtml(buyer.identityNumber)}</details>`
    : `<span class="muted">Alıcı bilgisi yok (eski sipariş)</span>`;

  const cartHtml = order.cart
    .map((line) => `<div class="cart-line">${line.quantity}× ${escapeHtml(line.name)} — ${money(line.price * line.quantity)} TL</div>`)
    .join("");

  return `<tr>
    <td>${formatDate(order.createdAt)}<div class="muted">${escapeHtml(order.orderId)}</div></td>
    <td>${buyerCell}</td>
    <td>${cartHtml}</td>
    <td>${money(order.total)} TL</td>
    <td>${paymentBadge(order.paymentStatus)}</td>
    <td>${statusForm(order)}</td>
  </tr>`;
}

export type OrdersPageParams = {
  orders: OrderRecord[];
  total: number;
  page: number;
  pageSize: number;
  paymentStatus: string;
  fulfillmentStatus: string;
};

export function renderAdminOrdersPage(params: OrdersPageParams): string {
  const { orders, total, page, pageSize, paymentStatus, fulfillmentStatus } = params;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const paymentOptions = ["", "PENDING", "SUCCESS", "FAILURE"]
    .map((value) => `<option value="${value}" ${value === paymentStatus ? "selected" : ""}>${value || "Tümü"}</option>`)
    .join("");
  const fulfillmentOptions = ["", ...FULFILLMENT_STATUSES]
    .map(
      (value) =>
        `<option value="${value}" ${value === fulfillmentStatus ? "selected" : ""}>${value ? escapeHtml(FULFILLMENT_LABELS[value as FulfillmentStatus]) : "Tümü"}</option>`
    )
    .join("");

  const rows = orders.length
    ? orders.map(orderRow).join("")
    : `<tr><td colspan="6" class="muted">Bu filtreyle eşleşen sipariş yok.</td></tr>`;

  const pagination = `
    <div class="pagination">
      ${page > 1 ? `<a href="?page=${page - 1}&paymentStatus=${paymentStatus}&fulfillmentStatus=${fulfillmentStatus}">← Önceki</a>` : ""}
      <span class="muted">Sayfa ${page} / ${totalPages} (${total} sipariş)</span>
      ${page < totalPages ? `<a href="?page=${page + 1}&paymentStatus=${paymentStatus}&fulfillmentStatus=${fulfillmentStatus}">Sonraki →</a>` : ""}
    </div>`;

  const body = `
    <h1>Siparişler</h1>
    <p class="muted">Toplam ${total} sipariş.</p>
    <form class="filters" method="get" action="/admin">
      <label>Ödeme durumu<select name="paymentStatus">${paymentOptions}</select></label>
      <label>Kargo durumu<select name="fulfillmentStatus">${fulfillmentOptions}</select></label>
      <button type="submit">Filtrele</button>
    </form>
    <table>
      <thead><tr><th>Tarih / No</th><th>Alıcı</th><th>Ürünler</th><th>Tutar</th><th>Ödeme</th><th>Kargo durumu</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${pagination}`;

  return layout("Siparişler", body);
}
