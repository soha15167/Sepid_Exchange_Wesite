"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, Lock } from "lucide-react";
import { apiFetch, type Advert } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function AdvertsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Advert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<{ items: Advert[] }>("/api/adverts?page=0&limit=30", {}, token)
      .then((d) => setItems(d.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">آگهی‌های فعال</h1>
          <p className="mt-2 text-sm text-white/50">منتشرشده در کانال Sepid Exchange</p>
        </div>
        <Link href="/dashboard/new-advert" className="btn-primary">
          ثبت آگهی جدید
        </Link>
      </div>

      {loading && <p className="text-white/50">در حال بارگذاری...</p>}
      {error && <p className="text-red-300">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((ad, i) => (
          <motion.article
            key={ad.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass group flex flex-col p-5"
          >
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-brand-300">#{ad.id}</p>
                <h2 className="mt-1 font-bold text-white">{ad.operation || "—"}</h2>
                <p className="text-sm text-white/50">{ad.owner_name}</p>
              </div>
              {ad.locked && <Lock className="h-4 w-4 text-amber-400" />}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-white/40">مقدار</p>
                <p className="font-semibold">{Number(ad.euro_amount || 0).toLocaleString("fa-IR")} €</p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-white/40">نرخ</p>
                <p className="font-semibold">{Number(ad.rate_toman || 0).toLocaleString("fa-IR")}</p>
              </div>
            </div>
            <p className="mt-4 line-clamp-2 flex-1 text-sm text-white/60">{ad.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={`/adverts/${ad.id}`} className="btn-primary flex-1 py-2 text-xs">
                جزئیات / پیشنهاد
              </Link>
              {ad.channel_link && (
                <a
                  href={ad.channel_link}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost p-2"
                  aria-label="کانال"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
