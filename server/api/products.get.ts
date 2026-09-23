import { CATALOG } from "../lib/catalog";

// Vitrindeki (public/script.js) ve gelecekte kurulacak otomatik fiyat
// güncelleme işinin okuyacağı tek kaynak: server/lib/catalog.ts.
// Fiyat burada da sunucu tarafından hesaplanıp döner; istemci hiçbir zaman
// kendi fiyatını dayatamaz (checkout.post.ts zaten CATALOG'u ayrıca kullanıyor).
export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    "Cache-Control": "public, max-age=60"
  });
  return Object.values(CATALOG);
});
