# Fındıkhane — Nuxt sürümü

Bu klasör, `src/Findikhane.Api` altındaki .NET sürümüyle aynı işlevleri gören bir Nuxt (TypeScript, Nitro) implementasyonudur. `node-app/` ve `nextjs-app/` klasörleriyle birlikte, aynı ürünün üç ayrı JavaScript/TypeScript çatısındaki yazımını oluşturur.

## Kapsam

- Ürün kataloğu, sepet doğrulaması (T.C. kimlik no, e-posta, GSM), sipariş oluşturma ve iyzico Checkout Form entegrasyonu .NET sürümüyle birebir aynı davranışı taşıyacak şekilde port edildi (`server/lib/`).
- `POST /api/checkout` (`server/api/checkout.post.ts`) ve `POST /payment/callback` (`server/routes/payment/callback.post.ts`) uçları Nitro event handler olarak tanımlı. İkinci uç kasıtlı olarak `server/routes/` altında (`server/api/` değil) tutuldu ki `/api` öneki almadan orijinal `server.js` ile aynı URL'de çalışsın.
- Siparişler PostgreSQL'de saklanır (`server/lib/orderRepository.ts`).
- Vitrin sayfası (`app/app.vue`) orijinal `wwwroot/index.html` ile aynı içerik ve tasarımı taşır; sepet/checkout etkileşimi de Vue state'ine taşınmadan, orijinal `public/script.js` dosyası aynen kullanılarak çalışır (`nuxt.config.ts` içinde `app.head.script` ile sayfaya ekleniyor).

## Yerel çalıştırma

```bash
cp .env.example .env   # değerleri doldurun
npm install
npm run dev
```

PostgreSQL'e ihtiyaç var; yoksa hızlıca `docker compose up postgres` ile ayağa kaldırabilirsiniz.

## Docker ile çalıştırma

```bash
docker compose up --build
```

`docker-compose.yml`, uygulamayı (Nitro `node-server` preset) ve bir PostgreSQL 16 konteynerini birlikte ayağa kaldırır.

## Ortam değişkenleri

`.env.example` dosyasına bakın: `PORT`, `HOST`, `POSTGRES_CONNECTION_STRING`, `IYZICO_API_KEY`, `IYZICO_SECRET_KEY`, `IYZICO_BASE_URL`, `PUBLIC_BASE_URL`.
