// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  // Docker imajında `node .output/server/index.mjs` ile çalıştırmak için.
  nitro: {
    preset: "node-server"
  },

  app: {
    head: {
      title: "Fındıkhane | Dalından Sofrana",
      htmlAttrs: { lang: "tr" },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1.0" },
        { name: "description", content: "Karadeniz'in seçkin fındıkları Fındıkhane'de." }
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap"
        },
        { rel: "stylesheet", href: "/styles.css" }
      ],
      // Sepet/checkout etkileşimi orijinal script.js ile birebir aynı; React/Vue state'e
      // taşımak yerine (DOM'u doğrudan yöneten) orijinal dosya aynen kullanılıyor.
      // body:true -> </body> kapanmadan hemen önce eklenir, orijinal statik site ile aynı sıra.
      script: [{ src: "/script.js", body: true }]
    }
  }
});
