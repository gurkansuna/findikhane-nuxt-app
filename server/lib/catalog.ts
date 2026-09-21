// Ürün kataloğu: fiyat sunucuda sabittir; istemciden gelen fiyat asla güvenilmez.
// .NET portundaki Catalog/ProductCatalog.cs ile birebir aynı veriler.

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
};

export const CATALOG: Record<string, Product> = {
  "giresun-secme": { id: "giresun-secme", name: "Ordu ve Giresun Seçme", price: 529, category: "Çiğ iç fındık" },
  "tas-firin-kavrulmus": { id: "tas-firin-kavrulmus", name: "Taş Fırın Kavrulmuş", price: 579, category: "Kavrulmuş iç fındık" },
  "ipek-kivam": { id: "ipek-kivam", name: "İpek Kıvam", price: 459, category: "Katkısız fındık ezmesi" }
};

export function getProduct(id: string): Product | undefined {
  return Object.prototype.hasOwnProperty.call(CATALOG, id) ? CATALOG[id] : undefined;
}
