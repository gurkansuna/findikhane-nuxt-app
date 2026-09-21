import type { IyzicoOptions } from "./iyzico";

// Orijinal server.js gibi doğrudan ortam değişkenlerinden okunuyor.
export function getIyzicoOptions(): IyzicoOptions {
  return {
    apiKey: process.env.IYZICO_API_KEY || "",
    secretKey: process.env.IYZICO_SECRET_KEY || "",
    baseUrl: (process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com").replace(/\/$/, ""),
    publicBaseUrl: (process.env.PUBLIC_BASE_URL || "").replace(/\/$/, "")
  };
}
