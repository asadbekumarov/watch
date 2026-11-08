"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "@/i18n";

export interface FaqItem {
  qUz: string;
  qRu: string;
  aUz: string;
  aRu: string;
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    qUz: "Do'kon filiallariga borib soatlarni shaxsan ko'rsa bo'ladimi?",
    qRu: "Можно ли лично прийти в магазин и примерить часы?",
    aUz: "Ha. Do'konimizning Toshkent shahridagi filiali Langar ko'chasi 12-uyda (Hotel Marwa mo'ljalida) hamda Namangan shahridagi filiali A. Navoiy ko'chasi 42-uyda (Shodlik savdo markazi mo'ljalida) joylashgan.",
    aRu: "Да. Филиал в Ташкенте расположен по ул. Лангар, д. 12 (ориентир: отель Hotel Marwa), а филиал в Намангане — по ул. А. Навои, д. 42 (ориентир: ТЦ Шодлик).",
  },
  {
    qUz: "Ko'rsatilgan soatlar narxini qanday aniqlash mumkin?",
    qRu: "Как узнать актуальную стоимость часов?",
    aUz: "Narxlar USD valyutasida belgilanadi. Saytda narxi ko'rsatilmagan modellar uchun «Narxni so'rash» tugmasini bosib, to'g'ridan-to'g'ri Telegram menejerimiz (@swissWatch_admin) orqali dolzarb narx va mavjudlikni bilib olishingiz mumkin.",
    aRu: "Цены формируются в USD. Для моделей без указанной фиксированной цены нажмите кнопку «Уточнить цену», чтобы напрямую запросить актуальную стоимость у менеджера в Telegram (@swissWatch_admin).",
  },
  {
    qUz: "Katalogda qaysi brendlar taqdim etilgan?",
    qRu: "Какие бренды представлены в каталоге?",
    aUz: "Kolleksiyamizda West End Watch (avtomatik mexanizm) hamda Jacques Philippe (kvars mexanizmi, 50 m suvga chidamli) modellarining turli o'lchamdagi (31 mm, 32 mm, 37 mm, 39 mm, 41 mm) variantlari mavjud.",
    aRu: "В каталоге представлены модели West End Watch (с автоматическим механизмом) и Jacques Philippe (кварцевый механизм, водонепроницаемость 50 м) в различных диаметрах (31 мм, 32 мм, 37 мм, 39 мм, 41 мм).",
  },
  {
    qUz: "Yetkazib berish xizmati mavjudmi?",
    qRu: "Есть ли доставка?",
    aUz: "Yetkazib berish shartlari va muddatlari har bir buyurtma uchun menejer bilan individual tarzda kelishiladi. Shuningdek, filiallarning o'zidan olib ketish imkoniyati mavjud.",
    aRu: "Условия и сроки доставки согласовываются индивидуально с менеджером при оформлении заявки. Также доступен самовывоз из филиалов в Ташкенте и Намангане.",
  },
];

interface HomeFaqProps {
  items?: FaqItem[];
}

export default function HomeFaq({ items }: HomeFaqProps = {}) {
  const { lang } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const faqs = items && items.length > 0 ? items : DEFAULT_FAQS;

  return (
    <section id="faq" className="relative px-4 sm:px-8 md:px-12 lg:px-20 py-16 sm:py-24 border-t border-white/[0.06]">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#D4AF37]">
            FAQ
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#FFFFFF] tracking-tight">
            {lang === "ru" ? "Часто задаваемые вопросы" : "Ko'p beriladigan savollar"}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            const question = lang === "ru" ? faq.qRu : faq.qUz;
            const answer = lang === "ru" ? faq.aRu : faq.aUz;

            return (
              <div
                key={idx}
                className="bg-[#111111] border border-white/[0.07] hover:border-white/[0.15] rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-serif text-base text-[#FFFFFF] font-normal">
                    {question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-[#71717A] leading-relaxed border-t border-white/[0.04] pt-3">
                    {answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
