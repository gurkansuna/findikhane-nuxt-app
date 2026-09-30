import { renderAdminLoginPage } from "../../lib/adminPages";
import { getAdminSession } from "../../lib/adminAuth";

export default defineEventHandler((event) => {
  setResponseHeaders(event, { "Cache-Control": "no-store" });
  if (getAdminSession(event)) {
    return sendRedirect(event, "/admin");
  }
  const query = getQuery(event);
  const error = query.error === "1" ? "Kullanıcı adı veya şifre hatalı." : query.error === "2" ? "Çok fazla deneme yapıldı, birkaç dakika sonra tekrar deneyin." : undefined;
  return renderAdminLoginPage(error);
});
