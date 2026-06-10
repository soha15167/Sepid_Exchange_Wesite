"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { apiFetch, fmtNum, type Offer } from "@/lib/api";
import { offerStatusLabel } from "@/components/IncomingOffersPanel";

type Props = {
  advertId: number;
  token: string | null;
};

export function OwnerOffersPanel({ advertId, token }: Props) {
  const [items, setItems] = useState<Offer[]>([]);
  const [busy, setBusy] = useState<number | null>(null);
  const [err, setErr] = useState("");

  function reload() {
    if (!token) return;
    apiFetch<{ items: Offer[] }>(`/api/adverts/${advertId}/offers`, {}, token)
      .then((d) => setItems(d.items))
      .catch((e) => setErr(e.message));
  }

  useEffect(() => {
    reload();
  }, [advertId, token]);

  async function act(id: number, action: "accept" | "reject") {
    if (!token) return;
    setBusy(id);
    setErr("");
    try {
      await apiFetch(`/api/offers/${id}/${action}`, { method: "POST" }, token);
      reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "خطا");
    } finally {
      setBusy(null);
    }
  }

  const pending = items.filter((o) => (o.status || "pending") === "pending");

  return (
    <section id="offers" className="glass scroll-mt-24 p-4 sm:p-6">
      <h2 className="mb-4 font-bold">پیشنهادهای این آگهی</h2>
      {err && <p className="mb-3 text-sm text-red-300">{err}</p>}
      {items.length === 0 ? (
        <p className="text-sm text-white/50">هنوز پیشنهادی دریافت نشده.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((o) => {
            const isPending = (o.status || "pending") === "pending";
            return (
              <li key={o.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      #{o.seq} · {o.proposer_name}
                    </p>
                    {!o.skips_toman_rate && (
                      <p className="text-sm">{fmtNum(o.rate_toman)} تومان</p>
                    )}
                    {o.proposed_euro_amount ? (
                      <p className="text-xs text-brand-200">
                        مقدار: {fmtNum(o.proposed_euro_amount)} €
                      </p>
                    ) : null}
                    {o.description && <p className="mt-1 text-sm text-white/70">{o.description}</p>}
                    <p className="mt-1 text-xs text-white/40">{offerStatusLabel(o.status)}</p>
                  </div>
                  {isPending && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busy === o.id}
                        onClick={() => act(o.id, "accept")}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-500/30 px-3 py-2 text-xs text-brand-100"
                      >
                        <Check className="h-3.5 w-3.5" />
                        پذیرش
                      </button>
                      <button
                        type="button"
                        disabled={busy === o.id}
                        onClick={() => act(o.id, "reject")}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-400/30 px-3 py-2 text-xs text-red-200"
                      >
                        <X className="h-3.5 w-3.5" />
                        رد
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {pending.length === 0 && items.length > 0 && (
        <p className="mt-3 text-xs text-white/40">پیشنهاد در انتظار تأیید ندارید.</p>
      )}
    </section>
  );
}
