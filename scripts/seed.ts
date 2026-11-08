import { createClient } from "@supabase/supabase-js";
import { productsData } from "../src/data/products";
import { storeData } from "../src/data/store";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.INITIAL_ADMIN_EMAIL || "watch@gmail.com";
const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || "admin123";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  console.log("--- Starting SwissWatch_premium Database Seeding ---");

  // 1. Site Settings
  console.log("Seeding site settings (usd_to_uzs_rate = NULL)...");
  const { error: settingsError } = await supabase.from("site_settings").upsert(
    {
      id: "default",
      store_name: storeData.name,
      display_name: storeData.displayName,
      tagline_uz: storeData.taglineUz,
      tagline_ru: storeData.taglineRu,
      about_uz: storeData.aboutUz,
      about_ru: storeData.aboutRu,
      phone: storeData.phone,
      phone_clean: storeData.phoneClean,
      telegram_channel: storeData.telegramChannel,
      telegram_manager: storeData.telegramManager,
      telegram_manager_url: storeData.telegramManagerUrl,
      instagram_handle: storeData.instagramHandle,
      working_hours_uz: storeData.workingHoursUz,
      working_hours_ru: storeData.workingHoursRu,
      usd_to_uzs_rate: null, // Left NULL per rules: online payments and UZS totals disabled until set
      default_prep_days: 1,
      delivery_info_uz: storeData.deliveryInfoUz,
      delivery_info_ru: storeData.deliveryInfoRu,
    },
    { onConflict: "id" }
  );
  if (settingsError) console.error("Error seeding settings:", settingsError);

  // 2. Branches
  console.log("Seeding branches (Toshkent, Namangan)...");
  for (let i = 0; i < storeData.branches.length; i++) {
    const b = storeData.branches[i];
    const { error: branchError } = await supabase.from("branches").upsert(
      {
        id: b.id,
        city_uz: b.city,
        city_ru: b.cityRu,
        address_uz: b.address,
        address_ru: b.addressRu,
        landmark_uz: b.landmark,
        landmark_ru: b.landmarkRu,
        note_uz: b.note || null,
        note_ru: b.note || null,
        pickup_enabled: true,
        sort_order: i,
        is_active: true,
      },
      { onConflict: "id" }
    );
    if (branchError) console.error(`Error seeding branch ${b.id}:`, branchError);
  }

  // 3. Products
  console.log(`Seeding ${productsData.length} watches...`);
  for (let i = 0; i < productsData.length; i++) {
    const p = productsData[i];
    const { error: prodError } = await supabase.from("products").upsert(
      {
        id: p.id,
        slug: p.slug,
        brand: p.brand,
        model: p.model,
        name_uz: p.name,
        name_ru: p.nameRu,
        price_usd: p.price,
        currency: p.currency,
        images: p.images,
        description_uz: p.descriptionUz,
        description_ru: p.descriptionRu,
        movement_type: p.specs.movementType,
        movement_text: p.specs.movement,
        case_diameter: p.specs.caseDiameter,
        case_diameter_val: p.specs.caseDiameterValue,
        dial_color: p.specs.dialColor || null,
        water_resistance: p.specs.waterResistance || null,
        glass: p.specs.glass || null,
        features: p.specs.features || [],
        notes: p.specs.notes || [],
        tags: p.tags,
        in_stock: p.inStock,
        is_bestseller: p.isBestseller || false,
        is_active: true,
        stock_quantity: p.inStock ? 3 : 0,
        prep_days: 1,
        sort_order: i,
      },
      { onConflict: "id" }
    );
    if (prodError) console.error(`Error seeding product ${p.id}:`, prodError);
  }

  // 4. FAQs
  console.log("Seeding FAQs...");
  const faqs = [
    {
      question_uz: "Do'kon filiallariga borib soatlarni shaxsan ko'rsa bo'ladimi?",
      question_ru: "Можно ли лично прийти в магазин и примерить часы?",
      answer_uz:
        "Ha. Do'konimizning Toshkent shahridagi filiali Langar ko'chasi 12-uyda (Hotel Marwa mo'ljalida) hamda Namangan shahridagi filiali A. Navoiy ko'chasi 42-uyda (Shodlik savdo markazi mo'ljalida) joylashgan.",
      answer_ru:
        "Да. Филиал в Ташкенте расположен по ул. Лангар, д. 12 (ориентир: отель Hotel Marwa), а филиал в Намангане — по ул. А. Навои, д. 42 (ориентир: ТЦ Шодлик).",
      sort_order: 0,
      is_active: true,
    },
    {
      question_uz: "Ko'rsatilgan soatlar narxini qanday aniqlash mumkin?",
      question_ru: "Как узнать актуальную стоимость часов?",
      answer_uz:
        "Narxlar USD valyutasida belgilanadi. Saytda narxi ko'rsatilmagan modellar uchun «Narxni so'rash» tugmasini bosib, to'g'ridan-to'g'ri Telegram menejerimiz (@swissWatch_admin) orqali dolzarb narx va mavjudlikni bilib olishingiz mumkin.",
      answer_ru:
        "Цены формируются в USD. Для моделей без указанной фиксированной цены нажмите кнопку «Уточнить цену», чтобы напрямую запросить актуальную стоимость у менеджера в Telegram (@swissWatch_admin).",
      sort_order: 1,
      is_active: true,
    },
    {
      question_uz: "Katalogda qaysi brendlar taqdim etilgan?",
      question_ru: "Какие бренды представлены в каталоге?",
      answer_uz:
        "Kolleksiyamizda West End Watch (avtomatik mexanizm) hamda Jacques Philippe (kvars mexanizmi, 50 m suvga chidamli) modellarining turli o'lchamdagi (31 mm, 32 mm, 37 mm, 39 mm, 41 mm) variantlari mavjud.",
      answer_ru:
        "В каталоге представлены модели West End Watch (с автоматическим механизмом) и Jacques Philippe (кварцевый механизм, водонепроницаемость 50 м) в различных диаметрах (31 мм, 32 мм, 37 мм, 39 мм, 41 мм).",
      sort_order: 2,
      is_active: true,
    },
    {
      question_uz: "Yetkazib berish xizmati mavjudmi?",
      question_ru: "Есть ли доставка?",
      answer_uz:
        "Yetkazib berish shartlari va muddatlari har bir buyurtma uchun menejer bilan individual tarzda kelishiladi. Shuningdek, filiallarning o'zidan olib ketish imkoniyati mavjud.",
      answer_ru:
        "Условия и сроки доставки согласовываются индивидуально с менеджером при оформлении заявки. Также доступен самовывоз из филиалов в Ташкенте и Намангане.",
      sort_order: 3,
      is_active: true,
    },
  ];

  for (const faq of faqs) {
    const { error: faqError } = await supabase.from("faqs").insert(faq);
    if (faqError) console.error("Error seeding FAQ:", faqError);
  }

  // 5. Hero Banner
  console.log("Seeding Hero text...");
  const { error: heroError } = await supabase.from("hero_banners").insert({
    title_line1_uz: "Klassik Dizayn.",
    title_line2_uz: "Benuqson Mahorat",
    title_line1_ru: "Классический дизайн.",
    title_line2_ru: "Безупречное мастерство",
    subtitle_uz:
      "Toshkent va Namangandagi ko'rgazma zallarimizda West End Watch hamda Jacques Philippe kolleksiyasi bilan tanishing.",
    subtitle_ru:
      "Ознакомьтесь с коллекциями часов West End Watch и Jacques Philippe в наших выставочных залах в Ташкенте и Намангане.",
    is_active: true,
    sort_order: 0,
  });
  if (heroError) console.error("Error seeding Hero banner:", heroError);

  // 6. Delivery Methods (disabled by default)
  console.log("Seeding default delivery methods...");
  const deliveryMethods: Array<{
    id: string;
    name_uz: string;
    name_ru: string;
    delivery_type: "pickup" | "delivery";
    branch_id: string | null;
    price_usd: number;
    free_above_usd: number | null;
    is_enabled: boolean;
    sort_order: number;
  }> = [
    {
      id: "pickup_tashkent",
      name_uz: "Toshkent filialidan olib ketish (Langar ko'chasi 12)",
      name_ru: "Самовывоз из филиала в Ташкенте (ул. Лангар, 12)",
      delivery_type: "pickup",
      branch_id: "tashkent",
      price_usd: 0,
      free_above_usd: null,
      is_enabled: true,
      sort_order: 0,
    },
    {
      id: "pickup_namangan",
      name_uz: "Namangan filialidan olib ketish (A. Navoiy ko'chasi 42)",
      name_ru: "Самовывоз из филиала в Намангане (ул. А. Навои, 42)",
      delivery_type: "pickup",
      branch_id: "namangan",
      price_usd: 0,
      free_above_usd: null,
      is_enabled: true,
      sort_order: 1,
    },
    {
      id: "courier_city",
      name_uz: "Shahar bo'ylab kuryer orqali yetkazib berish",
      name_ru: "Курьерская доставка по городу",
      delivery_type: "delivery",
      branch_id: null,
      price_usd: 0,
      free_above_usd: null,
      is_enabled: false, // Disabled until store sets rules
      sort_order: 2,
    },
    {
      id: "regional_delivery",
      name_uz: "Viloyatlar bo'ylab yetkazib berish",
      name_ru: "Доставка по регионам",
      delivery_type: "delivery",
      branch_id: null,
      price_usd: 0,
      free_above_usd: null,
      is_enabled: false, // Disabled until store sets rules
      sort_order: 3,
    },
  ];
  for (const dm of deliveryMethods) {
    const { error: dmError } = await supabase.from("delivery_methods").upsert(dm, { onConflict: "id" });
    if (dmError) console.error("Error seeding delivery method:", dmError);
  }

  // 6b. Promo Codes
  console.log("Seeding initial promo code...");
  const promoCodes = [
    {
      code: "SWISS5",
      type: "percent" as const,
      value: 5,
      min_order_usd: 1000,
      max_discount_usd: 500,
      total_usage_limit: 100,
      per_customer_limit: 1,
      is_active: true,
    },
  ];
  for (const pc of promoCodes) {
    const { error: pcError } = await supabase.from("promo_codes").upsert(pc, { onConflict: "code" });
    if (pcError) console.error("Error seeding promo code:", pcError);
  }

  // 7. SMS Templates
  console.log("Seeding SMS templates...");
  const smsTemplates = [
    {
      id: "order_confirmed",
      template_uz: "SwissWatch: Buyurtmangiz #{order_number} tasdiqlandi. Tez orada bog'lanamiz.",
      template_ru: "SwissWatch: Ваш заказ #{order_number} подтвержден. Скоро свяжемся.",
      is_enabled: true,
    },
    {
      id: "order_ready",
      template_uz: "SwissWatch: Buyurtmangiz #{order_number} {branch} filialida tayyor!",
      template_ru: "SwissWatch: Ваш заказ #{order_number} готов к выдаче в филиале {branch}!",
      is_enabled: true,
    },
  ];
  for (const st of smsTemplates) {
    const { error: stError } = await supabase.from("sms_templates").upsert(st, { onConflict: "id" });
    if (stError) console.error("Error seeding SMS template:", stError);
  }

  // 8. Demo Owner Account (Supabase Auth Admin)
  console.log(`Seeding demo owner account (${adminEmail})...`);
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError);
  } else {
    const existing = usersData.users.find((u) => u.email === adminEmail);
    let userId = existing?.id;
    if (!existing) {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
      });
      if (createError) {
        console.error("Error creating owner user:", createError);
      } else if (newUser?.user) {
        userId = newUser.user.id;
        console.log(`Created new owner auth user: ${userId}`);
      }
    } else {
      console.log(`Owner auth user already exists: ${userId}`);
    }

    if (userId) {
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          email: adminEmail,
          full_name: "Bosh Administrator (Owner)",
          role: "owner",
          is_active: true,
          must_change_password: false, // User configured initial credentials
        },
        { onConflict: "id" }
      );
      if (profileError) console.error("Error creating owner profile:", profileError);
      else console.log("Owner profile seeded successfully with must_change_password = true.");
    }
  }

  console.log("--- Seeding Completed Successfully ---");
}

seed().catch((err) => {
  console.error("Unhandled error in seed script:", err);
  process.exit(1);
});
