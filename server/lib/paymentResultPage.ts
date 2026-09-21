function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&#39;")
    .replace(/"/g, "&quot;");
}

export function renderPaymentResultPage(success: boolean, message: string): string {
  const title = success ? "Ödemeniz başarıyla alındı" : "Ödeme tamamlanamadı";
  const color = success ? "#47724e" : "#b44e2d";
  return `<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)} | Fındıkhane</title><body style="margin:0;background:#f9f4e9;color:#193d36;font-family:Arial,sans-serif"><main style="max-width:560px;margin:15vh auto;padding:48px;text-align:center"><div style="font-size:48px;color:${color}">${success ? "✓" : "×"}</div><h1 style="font-family:Georgia,serif;font-size:38px;letter-spacing:-2px">${escapeHtml(title)}</h1><p style="line-height:1.6">${escapeHtml(message)}</p><a href="/" style="display:inline-block;background:#193d36;color:white;padding:14px 20px;text-decoration:none;font-weight:bold">Mağazaya dön →</a></main></body></html>`;
}
