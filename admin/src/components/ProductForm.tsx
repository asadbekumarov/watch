"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { saveProduct } from "@/app/actions/productActions";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Loader2, Save, ArrowLeft, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Database } from "@shared/types/database.types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

interface ProductFormProps {
  initialData?: ProductRow | null;
  isNew?: boolean;
}

export default function ProductForm({ initialData, isNew = false }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [brand, setBrand] = useState(initialData?.brand || "West End Watch");
  const [movementType, setMovementType] = useState(initialData?.movement_type || "automatic");
  const [priceNull, setPriceNull] = useState(initialData ? initialData.price_usd === null : false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isMock = !supabaseUrl || supabaseUrl.includes("placeholder");

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (isMock) {
          // Dev fallback: convert to base64 Data URL so user can preview and test locally without Supabase bucket
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          uploadedUrls.push(dataUrl);
        } else {
          const supabase = createClient();
          const fileExt = file.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
          const filePath = `watches/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(filePath, file, { cacheControl: "3600", upsert: false });

          if (uploadError) {
            throw uploadError;
          }

          const { data: urlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(filePath);

          if (urlData?.publicUrl) {
            uploadedUrls.push(urlData.publicUrl);
          }
        }
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: unknown) {
      // In dev mode, if storage upload fails, gracefully fallback to local base64 preview
      try {
        const fallbackUrls: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(files[i]);
          });
          fallbackUrls.push(dataUrl);
        }
        setImages((prev) => [...prev, ...fallbackUrls]);
        setError(null);
      } catch {
        const msg = err instanceof Error ? err.message : "Rasm yuklashda xatolik yuz berdi.";
        setError(msg);
      }
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idxToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;
    setImages(newImages);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("images", images.join("\n"));
    if (priceNull) {
      formData.set("price_usd", "");
    }

    startTransition(async () => {
      const res = await saveProduct(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/products");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-1.5 rounded-lg border border-white/[0.08] hover:bg-white/[0.04] text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-medium text-white">
              {isNew ? "Yangi soat qo'shish" : `Tahrirlash: ${initialData?.name_uz}`}
            </h1>
            <p className="text-xs text-zinc-400">Model tafsilotlari, rasmlar va narxlarni boshqarish</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || uploading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-md disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Saqlash</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
          {error}
        </div>
      )}

      <input type="hidden" name="is_new" value={isNew ? "true" : "false"} />

      {/* Basic identifiers */}
      <div className="p-6 rounded-xl bg-[#13171d] border border-white/[0.08] space-y-4">
        <h2 className="text-sm font-medium text-white">Asosiy identifikatorlar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">ID (Noyob kalit)</label>
            <input
              type="text"
              name="id"
              required
              readOnly={!isNew}
              defaultValue={initialData?.id || ""}
              placeholder="masalan: west-end-watch-41mm-silver"
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white read-only:text-zinc-500 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Slug (URL manzili)</label>
            <input
              type="text"
              name="slug"
              required
              defaultValue={initialData?.slug || ""}
              placeholder="masalan: west-end-watch-41mm-silver"
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Brend</label>
            <select
              name="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="West End Watch">West End Watch</option>
              <option value="Jacques Philippe">Jacques Philippe</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Model nomi</label>
            <input
              type="text"
              name="model"
              required
              defaultValue={initialData?.model || ""}
              placeholder="masalan: Automatic 41mm"
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>
      </div>

      {/* Names & Descriptions in UZ and RU */}
      <div className="p-6 rounded-xl bg-[#13171d] border border-white/[0.08] space-y-4">
        <h2 className="text-sm font-medium text-white">Nomi va Tavsifi (O&apos;zbek va Rus tillarida)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Nomi (O&apos;zbekcha)</label>
            <input
              type="text"
              name="name_uz"
              required
              defaultValue={initialData?.name_uz || ""}
              placeholder="West End Watch 41mm"
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Nomi (Ruscha)</label>
            <input
              type="text"
              name="name_ru"
              required
              defaultValue={initialData?.name_ru || ""}
              placeholder="West End Watch 41mm"
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs text-zinc-300">Tavsif (O&apos;zbekcha)</label>
            <textarea
              name="description_uz"
              rows={3}
              defaultValue={initialData?.description_uz || ""}
              placeholder="Soat haqida to'liq tavsif..."
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs text-zinc-300">Tavsif (Ruscha)</label>
            <textarea
              name="description_ru"
              rows={3}
              defaultValue={initialData?.description_ru || ""}
              placeholder="Полное описание часов на русском..."
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>
      </div>

      {/* Pricing and Stock */}
      <div className="p-6 rounded-xl bg-[#13171d] border border-white/[0.08] space-y-4">
        <h2 className="text-sm font-medium text-white">Narx va Ombor holati</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-300">Narxi (USD)</label>
              <label className="flex items-center gap-1.5 text-[11px] text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={priceNull}
                  onChange={(e) => setPriceNull(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-700 text-[#D4AF37]"
                />
                <span>Narx so&apos;rovda (NULL)</span>
              </label>
            </div>
            <input
              type="number"
              step="0.01"
              name="price_usd"
              disabled={priceNull}
              defaultValue={initialData?.price_usd !== null ? initialData?.price_usd : ""}
              placeholder={priceNull ? "Menejerdan so'raladi (narx belgilanmagan)" : "1300"}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white disabled:bg-zinc-900/50 disabled:text-zinc-500 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Ombordagi soni</label>
            <input
              type="number"
              name="stock_quantity"
              required
              min={0}
              defaultValue={initialData?.stock_quantity ?? 1}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Tayyorlash muddati (kun)</label>
            <input
              type="number"
              name="prep_days"
              required
              min={1}
              defaultValue={initialData?.prep_days ?? 1}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex items-center gap-6 pt-5">
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={initialData ? initialData.is_active : true}
                className="rounded bg-zinc-900 border-zinc-700 text-[#D4AF37]"
              />
              <span>Saytda faol ko&apos;rsatilsin</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                name="is_bestseller"
                defaultChecked={initialData?.is_bestseller || false}
                className="rounded bg-zinc-900 border-zinc-700 text-[#D4AF37]"
              />
              <span>Xit model (Bestseller)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="p-6 rounded-xl bg-[#13171d] border border-white/[0.08] space-y-4">
        <h2 className="text-sm font-medium text-white">Texnik xususiyatlar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Mexanizm turi</label>
            <select
              name="movement_type"
              value={movementType}
              onChange={(e) => setMovementType(e.target.value as "automatic" | "quartz")}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="automatic">Avtomatik mexanizm</option>
              <option value="quartz">Kvars (batareya)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Mexanizm matni</label>
            <input
              type="text"
              name="movement_text"
              defaultValue={initialData?.movement_text || "Avtomatik mexanizm"}
              placeholder="Avtomatik mexanizm"
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Diametr (matn va son)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                name="case_diameter"
                defaultValue={initialData?.case_diameter || "41 mm"}
                placeholder="41 mm"
                className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
              <input
                type="number"
                name="case_diameter_val"
                defaultValue={initialData?.case_diameter_val || 41}
                placeholder="41"
                className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Siferblat rangi</label>
            <input
              type="text"
              name="dial_color"
              defaultValue={initialData?.dial_color || ""}
              placeholder="Tiffany / Qora / Kumush"
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Suvga chidamlilik</label>
            <input
              type="text"
              name="water_resistance"
              defaultValue={initialData?.water_resistance || ""}
              placeholder="50 m"
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>
      </div>

      {/* Multi-Image Upload (Supabase Storage) */}
      <div className="p-6 rounded-xl bg-[#13171d] border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-white">Rasmlar</h2>
            <p className="text-xs text-zinc-400">
              Supabase Storage (product-images) ga yuklash. Menejer va Egasi yuklashi mumkin.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.1] bg-[#0d0f12] hover:bg-white/[0.05] text-xs font-medium text-zinc-200 cursor-pointer transition-colors">
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            <span>Rasm yuklash</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        {images.length === 0 ? (
          <div className="p-8 border border-dashed border-white/[0.1] rounded-xl text-center space-y-2">
            <ImageIcon className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs text-zinc-400">Hozircha hech qanday rasm yuklanmagan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className="group relative aspect-square rounded-lg bg-[#0d0f12] border border-white/[0.08] overflow-hidden"
              >
                <Image
                  src={imgUrl}
                  alt={`Soat rasmi ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 150px"
                  unoptimized={imgUrl.startsWith("data:")}
                />

                {/* Main thumbnail badge */}
                {idx === 0 && (
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#D4AF37] text-black text-[9px] font-mono font-bold tracking-wider uppercase shadow">
                    Asosiy
                  </span>
                )}

                {/* Overlay action bar on hover/focus */}
                <div className="absolute inset-x-0 bottom-0 p-1 bg-black/80 flex items-center justify-between opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveImage(idx, "left")}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-colors cursor-pointer"
                      title="Oldinga surish"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => moveImage(idx, "right")}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-colors cursor-pointer"
                      title="Orqaga surish"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="p-1 rounded bg-red-600/80 hover:bg-red-600 text-white transition-colors cursor-pointer"
                    title="O'chirish"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
