export function formatPrice(price: number, lang: "uz" | "ru" = "uz"): string {
  const formatted = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return lang === "ru" ? `${formatted} сум` : `${formatted} so'm`;
}

export function formatInstallment(
  price: number,
  months: number,
  lang: "uz" | "ru" = "uz"
): string {
  const monthly = Math.round(price / months);
  const formatted = monthly.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  if (lang === "ru") {
    return `от ${formatted} сум / мес. (${months} мес., прибл.)`;
  }
  return `oyiga ${formatted} so'mdan (${months} oy, taxminiy)`;
}

