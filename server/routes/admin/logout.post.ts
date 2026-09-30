import { clearAdminSessionCookie } from "../../lib/adminAuth";

export default defineEventHandler((event) => {
  clearAdminSessionCookie(event);
  return sendRedirect(event, "/admin/login");
});
