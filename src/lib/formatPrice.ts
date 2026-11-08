export function formatPrice(
  price: number | null | undefined,
  lang: "uz" | "ru" = "uz"
): string {
  if (price === null || price === undefined || price <= 0) {
    return lang === "ru" ? "Уточнить цену" : "Narxni so'rash";
  }
  const formatted = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `$${formatted} USD`;
}

export function getTelegramInquiryUrl(
  productName: string,
  managerUsername: string = "swissWatch_admin",
  lang: "uz" | "ru" = "uz"
): string {
  const cleanManager = managerUsername.replace("@", "");
  const text =
    lang === "ru"
      ? `Здравствуйте! Хочу узнать цену и наличие часов "${productName}" в SwissWatch Premium.`
      : `Assalomu alaykum! SwissWatch Premium do'konidagi "${productName}" soatining narxi va mavjudligini bilmoqchi edim.`;
  return `https://t.me/${cleanManager}?text=${encodeURIComponent(text)}`;
}
