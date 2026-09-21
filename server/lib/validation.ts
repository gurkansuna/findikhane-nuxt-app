import { DomainError } from "./domainError";
import { getProduct } from "./catalog";

// server.js içindeki cleanText / normaliseBuyer / normaliseCart fonksiyonlarının
// aynısı. Hata mesajları kasıtlı olarak Türkçe ve orijinaliyle aynı bırakıldı;
// bu mesajlar doğrudan kullanıcıya (checkout formunun altında) gösteriliyor.

const IDENTITY_NUMBER_PATTERN = /^\d{11}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GSM_PATTERN = /^\+?90?5\d{9}$/;

export type Buyer = {
  firstName: string;
  lastName: string;
  identityNumber: string;
  email: string;
  gsmNumber: string;
  address: string;
  city: string;
};

export type CartLine = {
  id: string;
  quantity: number;
  name: string;
  price: number;
  category: string;
  lineTotal: number;
};

export function cleanText(value: unknown, field: string, maxLength = 120): string {
  if (value === null || value === undefined) throw new DomainError(`${field} zorunludur.`);
  const cleaned = String(value).trim().replace(/\s+/g, " ");
  if (cleaned.length === 0 || cleaned.length > maxLength) throw new DomainError(`${field} geçerli değil.`);
  return cleaned;
}

export function normaliseBuyer(raw: Record<string, unknown> | null | undefined): Buyer {
  raw = raw || {};

  const firstName = cleanText(raw.firstName, "Ad");
  const lastName = cleanText(raw.lastName, "Soyad");
  const identityNumber = cleanText(raw.identityNumber, "T.C. kimlik no", 11);
  const email = cleanText(raw.email, "E-posta", 254).toLowerCase();
  const gsmNumber = cleanText(raw.gsmNumber, "Telefon", 16).replace(/[\s()-]/g, "");
  const address = cleanText(raw.address, "Teslimat adresi", 255);
  const city = cleanText(raw.city, "Şehir", 64);

  if (!IDENTITY_NUMBER_PATTERN.test(identityNumber)) {
    throw new DomainError("T.C. kimlik no 11 rakam olmalıdır.");
  }
  if (!EMAIL_PATTERN.test(email)) {
    throw new DomainError("E-posta geçerli değil.");
  }

  const gsmForCheck = gsmNumber.startsWith("00") ? "+" + gsmNumber.slice(2) : gsmNumber;
  if (!GSM_PATTERN.test(gsmForCheck)) {
    throw new DomainError("Telefon +905XXXXXXXXX biçiminde olmalıdır.");
  }

  const normalisedGsm = gsmNumber.startsWith("+") ? gsmNumber : "+" + gsmNumber;

  return { firstName, lastName, identityNumber, email, gsmNumber: normalisedGsm, address, city };
}

export function normaliseCart(rawItems: unknown): CartLine[] {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new DomainError("Sepetiniz boş.");
  }

  const quantities = new Map<string, number>();

  for (const item of rawItems as Array<Record<string, unknown>>) {
    const id = typeof item?.id === "string" ? item.id : "";
    const quantity = Number(item?.quantity);

    if (!getProduct(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new DomainError("Sepet bilgisi geçerli değil.");
    }

    quantities.set(id, Math.min((quantities.get(id) || 0) + quantity, 20));
  }

  return [...quantities.entries()].map(([id, quantity]) => {
    const product = getProduct(id)!;
    return {
      id,
      quantity,
      name: product.name,
      price: product.price,
      category: product.category,
      lineTotal: product.price * quantity
    };
  });
}
