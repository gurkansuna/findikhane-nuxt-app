// Kullanıcıya doğrudan gösterilmesi güvenli, Türkçe hata mesajı taşıyan istisna.
// Orijinal server.js'deki her `throw new Error("...")` çağrısının karşılığı.
export class DomainError extends Error {}
