"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const METHODS = ["حواله", "نقد", "کارت", "پی‌پال", "Wise", "Revolut"];

export default function NewAdvertPage() {
  const { token, user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    operation: "فروش",
    euro_amount: "",
    rate_toman: "",
    description: "",
    methods: [] as string[],
    account_country: "",
    instant_transfer: "unknown",
  });
  const [err, setErr] = useState("");

  if (!loading && !user) {
    router.replace("/auth");
  }

  function toggleMethod(m: string) {
    setForm((f) => ({
      ...f,
      methods: f.methods.includes(m) ? f.methods.filter((x) => x !== m) : [...f.methods, m],
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      await apiFetch(
        "/api/adverts",
        {
          method: "POST",
          body: JSON.stringify({
            operation: form.operation,
            euro_amount: Number(form.euro_amount.replace(/\D/g, "")),
            rate_toman: Number(form.rate_toman.replace(/\D/g, "")),
            description: form.description,
            methods: form.methods,
            account_country: form.account_country,
            instant_transfer: form.operation === "فروش" ? form.instant_transfer : null,
          }),
        },
        token,
      );
      router.push("/dashboard");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "خطا");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={submit} className="glass space-y-5 p-6 sm:p-8">
        <h1 className="text-2xl font-bold">ثبت آگهی جدید</h1>
        <p className="text-sm text-white/50">پس از تأیید، آگهی در کانال تلگرام منتشر می‌شود.</p>

        <div>
          <label className="label-text">نوع</label>
          <select
            className="input-field"
            value={form.operation}
            onChange={(e) => setForm({ ...form, operation: e.target.value })}
          >
            <option value="فروش">فروش یورو</option>
            <option value="خرید">خرید یورو</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-text">مقدار یورو</label>
            <input
              className="input-field"
              value={form.euro_amount}
              onChange={(e) => setForm({ ...form, euro_amount: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label-text">نرخ (تومان)</label>
            <input
              className="input-field"
              value={form.rate_toman}
              onChange={(e) => setForm({ ...form, rate_toman: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="label-text">کشور حساب</label>
          <input
            className="input-field"
            value={form.account_country}
            onChange={(e) => setForm({ ...form, account_country: e.target.value })}
            required
          />
        </div>

        {form.operation === "فروش" && (
          <div>
            <label className="label-text">واریز آنی</label>
            <select
              className="input-field"
              value={form.instant_transfer}
              onChange={(e) => setForm({ ...form, instant_transfer: e.target.value })}
            >
              <option value="have">دارم</option>
              <option value="dont_have">ندارم</option>
              <option value="unknown">اطلاعی ندارم</option>
            </select>
          </div>
        )}

        <div>
          <label className="label-text">روش پرداخت / دریافت</label>
          <div className="flex flex-wrap gap-2">
            {METHODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => toggleMethod(m)}
                className={
                  form.methods.includes(m)
                    ? "rounded-lg bg-brand-500/30 px-3 py-1.5 text-sm text-brand-100"
                    : "rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/60"
                }
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label-text">توضیحات</label>
          <textarea
            className="input-field min-h-[120px]"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>

        {err && <p className="text-sm text-red-300">{err}</p>}
        <button type="submit" className="btn-primary w-full">
          انتشار در کانال
        </button>
      </form>
    </div>
  );
}
