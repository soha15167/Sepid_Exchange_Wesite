"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, type Advert } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function DashboardPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Advert[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth");
      return;
    }
    apiFetch<{ items: Advert[] }>("/api/adverts/mine", {}, token).then((d) => setItems(d.items));
  }, [user, token, loading, router]);

  if (loading || !user) return <p className="text-white/50">...</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">سلام، {user.display_name}</h1>
          <p className="text-sm text-white/50">
            {user.has_telegram ? "حساب متصل به تلگرام" : "حساب وب — قابل اتصال به ربات بعداً"}
          </p>
        </div>
        <Link href="/dashboard/new-advert" className="btn-primary">
          آگهی جدید
        </Link>
      </div>

      <section className="glass p-6">
        <h2 className="mb-4 font-bold">آگهی‌های من</h2>
        {items.length === 0 ? (
          <p className="text-white/50">هنوز آگهی ندارید.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((ad) => (
              <li
                key={ad.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div>
                  <p className="font-semibold">
                    #{ad.id} · {ad.operation}
                  </p>
                  <p className="text-sm text-white/50">
                    {Number(ad.euro_amount || 0).toLocaleString("fa-IR")} € —{" "}
                    {Number(ad.rate_toman || 0).toLocaleString("fa-IR")} تومان
                  </p>
                </div>
                <Link href={`/adverts/${ad.id}`} className="btn-ghost py-2 text-xs">
                  مشاهده
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
