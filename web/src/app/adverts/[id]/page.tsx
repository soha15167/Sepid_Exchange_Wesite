"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, type Advert } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function AdvertDetailPage({ params }: { params: { id: string } }) {
  const { token, user } = useAuth();
  const router = useRouter();
  const [ad, setAd] = useState<Advert | null>(null);
  const [rate, setRate] = useState("");
  const [desc, setDesc] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    apiFetch<Advert>(`/api/adverts/${params.id}`, {}, token).then(setAd).catch((e) => setErr(e.message));
  }, [params.id, token]);

  async function submitOffer(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      router.push("/auth");
      return;
    }
    setMsg("");
    setErr("");
    try {
      await apiFetch(
        `/api/adverts/${params.id}/offers`,
        {
          method: "POST",
          body: JSON.stringify({ rate_toman: Number(rate.replace(/\D/g, "")), description: desc || null }),
        },
        token,
      );
      setMsg("پیشنهاد ثبت شد — صاحب آگهی در تلگرام/سایت مطلع می‌شود.");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "خطا");
    }
  }

  if (!ad && !err) return <p className="text-white/50">بارگذاری...</p>;
  if (err && !ad) return <p className="text-red-300">{err}</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="glass p-6 sm:p-8">
        <p className="text-sm text-brand-300">آگهی #{ad?.id}</p>
        <h1 className="mt-2 text-2xl font-bold">{ad?.operation}</h1>
        <p className="text-white/50">{ad?.owner_name}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-white/40">مقدار یورو</p>
            <p className="text-xl font-bold">{Number(ad?.euro_amount || 0).toLocaleString("fa-IR")}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-white/40">نرخ تومان</p>
            <p className="text-xl font-bold">{Number(ad?.rate_toman || 0).toLocaleString("fa-IR")}</p>
          </div>
        </div>
        <p className="mt-6 leading-8 text-white/70">{ad?.description}</p>
        {ad?.channel_link && (
          <a href={ad.channel_link} target="_blank" rel="noreferrer" className="btn-ghost mt-6 inline-flex">
            مشاهده در کانال
          </a>
        )}
      </div>

      {!ad?.is_mine && (
        <form onSubmit={submitOffer} className="glass space-y-4 p-6">
          <h2 className="text-lg font-bold">ارسال پیشنهاد</h2>
          {!user && <p className="text-sm text-amber-200">برای پیشنهاد ابتدا وارد شوید.</p>}
          <div>
            <label className="label-text">نرخ پیشنهادی (تومان)</label>
            <input className="input-field" value={rate} onChange={(e) => setRate(e.target.value)} required />
          </div>
          <div>
            <label className="label-text">توضیح (اختیاری)</label>
            <textarea className="input-field min-h-[100px]" value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          {err && <p className="text-sm text-red-300">{err}</p>}
          {msg && <p className="text-sm text-brand-200">{msg}</p>}
          <button type="submit" className="btn-primary w-full sm:w-auto">
            ثبت پیشنهاد
          </button>
        </form>
      )}
    </div>
  );
}
